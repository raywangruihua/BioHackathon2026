library(plumber)
library(xgboost)
library(jsonlite)

`%||%` <- function(a, b) if (!is.null(a) && length(a) > 0 && !is.na(a[1])) a else b

# Model files are in the same directory as plumber.R
MODEL_DIR <- getwd()

#* @apiTitle Pearl Screening API
#* @apiDescription Stage 1 partial screening for PCOS and Endometriosis

#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 204
    return(list())
  }
  plumber::forward()
}

# ── Label and formatting helpers ──────────────────────────────────────────────

PLAIN_PCOS <- c(
  Age..yrs.             = "Age",
  Weight..Kg.           = "Body weight (kg)",
  Height.Cm.            = "Height (cm)",
  BMI                   = "BMI",
  Blood.Group           = "Blood group",
  Cycle.R.I.            = "Menstrual cycle",
  Cycle.length.days.    = "Cycle length (days)",
  Marraige.Status..Yrs. = "Years married",
  Pregnant.Y.N.         = "Pregnant",
  No..of.abortions      = "Prior pregnancies",
  Hip.inch.             = "Hip circumference (in)",
  Waist.inch.           = "Waist circumference (in)",
  Waist.Hip.Ratio       = "Waist-to-hip ratio",
  Weight.gain.Y.N.      = "Weight gain",
  hair.growth.Y.N.      = "Excessive hair growth",
  Skin.darkening..Y.N.  = "Skin darkening",
  Hair.loss.Y.N.        = "Hair loss",
  Pimples.Y.N.          = "Acne / pimples",
  Fast.food..Y.N.       = "Frequent fast food",
  Reg.Exercise.Y.N.     = "Regular exercise"
)

PLAIN_ENDO <- c(
  Age                    = "Age",
  BMI                    = "BMI",
  Cycle_Length           = "Cycle length (days)",
  Age_of_Menarche        = "Age of menarche",
  Dysmenorrhea_Score     = "Dysmenorrhea score",
  Pelvic_Pain_Score      = "Pelvic pain score",
  Dyspareunia_Score      = "Dyspareunia score",
  Dyschezia_Score        = "Dyschezia score",
  Urinary_Symptoms_Score = "Urinary symptoms",
  Family_History         = "Family history of endometriosis",
  Infertility_Status     = "Infertility history"
)

BINARY_FEATURES <- c(
  "Pregnant.Y.N.", "Weight.gain.Y.N.", "hair.growth.Y.N.",
  "Skin.darkening..Y.N.", "Hair.loss.Y.N.", "Pimples.Y.N.",
  "Fast.food..Y.N.", "Reg.Exercise.Y.N.", "Family_History", "Infertility_Status"
)

get_plain_label <- function(feat, dict) {
  as.character(if (feat %in% names(dict)) unname(dict[feat]) else trimws(gsub("\\.+", " ", feat)))
}

format_feat_val <- function(feat, val) {
  if (feat == "Cycle.R.I.") return(if (val == 4) "Irregular" else "Regular")
  if (feat %in% BINARY_FEATURES) return(if (val == 1) "Yes" else "No")
  sprintf("%.2f", val)
}

build_shap_list <- function(phi, x_vals, pca_obj = NULL, plain_dict, top_n = 5L) {
  ord     <- order(abs(phi), decreasing = TRUE)
  phi_ord <- phi[ord]
  # unname so lapply returns an unnamed list → JSON array, not JSON object
  toward  <- unname(head(names(phi_ord)[phi_ord >  0], top_n))
  away    <- unname(head(names(phi_ord)[phi_ord <= 0], top_n))

  make_entry <- function(f) {
    val <- as.numeric(x_vals[f])
    z   <- if (!is.null(pca_obj) && f %in% names(pca_obj$center))
             (val - pca_obj$center[f]) / pca_obj$scale[f]
           else
             NA_real_
    list(
      feature   = f,
      label     = get_plain_label(f, plain_dict),
      value     = val,
      formatted = format_feat_val(f, val),
      phi       = round(unname(phi[f]), 4),
      z         = if (is.na(z)) NULL else round(z, 2)
    )
  }

  list(
    toward = lapply(toward, make_entry),
    away   = lapply(away,   make_entry)
  )
}

#* Run Stage 1 partial screening for PCOS and Endometriosis
#* @post /stage1
function(req, res) {
  body <- tryCatch(jsonlite::fromJSON(req$postBody, simplifyVector = TRUE), error = function(e) NULL)
  if (is.null(body)) {
    res$status <- 400
    return(list(error = "Invalid JSON body"))
  }

  # ── Extract inputs (all with safe defaults) ──────────────────────────────
  age          <- as.numeric(body$age          %||% 25)
  weight       <- as.numeric(body$weight       %||% 65)
  height       <- as.numeric(body$height       %||% 162)
  bmi          <- as.numeric(body$bmi          %||% round(weight / (height / 100)^2, 1))
  blood_group  <- as.numeric(body$blood_group  %||% 15)
  cycle        <- as.numeric(body$cycle        %||% 2)
  cycle_length <- as.numeric(body$cycle_length %||% 28)
  marriage_yrs <- as.numeric(body$marriage_yrs %||% 0)
  pregnant     <- as.numeric(body$pregnant     %||% 0)
  abortions    <- as.numeric(body$abortions    %||% 0)
  hip          <- as.numeric(body$hip          %||% 38)
  waist        <- as.numeric(body$waist        %||% 31)
  waist_hip    <- as.numeric(body$waist_hip    %||% round(waist / hip, 3))
  weight_gain  <- as.numeric(body$weight_gain  %||% 0)
  hair_growth  <- as.numeric(body$hair_growth  %||% 0)
  skin_dark    <- as.numeric(body$skin_dark    %||% 0)
  hair_loss    <- as.numeric(body$hair_loss    %||% 0)
  pimples      <- as.numeric(body$pimples      %||% 0)
  fast_food    <- as.numeric(body$fast_food    %||% 0)
  exercise     <- as.numeric(body$exercise     %||% 0)

  age_menarche <- as.numeric(body$age_menarche %||% 13)
  dysmenorrhea <- as.numeric(body$dysmenorrhea %||% 0)
  pelvic_pain  <- as.numeric(body$pelvic_pain  %||% 0)
  dyspareunia  <- as.numeric(body$dyspareunia  %||% 0)
  dyschezia    <- as.numeric(body$dyschezia    %||% 0)
  urinary      <- as.numeric(body$urinary      %||% 0)
  family_hist  <- as.numeric(body$family_hist  %||% 0)
  infertility  <- as.numeric(body$infertility  %||% 0)

  # ── Load models ──────────────────────────────────────────────────────────
  partial_pca        <- readRDS(file.path(MODEL_DIR, "partial_pcos_pca_model.rds"))
  partial_features   <- readRDS(file.path(MODEL_DIR, "partial_pcos_feature_names.rds"))
  partial_n_pcs      <- readRDS(file.path(MODEL_DIR, "partial_pcos_n_pcs.rds"))
  partial_pcos_model <- xgb.load(file.path(MODEL_DIR, "partial_pcos_xgboost_model.json"))

  partial_endo_features <- readRDS(file.path(MODEL_DIR, "partial_endo_feature_names.rds"))
  partial_endo_model    <- xgb.load(file.path(MODEL_DIR, "partial_endo_xgboost_tuned.json"))

  # ── Partial PCOS inference ───────────────────────────────────────────────
  partial_pcos_input <- data.frame(
    Age..yrs.             = age,
    Weight..Kg.           = weight,
    Height.Cm.            = height,
    BMI                   = bmi,
    Blood.Group           = blood_group,
    Cycle.R.I.            = cycle,
    Cycle.length.days.    = cycle_length,
    Marraige.Status..Yrs. = marriage_yrs,
    Pregnant.Y.N.         = pregnant,
    No..of.abortions      = abortions,
    Hip.inch.             = hip,
    Waist.inch.           = waist,
    Waist.Hip.Ratio       = waist_hip,
    Weight.gain.Y.N.      = weight_gain,
    hair.growth.Y.N.      = hair_growth,
    Skin.darkening..Y.N.  = skin_dark,
    Hair.loss.Y.N.        = hair_loss,
    Pimples.Y.N.          = pimples,
    Fast.food..Y.N.       = fast_food,
    Reg.Exercise.Y.N.     = exercise
  )

  partial_pcos_input <- partial_pcos_input[, partial_features, drop = FALSE]
  partial_scaled     <- scale(partial_pcos_input, center = partial_pca$center, scale = partial_pca$scale)
  partial_pcs        <- as.matrix(partial_scaled) %*% partial_pca$rotation[, seq_len(partial_n_pcs)]
  partial_pcos_dmat  <- xgb.DMatrix(as.matrix(partial_pcs))
  partial_pcos_prob  <- predict(partial_pcos_model, partial_pcos_dmat)

  # ── Partial Endo inference ───────────────────────────────────────────────
  partial_endo_input <- data.frame(
    Age                    = age,
    BMI                    = bmi,
    Cycle_Length           = cycle_length,
    Age_of_Menarche        = age_menarche,
    Dysmenorrhea_Score     = dysmenorrhea,
    Pelvic_Pain_Score      = pelvic_pain,
    Dyspareunia_Score      = dyspareunia,
    Dyschezia_Score        = dyschezia,
    Urinary_Symptoms_Score = urinary,
    Family_History         = family_hist,
    Infertility_Status     = infertility
  )

  partial_endo_input <- partial_endo_input[, partial_endo_features, drop = FALSE]
  partial_endo_dmat  <- xgb.DMatrix(as.matrix(partial_endo_input))
  partial_endo_prob  <- predict(partial_endo_model, partial_endo_dmat)

  # ── SHAP — PCOS (PCA inverse-projected back to original feature space) ────
  pcos_shap_raw <- predict(partial_pcos_model, partial_pcos_dmat, predcontrib = TRUE)
  pcos_phi      <- as.vector(
    partial_pca$rotation[, seq_len(partial_n_pcs), drop = FALSE] %*%
    pcos_shap_raw[1L, seq_len(partial_n_pcs)]
  )
  names(pcos_phi) <- partial_features
  pcos_x_vals     <- setNames(as.numeric(partial_pcos_input[1L, ]), partial_features)
  pcos_shap       <- build_shap_list(pcos_phi, pcos_x_vals, partial_pca, PLAIN_PCOS)

  # ── SHAP — Endo (direct, no PCA) ─────────────────────────────────────────
  endo_shap_raw   <- predict(partial_endo_model, partial_endo_dmat, predcontrib = TRUE)
  endo_phi        <- endo_shap_raw[1L, seq_len(ncol(partial_endo_input))]
  names(endo_phi) <- colnames(partial_endo_input)
  endo_x_vals     <- setNames(as.numeric(partial_endo_input[1L, ]), colnames(partial_endo_input))
  endo_shap       <- build_shap_list(endo_phi, endo_x_vals, NULL, PLAIN_ENDO)

  # ── Return results ───────────────────────────────────────────────────────
  list(
    pcosProb  = round(as.numeric(partial_pcos_prob) * 100, 1),
    pcosClass = ifelse(partial_pcos_prob > 0.5, "PCOS Positive", "PCOS Negative"),
    endoProb  = round(as.numeric(partial_endo_prob) * 100, 1),
    endoClass = ifelse(partial_endo_prob > 0.5, "Endometriosis Positive", "Endometriosis Negative"),
    pcosShap  = pcos_shap,
    endoShap  = endo_shap
  )
}
