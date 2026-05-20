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
endo_df <- read.csv("full_endometriosis_data.csv", stringsAsFactors = FALSE)

cat("Dimensions:", nrow(endo_df), "rows x", ncol(endo_df), "cols\n")

# -----------------------------
# LABEL + FEATURES
# -----------------------------
label_raw <- endo_df$Diagnosis
label     <- as.numeric(as.factor(label_raw)) - 1

feature_cols <- c("Age", "BMI", "Cycle_Length", "Age_of_Menarche",
                  "Dysmenorrhea_Score", "Pelvic_Pain_Score", "Dyspareunia_Score",
                  "Dyschezia_Score", "Urinary_Symptoms_Score", "Family_History",
                  "Infertility_Status", "CA_125_Level", "CRP_Level",
                  "Mental_Health_Score")

feature_df    <- as.data.frame(lapply(endo_df[, feature_cols], as.numeric))
combined_df   <- cbind(feature_df, Label = label)
combined_df   <- na.omit(combined_df)
label_clean   <- combined_df$Label
feature_clean <- combined_df[, feature_cols]

cat("\nClass distribution:\n")
print(table(label_clean))
pos_count            <- sum(label_clean == 1)
neg_count            <- sum(label_clean == 0)
scale_pos_weight_val <- neg_count / pos_count
cat("scale_pos_weight:", round(scale_pos_weight_val, 3), "\n")
cat("Clean samples   :", nrow(feature_clean), "\n\n")

# -----------------------------
# TRAIN / TEST SPLIT
# -----------------------------
set.seed(123)
train_index <- createDataPartition(label_clean, p = 0.8, list = FALSE)
train_x <- as.matrix(feature_clean[train_index,  feature_cols])
test_x  <- as.matrix(feature_clean[-train_index, feature_cols])
train_y <- label_clean[train_index]
test_y  <- label_clean[-train_index]

cat("Train size:", nrow(train_x), "| Test size:", nrow(test_x), "\n\n")

dtrain <- xgb.DMatrix(train_x, label = train_y)
dtest  <- xgb.DMatrix(test_x,  label = test_y)

# -----------------------------
# RANDOM HYPERPARAMETER SEARCH
# -----------------------------
set.seed(42)
n_trials <- 60

param_grid <- data.frame(
  eta              = runif(n_trials, 0.01, 0.3),
  max_depth        = sample(3:8,  n_trials, replace = TRUE),
  subsample        = runif(n_trials, 0.5, 1.0),
  colsample_bytree = runif(n_trials, 0.5, 1.0),
  min_child_weight = sample(1:10, n_trials, replace = TRUE),
  gamma            = runif(n_trials, 0, 5),
  lambda           = runif(n_trials, 0, 5),
  alpha            = runif(n_trials, 0, 2)
)

cat("Running random search over", n_trials, "trials...\n\n")

best_auc     <- 0
best_params  <- NULL
best_nrounds <- 0
results      <- list()

for (i in 1:n_trials) {
  params <- list(
    objective        = "binary:logistic",
    eval_metric      = "auc",
    eta              = param_grid$eta[i],
    max_depth        = param_grid$max_depth[i],
    subsample        = param_grid$subsample[i],
    colsample_bytree = param_grid$colsample_bytree[i],
    min_child_weight = param_grid$min_child_weight[i],
    gamma            = param_grid$gamma[i],
    lambda           = param_grid$lambda[i],
    alpha            = param_grid$alpha[i],
    scale_pos_weight = scale_pos_weight_val
  )
  
  cv_result <- xgb.cv(
    params                = params,
    data                  = dtrain,
    nrounds               = 500,
    nfold                 = 5,
    stratified            = TRUE,
    early_stopping_rounds = 30,
    verbose               = 0
  )
  
  best_iter   <- which.max(cv_result$evaluation_log$test_auc_mean)
  best_cv_auc <- max(cv_result$evaluation_log$test_auc_mean)
  results[[i]] <- list(params = params, auc = best_cv_auc, nrounds = best_iter)
  
  cat(sprintf("Trial %2d/%d | AUC: %.4f | depth: %d | eta: %.3f | rounds: %d\n",
              i, n_trials, best_cv_auc,
              param_grid$max_depth[i],
              param_grid$eta[i],
              best_iter))
  
  if (best_cv_auc > best_auc) {
    best_auc     <- best_cv_auc
    best_params  <- params
    best_nrounds <- best_iter
  }
}

cat("\n========================================\n")
cat("Best CV AUC :", round(best_auc, 4), "\n")
cat("Best rounds :", best_nrounds, "\n")
cat("Best params :\n")
print(best_params)
cat("========================================\n\n")

# -----------------------------
# TRAIN FINAL MODEL
# -----------------------------
cat("Training final model...\n")

final_model <- xgb.train(
  params    = best_params,
  data      = dtrain,
  nrounds   = best_nrounds,
  watchlist = list(train = dtrain, test = dtest),
  verbose   = 1
)

xgb.save(final_model, "full_endo_xgboost_tuned.json")
saveRDS(feature_cols, "full_endo_feature_names.rds")
saveRDS(best_params,  "full_endo_best_params.rds")
saveRDS(best_nrounds, "full_endo_best_nrounds.rds")

# -----------------------------
# PREDICTIONS + EVALUATION
# -----------------------------
pred_prob  <- predict(final_model, dtest)
pred_class <- ifelse(pred_prob > 0.5, 1, 0)

conf_matrix <- table(Predicted = pred_class, Actual = test_y)
cat("\nConfusion Matrix:\n")
print(conf_matrix)

TP <- conf_matrix[2, 2]
TN <- conf_matrix[1, 1]
FP <- conf_matrix[2, 1]
FN <- conf_matrix[1, 2]

accuracy    <- mean(pred_class == test_y)
sensitivity <- TP / (TP + FN)
specificity <- TN / (TN + FP)
precision   <- TP / (TP + FP)
f1_score    <- 2 * (precision * sensitivity) / (precision + sensitivity)
roc_obj     <- roc(test_y, pred_prob)
test_auc    <- auc(roc_obj)

cat("\n--- Final Model Performance ---\n")
cat("Accuracy   :", round(accuracy    * 100, 2), "%\n")
cat("Sensitivity:", round(sensitivity * 100, 2), "%\n")
cat("Specificity:", round(specificity * 100, 2), "%\n")
cat("Precision  :", round(precision   * 100, 2), "%\n")
cat("F1 Score   :", round(f1_score    * 100, 2), "%\n")
cat("AUC        :", round(test_auc, 3), "\n")

# -----------------------------
# ROC CURVE
# -----------------------------
roc_df <- data.frame(
  specificity = rev(roc_obj$specificities),
  sensitivity = rev(roc_obj$sensitivities)
)

ggplot(roc_df, aes(x = 1 - specificity, y = sensitivity)) +
  geom_line(color = "#E74C3C", linewidth = 1.2) +
  geom_abline(slope = 1, intercept = 0, linetype = "dashed", color = "gray50") +
  annotate("text", x = 0.65, y = 0.15, size = 4.5, color = "#E74C3C",
           label = paste0("AUC = ", round(test_auc, 3))) +
  labs(
    title = "ROC Curve — Tuned XGBoost (Endometriosis)",
    x     = "1 - Specificity (False Positive Rate)",
    y     = "Sensitivity (True Positive Rate)"
  ) +
  theme_minimal()

# -----------------------------
# SEARCH RESULTS PLOT
# -----------------------------
trial_aucs <- sapply(results, function(r) r$auc)

ggplot(data.frame(Trial = 1:n_trials, AUC = trial_aucs), aes(x = Trial, y = AUC)) +
  geom_point(color = "#2E86C1", alpha = 0.7, size = 2) +
  geom_hline(yintercept = best_auc, linetype = "dashed", color = "#E74C3C") +
  annotate("text", x = n_trials * 0.7, y = best_auc + 0.003,
           label = paste0("Best: ", round(best_auc, 4)), color = "#E74C3C") +
  labs(title = "Random Search — CV AUC per Trial", x = "Trial", y = "AUC") +
  theme_minimal()

# -----------------------------
# FEATURE IMPORTANCE
# -----------------------------
importance_matrix <- xgb.importance(feature_names = feature_cols, model = final_model)
cat("\nFeature Importance:\n")
print(importance_matrix)

xgb.plot.importance(
  importance_matrix,
  main = "Feature Importance — Endometriosis XGBoost",
  col  = "#2E86C1"
)