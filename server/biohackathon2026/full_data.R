rm(list = ls())
library(rstudioapi)
library(ggplot2)
library(xgboost)
library(caret)
library(pROC)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# -----------------------------
# LOAD DATA
# -----------------------------
pcos_df <- read.csv(
  "main_data_full.csv",
  stringsAsFactors = FALSE
)

# -----------------------------
# LABEL
# -----------------------------
group <- pcos_df$PCOS..Y.N.

# -----------------------------
# REMOVE LABEL + ID COLUMNS ONLY
# (data is already pre-cleaned)
# -----------------------------
feature_df <- pcos_df[, !(colnames(pcos_df) %in% c(
  "PCOS..Y.N."
))]

# -----------------------------
# KEEP NUMERIC ONLY
# -----------------------------
numeric_df <- feature_df[, sapply(feature_df, is.numeric)]

# -----------------------------
# COMBINE + CLEAN NA
# -----------------------------
combined_df <- cbind(numeric_df, Group = group)
combined_df <- na.omit(combined_df)
group_clean <- combined_df$Group
numeric_clean <- combined_df[, !(colnames(combined_df) %in% "Group")]

cat("Features going into PCA:", ncol(numeric_clean), "\n")
cat("Feature names:\n")
print(colnames(numeric_clean))

# -----------------------------
# PCA
# -----------------------------
pca_result <- prcomp(numeric_clean, center = TRUE, scale. = TRUE)

saveRDS(pca_result, "pcos_pca_model.rds")
saveRDS(colnames(numeric_clean), "pcos_feature_names.rds")

# Check cumulative variance to choose number of PCs
cumulative_variance <- summary(pca_result)$importance[3, ] * 100
print(round(cumulative_variance, 2))

# Automatically pick PCs that explain >= 80% variance
n_pcs <- which(cumulative_variance >= 80)[1]
cat("\nPCs needed for 80% variance:", n_pcs, "\n")

# Safety cap — cannot exceed total available PCs
n_pcs <- min(n_pcs, ncol(pca_result$x))
cat("Using", n_pcs, "PCs for training\n")

pc_matrix <- pca_result$x[, 1:n_pcs]

saveRDS(n_pcs, "pcos_n_pcs.rds")

# -----------------------------
# PCA VISUALISATION
# -----------------------------
pca_plot_df <- as.data.frame(pca_result$x[, 1:2])
pca_plot_df$Group <- ifelse(group_clean %in% c("Y", "Yes", "YES", 1), "PCOS", "No PCOS")

# PC1 vs PC2 scatter
ggplot(pca_plot_df, aes(x = PC1, y = PC2, color = Group)) +
  geom_point(alpha = 0.6, size = 2) +
  scale_color_manual(values = c("PCOS" = "#E74C3C", "No PCOS" = "#2E86C1")) +
  labs(
    title = "PCA — PC1 vs PC2",
    x = paste0("PC1 (", round(summary(pca_result)$importance[2, 1] * 100, 1), "% variance)"),
    y = paste0("PC2 (", round(summary(pca_result)$importance[2, 2] * 100, 1), "% variance)")
  ) +
  theme_minimal()

# Scree plot
variance_df <- data.frame(
  PC         = 1:min(n_pcs + 5, ncol(pca_result$x)),
  Variance   = summary(pca_result)$importance[2, 1:min(n_pcs + 5, ncol(pca_result$x))] * 100,
  Cumulative = cumulative_variance[1:min(n_pcs + 5, ncol(pca_result$x))]
)

ggplot(variance_df, aes(x = PC)) +
  geom_bar(aes(y = Variance), stat = "identity", fill = "#2E86C1", alpha = 0.7) +
  geom_line(aes(y = Cumulative), color = "#E74C3C", linewidth = 1) +
  geom_point(aes(y = Cumulative), color = "#E74C3C", size = 2) +
  geom_hline(yintercept = 80, linetype = "dashed", color = "gray40") +
  scale_x_continuous(breaks = variance_df$PC) +
  labs(
    title   = "Scree Plot — Variance Explained by Each PC",
    x       = "Principal Component",
    y       = "% Variance Explained",
    caption = "Red line = cumulative variance | Dashed = 80% threshold"
  ) +
  theme_minimal()

# -----------------------------
# LABEL ENCODING
# -----------------------------
label <- ifelse(group_clean %in% c("Y", "Yes", "YES", 1), 1, 0)

# -----------------------------
# TRAIN / TEST SPLIT
# -----------------------------
set.seed(123)
train_index <- createDataPartition(label, p = 0.8, list = FALSE)
train_x <- pc_matrix[train_index, ]
test_x  <- pc_matrix[-train_index, ]
train_y <- label[train_index]
test_y  <- label[-train_index]

# -----------------------------
# XGBOOST FORMAT
# -----------------------------
dtrain <- xgb.DMatrix(as.matrix(train_x), label = train_y)
dtest  <- xgb.DMatrix(as.matrix(test_x),  label = test_y)

# -----------------------------
# MODEL TRAINING
# -----------------------------
params <- list(
  objective        = "binary:logistic",
  eval_metric      = "logloss",
  eta              = 0.1,
  max_depth        = 4,
  subsample        = 0.8,
  colsample_bytree = 0.8
)

xgb_model <- xgb.train(
  params               = params,
  data                 = dtrain,
  nrounds              = 200,
  watchlist            = list(train = dtrain, test = dtest),
  verbose              = 1,
  early_stopping_rounds = 20
)

# -----------------------------
# SAVE MODEL
# -----------------------------
xgb.save(xgb_model, "pcos_xgboost_model.json")

# -----------------------------
# PREDICTIONS
# -----------------------------
pred_prob  <- predict(xgb_model, dtest)
pred_class <- ifelse(pred_prob > 0.5, 1, 0)

# -----------------------------
# EVALUATION
# -----------------------------
conf_matrix <- table(Predicted = pred_class, Actual = test_y)
print(conf_matrix)

accuracy <- mean(pred_class == test_y)
cat("\nAccuracy:", round(accuracy * 100, 2), "%\n")

roc_obj <- roc(test_y, pred_prob)
cat("AUC:", round(auc(roc_obj), 3), "\n")

# -----------------------------
# ROC CURVE
# -----------------------------
plot(
  roc_obj,
  col  = "blue",
  lwd  = 3,
  main = "ROC Curve - XGBoost (PCOS Prediction)"
)
abline(a = 0, b = 1, lty = 2, col = "gray")