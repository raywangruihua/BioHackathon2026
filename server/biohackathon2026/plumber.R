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

PLAIN_PCOS_FULL <- c(
  Age..yrs.             = "Age",
  Weight..Kg.           = "Body weight (kg)",
  Height.Cm.            = "Height (cm)",
  BMI                   = "BMI",
  Blood.Group           = "Blood group",
  Pulse.rate.bpm.       = "Pulse rate (bpm)",
  RR..breaths.min.      = "Breathing rate (breaths/min)",
  Hb.g.dl.              = "Haemoglobin (g/dL)",
  Cycle.R.I.            = "Menstrual cycle",
  Cycle.length.days.    = "Cycle length (days)",
  Marraige.Status..Yrs. = "Years married",
  Pregnant.Y.N.         = "Pregnant",
  No..of.abortions      = "Prior pregnancies",
  I...beta.HCG.mIU.mL.  = "Beta-HCG I (mIU/mL)",
  II...beta.HCG.mIU.mL. = "Beta-HCG II (mIU/mL)",
  FSH.mIU.mL.           = "FSH (mIU/mL)",
  LH.mIU.mL.            = "LH (mIU/mL)",
  FSH.LH                = "FSH/LH ratio",
  Hip.inch.             = "Hip circumference (in)",
  Waist.inch.           = "Waist circumference (in)",
  Waist.Hip.Ratio       = "Waist-to-hip ratio",
  TSH..mIU.L.           = "TSH (mIU/L)",
  AMH.ng.mL             = "AMH (ng/mL)",
  PRL.ng.mL.            = "Prolactin (ng/mL)",
  Vit.D3..ng.mL.        = "Vitamin D (ng/mL)",
  PRG.ng.mL.            = "Progesterone (ng/mL)",
  RBS.mg.dl.            = "Blood sugar (mg/dL)",
  Weight.gain.Y.N.      = "Weight gain",
  hair.growth.Y.N.      = "Excessive hair growth",
  Skin.darkening..Y.N.  = "Skin darkening",
  Hair.loss.Y.N.        = "Hair loss",
  Pimples.Y.N.          = "Acne / pimples",
  Fast.food..Y.N.       = "Frequent fast food",
  Reg.Exercise.Y.N.     = "Regular exercise",
  BP._Systolic..mmHg.   = "Systolic BP (mmHg)",
  BP._Diastolic..mmHg.  = "Diastolic BP (mmHg)",
  Follicle.No...L.      = "Follicle count — left",
  Follicle.No...R.      = "Follicle count — right",
  Avg..F.size..L...mm.  = "Avg follicle size L (mm)",
  Avg..F.size..R...mm.  = "Avg follicle size R (mm)",
  Endometrium..mm.      = "Endometrial thickness (mm)"
)

PLAIN_ENDO_FULL <- c(
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
  Infertility_Status     = "Infertility history",
  CA_125_Level           = "CA-125 level (U/mL)",
  CRP_Level              = "CRP level (mg/L)",
  Mental_Health_Score    = "Mental health score"
)

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

  # jsonlite serializes empty list() as {} — use class "json" to force [] for empty arrays
  force_array <- function(x) if (length(x) == 0) structure("[]", class = "json") else x

  list(
    toward = force_array(lapply(toward, make_entry)),
    away   = force_array(lapply(away,   make_entry))
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

#* Run Stage 2 full clinical screening for PCOS and Endometriosis
#* @post /stage2
function(req, res) {
  body <- tryCatch(jsonlite::fromJSON(req$postBody, simplifyVector = TRUE), error = function(e) NULL)
  if (is.null(body)) {
    res$status <- 400
    return(list(error = "Invalid JSON body"))
  }

  # ── Stage 1 inputs (carry-over) ──────────────────────────────────────────
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

  # ── Stage 2 clinical inputs ──────────────────────────────────────────────
  pulse       <- as.numeric(body$pulse       %||% 72)
  rr          <- as.numeric(body$rr          %||% 16)
  hb          <- as.numeric(body$hb          %||% 12)
  hcg_i       <- as.numeric(body$hcg_i       %||% 0)
  hcg_ii      <- as.numeric(body$hcg_ii      %||% 0)
  fsh         <- as.numeric(body$fsh         %||% 5)
  lh          <- as.numeric(body$lh          %||% 5)
  fsh_lh      <- as.numeric(body$fsh_lh      %||% round(fsh / max(lh, 0.01), 2))
  tsh         <- as.numeric(body$tsh         %||% 2)
  amh         <- as.numeric(body$amh         %||% 3)
  prl         <- as.numeric(body$prl         %||% 15)
  vit_d3      <- as.numeric(body$vit_d3      %||% 30)
  prg         <- as.numeric(body$prg         %||% 1)
  rbs         <- as.numeric(body$rbs         %||% 90)
  bp_sys      <- as.numeric(body$bp_sys      %||% 120)
  bp_dia      <- as.numeric(body$bp_dia      %||% 80)
  follicle_l  <- as.numeric(body$follicle_l  %||% 0)
  follicle_r  <- as.numeric(body$follicle_r  %||% 0)
  avg_fsize_l <- as.numeric(body$avg_fsize_l %||% 0)
  avg_fsize_r <- as.numeric(body$avg_fsize_r %||% 0)
  endometrium <- as.numeric(body$endometrium %||% 8)
  ca_125      <- as.numeric(body$ca_125      %||% 20)
  crp         <- as.numeric(body$crp         %||% 1)
  mental_health <- as.numeric(body$mental_health %||% 70)

  # ── Load full models ──────────────────────────────────────────────────────
  full_pca        <- readRDS(file.path(MODEL_DIR, "pcos_pca_model.rds"))
  full_features   <- readRDS(file.path(MODEL_DIR, "pcos_feature_names.rds"))
  full_n_pcs      <- readRDS(file.path(MODEL_DIR, "pcos_n_pcs.rds"))
  full_pcos_model <- xgb.load(file.path(MODEL_DIR, "pcos_xgboost_model.json"))

  full_endo_features <- readRDS(file.path(MODEL_DIR, "full_endo_feature_names.rds"))
  full_endo_model    <- xgb.load(file.path(MODEL_DIR, "full_endo_xgboost_tuned.json"))

  # ── Full PCOS inference ───────────────────────────────────────────────────
  full_pcos_input <- data.frame(
    Age..yrs.              = age,
    Weight..Kg.            = weight,
    Height.Cm.             = height,
    BMI                    = bmi,
    Blood.Group            = blood_group,
    Pulse.rate.bpm.        = pulse,
    RR..breaths.min.       = rr,
    Hb.g.dl.               = hb,
    Cycle.R.I.             = cycle,
    Cycle.length.days.     = cycle_length,
    Marraige.Status..Yrs.  = marriage_yrs,
    Pregnant.Y.N.          = pregnant,
    No..of.abortions       = abortions,
    I...beta.HCG.mIU.mL.   = hcg_i,
    II...beta.HCG.mIU.mL.  = hcg_ii,
    FSH.mIU.mL.            = fsh,
    LH.mIU.mL.             = lh,
    FSH.LH                 = fsh_lh,
    Hip.inch.              = hip,
    Waist.inch.            = waist,
    Waist.Hip.Ratio        = waist_hip,
    TSH..mIU.L.            = tsh,
    AMH.ng.mL              = amh,
    PRL.ng.mL.             = prl,
    Vit.D3..ng.mL.         = vit_d3,
    PRG.ng.mL.             = prg,
    RBS.mg.dl.             = rbs,
    Weight.gain.Y.N.       = weight_gain,
    hair.growth.Y.N.       = hair_growth,
    Skin.darkening..Y.N.   = skin_dark,
    Hair.loss.Y.N.         = hair_loss,
    Pimples.Y.N.           = pimples,
    Fast.food..Y.N.        = fast_food,
    Reg.Exercise.Y.N.      = exercise,
    BP._Systolic..mmHg.    = bp_sys,
    BP._Diastolic..mmHg.   = bp_dia,
    Follicle.No...L.       = follicle_l,
    Follicle.No...R.       = follicle_r,
    Avg..F.size..L...mm.   = avg_fsize_l,
    Avg..F.size..R...mm.   = avg_fsize_r,
    Endometrium..mm.       = endometrium
  )

  full_pcos_input <- full_pcos_input[, full_features, drop = FALSE]
  full_scaled     <- scale(full_pcos_input, center = full_pca$center, scale = full_pca$scale)
  full_pcs        <- as.matrix(full_scaled) %*% full_pca$rotation[, seq_len(full_n_pcs)]
  full_pcos_dmat  <- xgb.DMatrix(as.matrix(full_pcs))
  full_pcos_prob  <- predict(full_pcos_model, full_pcos_dmat)

  # ── Full Endo inference ───────────────────────────────────────────────────
  full_endo_input <- data.frame(
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
    Infertility_Status     = infertility,
    CA_125_Level           = ca_125,
    CRP_Level              = crp,
    Mental_Health_Score    = mental_health
  )

  full_endo_input <- full_endo_input[, full_endo_features, drop = FALSE]
  full_endo_dmat  <- xgb.DMatrix(as.matrix(full_endo_input))
  full_endo_prob  <- predict(full_endo_model, full_endo_dmat)

  # ── SHAP — PCOS (PCA inverse-projected) ─────────────────────────────────
  pcos_shap_raw <- predict(full_pcos_model, full_pcos_dmat, predcontrib = TRUE)
  pcos_phi      <- as.vector(
    full_pca$rotation[, seq_len(full_n_pcs), drop = FALSE] %*%
    pcos_shap_raw[1L, seq_len(full_n_pcs)]
  )
  names(pcos_phi) <- full_features
  pcos_x_vals     <- setNames(as.numeric(full_pcos_input[1L, ]), full_features)
  pcos_shap       <- build_shap_list(pcos_phi, pcos_x_vals, full_pca, PLAIN_PCOS_FULL)

  # ── SHAP — Endo (direct) ─────────────────────────────────────────────────
  endo_shap_raw   <- predict(full_endo_model, full_endo_dmat, predcontrib = TRUE)
  endo_phi        <- endo_shap_raw[1L, seq_len(ncol(full_endo_input))]
  names(endo_phi) <- colnames(full_endo_input)
  endo_x_vals     <- setNames(as.numeric(full_endo_input[1L, ]), colnames(full_endo_input))
  endo_shap       <- build_shap_list(endo_phi, endo_x_vals, NULL, PLAIN_ENDO_FULL)

  # ── Rotterdam criteria ────────────────────────────────────────────────────
  hyperandrogenism  <- hair_growth == 1 || pimples == 1
  oligo_anovulation <- cycle == 4
  pcom              <- follicle_l > 20 || follicle_r > 20
  rotterdam_count   <- sum(c(hyperandrogenism, oligo_anovulation, pcom))

  irr <- cycle == 4; ha <- hair_growth == 1 || pimples == 1
  co  <- follicle_l > 12 || follicle_r > 12
  pcos_type <- if (full_pcos_prob > 0.5) {
    if      ( irr &&  ha &&  co) "A"
    else if ( irr &&  ha && !co) "B"
    else if (!irr &&  ha &&  co) "C"
    else if ( irr && !ha &&  co) "D"
    else "Unclassified"
  } else { NULL }

  # ── Return results ────────────────────────────────────────────────────────
  list(
    pcosProb  = round(as.numeric(full_pcos_prob) * 100, 1),
    pcosClass = ifelse(full_pcos_prob > 0.5, "PCOS Positive", "PCOS Negative"),
    endoProb  = round(as.numeric(full_endo_prob) * 100, 1),
    endoClass = ifelse(full_endo_prob > 0.5, "Endometriosis Positive", "Endometriosis Negative"),
    pcosShap  = pcos_shap,
    endoShap  = endo_shap,
    rotterdam = list(
      hyperandrogenism = hyperandrogenism,
      oligoAnovulation = oligo_anovulation,
      pcom             = pcom,
      met              = rotterdam_count >= 2,
      metCount         = as.integer(rotterdam_count),
      pcosType         = pcos_type
    )
  )
}
