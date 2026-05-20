rm(list = ls())
library(xgboost)
library(rstudioapi)
library(svDialogs)
library(ggplot2)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# ==============================================================================
# 1. HELPER FUNCTIONS & DICTIONARIES
# ==============================================================================

ask_numeric <- function(prompt, min_val = -Inf, max_val = Inf) {
  repeat {
    val <- suppressWarnings(as.numeric(dlgInput(prompt)$res))
    if (length(val) == 0L) stop("User cancelled input.")
    if (!is.na(val) && val >= min_val && val <= max_val) return(val)
    dlgMessage(paste0("Invalid input. Please enter a number between ",
                      min_val, " and ", max_val, "."), type = "ok")
  }
}

clean_name <- function(x) trimws(gsub("\\s+", " ", gsub("\\.+", " ", x)))

risk_label <- function(p) {
  if (p > 0.70) "HIGH" else if (p > 0.45) "MODERATE" else "LOW"
}

# --- Feature Mapping Dictionaries ---
PLAIN_PCOS <- c(
  Age..yrs.               = "Age",
  Weight..Kg.             = "Body weight (kg)",
  Height.Cm.              = "Height (cm)",
  BMI                     = "BMI",
  Blood.Group             = "Blood group",
  Pulse.rate.bpm.         = "Pulse rate (bpm)",
  RR..breaths.min.        = "Breathing rate (breaths/min)",
  Hb.g.dl.                = "Haemoglobin (g/dL)",
  Cycle.R.I.              = "Menstrual cycle",
  Cycle.length.days.      = "Cycle length (days)",
  Marraige.Status..Yrs.   = "Years married",
  Pregnant.Y.N.           = "Pregnant",
  No..of.abortions        = "Prior pregnancies",
  I...beta.HCG.mIU.mL.    = "Beta-HCG I (mIU/mL)",
  II...beta.HCG.mIU.mL.   = "Beta-HCG II (mIU/mL)",
  FSH.mIU.mL.             = "FSH (mIU/mL)",
  LH.mIU.mL.              = "LH (mIU/mL)",
  FSH.LH                  = "FSH/LH ratio",
  Hip.inch.               = "Hip circumference (in)",
  Waist.inch.             = "Waist circumference (in)",
  Waist.Hip.Ratio         = "Waist-to-hip ratio",
  TSH..mIU.L.             = "TSH (mIU/L)",
  AMH.ng.mL               = "AMH (ng/mL)",
  PRL.ng.mL.              = "Prolactin (ng/mL)",
  Vit.D3..ng.mL.          = "Vitamin D (ng/mL)",
  PRG.ng.mL.              = "Progesterone (ng/mL)",
  RBS.mg.dl.              = "Blood sugar (mg/dL)",
  Weight.gain.Y.N.        = "Weight gain",
  hair.growth.Y.N.        = "Excessive hair growth",
  Skin.darkening..Y.N.    = "Skin darkening",
  Hair.loss.Y.N.          = "Hair loss",
  Pimples.Y.N.            = "Acne / pimples",
  Fast.food..Y.N.         = "Frequent fast food",
  Reg.Exercise.Y.N.       = "Regular exercise",
  BP._Systolic..mmHg.     = "Systolic BP (mmHg)",
  BP._Diastolic..mmHg.    = "Diastolic BP (mmHg)",
  Follicle.No...L.        = "Follicle count — left",
  Follicle.No...R.        = "Follicle count — right",
  Avg..F.size..L...mm.    = "Avg follicle size L (mm)",
  Avg..F.size..R...mm.    = "Avg follicle size R (mm)",
  Endometrium..mm.        = "Endometrial thickness (mm)"
)

PLAIN_ENDO <- c(
  Age                    = "Age",
  BMI                    = "BMI",
  Cycle_Length           = "Cycle length (days)",
  Age_of_Menarche        = "Age of menarche (yrs)",
  Dysmenorrhea_Score     = "Dysmenorrhea score (0-10)",
  Pelvic_Pain_Score      = "Pelvic pain score (0-10)",
  Dyspareunia_Score      = "Dyspareunia score (0-10)",
  Dyschezia_Score        = "Dyschezia score (0-10)",
  Urinary_Symptoms_Score = "Urinary symptoms score (0-10)",
  Family_History         = "Family history of Endometriosis",
  Infertility_Status     = "Infertility history",
  CA_125_Level           = "CA-125 level (U/mL)",
  CRP_Level              = "CRP level (mg/L)",
  Mental_Health_Score    = "Mental health score (0-100)"
)

get_plain_label <- function(feat, condition) {
  dict <- if (condition == "PCOS") PLAIN_PCOS else PLAIN_ENDO
  if (feat %in% names(dict)) return(unname(dict[feat])) else return(clean_name(feat))
}

BINARY_FEATURES <- c(
  "Pregnant.Y.N.", "Weight.gain.Y.N.", "hair.growth.Y.N.",
  "Skin.darkening..Y.N.", "Hair.loss.Y.N.", "Pimples.Y.N.",
  "Fast.food..Y.N.", "Reg.Exercise.Y.N.", "Family_History", "Infertility_Status"
)

format_value <- function(feat, val) {
  if (feat == "Cycle.R.I.") return(if (val == 4) "Irregular" else "Regular")
  if (feat %in% BINARY_FEATURES) return(if (val == 1) "Yes" else "No")
  sprintf("%.2f", val)
}

# --- Patient Narrative Translation Utilities ---
BINARY_PHRASES_PCOS <- list(
  Weight.gain.Y.N.     = c("recent weight gain",         "no recent weight gain"),
  hair.growth.Y.N.     = c("excessive hair growth",     "no excessive hair growth"),
  Skin.darkening..Y.N. = c("skin darkening",            "no skin darkening"),
  Hair.loss.Y.N.       = c("hair loss",                 "no significant hair loss"),
  Pimples.Y.N.         = c("acne or pimples",           "clear skin"),
  Fast.food..Y.N.      = c("frequent fast food",        "low fast food intake"),
  Reg.Exercise.Y.N.    = c("regular exercise",          "no regular exercise"),
  Pregnant.Y.N.        = c("currently pregnant",        "not currently pregnant")
)

BINARY_PHRASES_ENDO <- list(
  Family_History     = c("family history of endometriosis", "no known family history of endometriosis"),
  Infertility_Status = c("history of infertility issues",  "no recorded clinical fertility barriers")
)

get_patient_phrase <- function(feat, val, condition, z_val = NA) {
  if (condition == "PCOS") {
    if (feat == "Cycle.R.I.") return(if (val == 4) "irregular periods" else "regular periods")
    if (feat %in% names(BINARY_PHRASES_PCOS)) return(if (val == 1) BINARY_PHRASES_PCOS[[feat]][1] else BINARY_PHRASES_PCOS[[feat]][2])
  } else {
    if (feat %in% names(BINARY_PHRASES_ENDO)) return(if (val == 1) BINARY_PHRASES_ENDO[[feat]][1] else BINARY_PHRASES_ENDO[[feat]][2])
  }
  
  if (is.na(z_val)) {
    level <- "notable"
  } else {
    level <- if (z_val > 1.5) "elevated" else if (z_val < -1.5) "low" else "borderline"
  }
  paste(level, tolower(get_plain_label(feat, condition)))
}

# --- Modulated Core Section Printers ---
print_clinical_section <- function(phi, prob, x_row, feat_names, section_title, condition, top_n = 5L) {
  x0  <- setNames(as.numeric(x_row[, feat_names]), feat_names)
  ord <- order(abs(phi), decreasing = TRUE)
  
  toward <- names(phi)[ord][phi[ord] >  0]
  away   <- names(phi)[ord][phi[ord] <= 0]
  
  toward <- head(toward, top_n)
  away   <- head(away,  top_n)
  
  D <- strrep("-", 52)
  
  cat(D, "\n", sep = "")
  cat(sprintf("  SCREENING TARGET: %s\n", toupper(section_title)))
  cat(D, "\n", sep = "")
  cat(sprintf("  Prediction  : %s\n", if (prob > 0.5) paste(condition, "Positive") else paste(condition, "Negative")))
  cat(sprintf("  Probability : %.0f%%\n", prob * 100))
  cat(sprintf("  Risk level  : %s\n\n", risk_label(prob)))
  
  cat("  TOP FINDINGS SUPPORTING THIS TARGET:\n")
  if (length(toward) == 0) {
    cat("    (none)\n")
  } else {
    for (f in toward) cat(sprintf("    %-34s  %s\n", get_plain_label(f, condition), format_value(f, x0[f])))
  }
  
  cat("\n  TOP FINDINGS AGAINST THIS TARGET:\n")
  if (length(away) == 0) {
    cat("    (none)\n")
  } else {
    for (f in away) cat(sprintf("    %-34s  %s\n", get_plain_label(f, condition), format_value(f, x0[f])))
  }
  cat("\n")
}

print_patient_section <- function(phi, prob, x_row, feat_names, condition, pca_obj = NULL) {
  x0  <- setNames(as.numeric(x_row[, feat_names]), feat_names)
  ord <- order(abs(phi), decreasing = TRUE)
  
  risk_top <- head(names(phi)[ord][phi[ord] >  0], 3)
  prot_top <- head(names(phi)[ord][phi[ord] <= 0], 3)
  
  result_str <- if (prob > 0.5) {
    sprintf("Some patterns in your results are associated with %s.", condition)
  } else {
    sprintf("No strong patterns associated with %s were found.", condition)
  }
  
  cat(sprintf("  WHAT YOUR %s RESULTS SHOW:\n", toupper(condition)))
  cat(sprintf("  %s\n\n", result_str))
  
  if (length(risk_top) > 0) {
    cat("  Factors that contributed to this result:\n")
    for (f in risk_top) {
      z_val <- if (!is.null(pca_obj) && f %in% names(pca_obj$center)) (x0[f] - pca_obj$center[f]) / pca_obj$scale[f] else NA
      cat(sprintf("    \u2022 %s\n", get_patient_phrase(f, x0[f], condition, z_val)))
    }
    cat("\n")
  }
  if (length(prot_top) > 0) {
    cat("  Things working in your favour:\n")
    for (f in prot_top) {
      z_val <- if (!is.null(pca_obj) && f %in% names(pca_obj$center)) (x0[f] - pca_obj$center[f]) / pca_obj$scale[f] else NA
      cat(sprintf("    \u2022 %s\n", get_patient_phrase(f, x0[f], condition, z_val)))
    }
    cat("\n")
  }
}

# PCA-adjusted inverse projection for SHAP matrix components
get_shap_pca <- function(model, dmat, pca, n_pcs, feat_names) {
  raw <- predict(model, dmat, predcontrib = TRUE)
  phi <- as.vector(pca$rotation[, seq_len(n_pcs), drop = FALSE] %*% raw[1L, seq_len(n_pcs)])
  names(phi) <- feat_names
  list(values = phi, bias = raw[1L, n_pcs + 1L])
}

# ==============================================================================
# 2. MAIN EXECUTION PROTOCOL
# ==============================================================================

tryCatch({
  
  # ==========================================
  # STAGE 1 — INITIAL SCREENING
  # ==========================================
  dlgMessage("STAGE 1: Initial Screening\n\nPlease enter the patient's details.\nThis will screen for both PCOS and Endometriosis.", type = "ok")
  
  # --- Shared Baseline Inputs ---
  age          <- ask_numeric("Age (yrs)", 10, 60)
  weight       <- ask_numeric("Weight (Kg)", 20, 200)
  height       <- ask_numeric("Height (Cm)", 100, 220)
  bmi          <- ask_numeric("BMI", 10, 60)
  blood_group  <- ask_numeric("Blood Group\n(A+=11, A-=12, B+=13, B-=14, O+=15, O-=16, AB+=17, AB-=18)", 11, 18)
  cycle        <- ask_numeric("Cycle type\n(Regular = 2, Irregular = 4)", 2, 4)
  cycle_length <- ask_numeric("Cycle length (days)", 1, 90)
  marriage_yrs <- ask_numeric("Marriage Status (Yrs)", 0, 40)
  pregnant     <- ask_numeric("Pregnant (Yes = 1, No = 0)", 0, 1)
  abortions    <- ask_numeric("No. of abortions", 0, 20)
  hip          <- ask_numeric("Hip circumference (inch)", 20, 80)
  waist        <- ask_numeric("Waist circumference (inch)", 20, 80)
  waist_hip    <- ask_numeric("Waist:Hip Ratio", 0.5, 2.0)
  weight_gain  <- ask_numeric("Weight gain (Yes = 1, No = 0)", 0, 1)
  hair_growth  <- ask_numeric("Excessive hair growth (Yes = 1, No = 0)", 0, 1)
  skin_dark    <- ask_numeric("Skin darkening (Yes = 1, No = 0)", 0, 1)
  hair_loss    <- ask_numeric("Hair loss (Yes = 1, No = 0)", 0, 1)
  pimples      <- ask_numeric("Pimples (Yes = 1, No = 0)", 0, 1)
  fast_food    <- ask_numeric("Fast food (Yes = 1, No = 0)", 0, 1)
  exercise     <- ask_numeric("Reg. Exercise (Yes = 1, No = 0)", 0, 1)
  
  # --- Endometriosis Specific Baseline Inputs ---
  age_menarche <- ask_numeric("Age of Menarche (yrs)", 8, 20)
  dysmenorrhea <- ask_numeric("Dysmenorrhea Score (0-10)", 0, 10)
  pelvic_pain  <- ask_numeric("Pelvic Pain Score (0-10)", 0, 10)
  dyspareunia  <- ask_numeric("Dyspareunia Score (0-10)", 0, 10)
  dyschezia    <- ask_numeric("Dyschezia Score (0-10)", 0, 10)
  urinary      <- ask_numeric("Urinary Symptoms Score (0-10)", 0, 10)
  family_hist  <- ask_numeric("Family History of Endometriosis (Yes = 1, No = 0)", 0, 1)
  infertility  <- ask_numeric("Infertility Status (Yes = 1, No = 0)", 0, 1)
  
  # --- Process Partial PCOS Evaluation ---
  partial_pcos_input <- data.frame(
    Age..yrs.              = age,
    Weight..Kg.            = weight,
    Height.Cm.             = height,
    BMI                    = bmi,
    Blood.Group            = blood_group,
    Cycle.R.I.             = cycle,
    Cycle.length.days.     = cycle_length,
    Marraige.Status..Yrs.  = marriage_yrs,
    Pregnant.Y.N.          = pregnant,
    No..of.abortions       = abortions,
    Hip.inch.              = hip,
    Waist.inch.            = waist,
    Waist.Hip.Ratio        = waist_hip,
    Weight.gain.Y.N.       = weight_gain,
    hair.growth.Y.N.       = hair_growth,
    Skin.darkening..Y.N.   = skin_dark,
    Hair.loss.Y.N.         = hair_loss,
    Pimples.Y.N.           = pimples,
    Fast.food..Y.N.        = fast_food,
    Reg.Exercise.Y.N.      = exercise
  )
  
  partial_pca        <- readRDS("partial_pcos_pca_model.rds")
  partial_features   <- readRDS("partial_pcos_feature_names.rds")
  partial_n_pcs      <- readRDS("partial_pcos_n_pcs.rds")
  partial_pcos_model <- xgb.load("partial_pcos_xgboost_model.json")
  
  partial_pcos_input <- partial_pcos_input[, partial_features, drop = FALSE]
  partial_scaled     <- scale(partial_pcos_input, center = partial_pca$center, scale = partial_pca$scale)
  partial_pcs        <- as.matrix(partial_scaled) %*% partial_pca$rotation[, seq_len(partial_n_pcs)]
  partial_pcos_prob  <- predict(partial_pcos_model, xgb.DMatrix(as.matrix(partial_pcs)))
  partial_pcos_class <- ifelse(partial_pcos_prob > 0.5, "PCOS Positive", "PCOS Negative")
  
  # --- Process Partial Endo Evaluation ---
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
  
  partial_endo_features <- readRDS("partial_endo_feature_names.rds")
  partial_endo_model    <- xgb.load("partial_endo_xgboost_tuned.json")
  
  partial_endo_input <- partial_endo_input[, partial_endo_features, drop = FALSE]
  partial_endo_prob  <- predict(partial_endo_model, xgb.DMatrix(as.matrix(partial_endo_input)))
  partial_endo_class <- ifelse(partial_endo_prob > 0.5, "Endometriosis Positive", "Endometriosis Negative")
  
  # --- Present Stage 1 Outputs ---
  dlgMessage(
    paste0(
      "STAGE 1 RESULTS\n",
      "────────────────────────────────────\n",
      "PCOS          : ", partial_pcos_class,
      " (Pos Probability ", round(partial_pcos_prob * 100, 2), "%)\n",
      "Endometriosis : ", partial_endo_class,
      " (Pos Probability ", round(partial_endo_prob * 100, 2), "%)\n",
      "────────────────────────────────────\n\n",
      "Click OK to proceed to the full clinical assessment."
    ),
    type = "ok"
  )
  
  # ==========================================
  # STAGE 2 — FULL CLINICAL ASSESSMENT
  # ==========================================
  dlgMessage("STAGE 2: Full Clinical Assessment\n\nPreviously entered values will be reused.\nPlease enter the remaining clinical values.", type = "ok")
  
  # --- Additional Laboratory + Ovarian PCOS Metrics ---
  pulse       <- ask_numeric("Pulse rate (bpm)", 40, 180)
  rr          <- ask_numeric("RR (breaths/min)", 5, 50)
  hb          <- ask_numeric("Hb (g/dl)", 1, 20)
  hcg_i       <- ask_numeric("I beta-HCG (mIU/mL)", 0, 100000)
  hcg_ii      <- ask_numeric("II beta-HCG (mIU/mL)", 0, 100000)
  fsh         <- ask_numeric("FSH (mIU/mL)", 0, 200)
  lh          <- ask_numeric("LH (mIU/mL)", 0, 200)
  fsh_lh      <- ask_numeric("FSH/LH ratio", 0, 20)
  tsh         <- ask_numeric("TSH (mIU/L)", 0, 100)
  amh         <- ask_numeric("AMH (ng/mL)", 0, 100)
  prl         <- ask_numeric("PRL (ng/mL)", 0, 500)
  vit_d3      <- ask_numeric("Vit D3 (ng/mL)", 0, 150)
  prg         <- ask_numeric("PRG (ng/mL)", 0, 100)
  rbs         <- ask_numeric("RBS (mg/dl)", 50, 500)
  bp_sys      <- ask_numeric("BP Systolic (mmHg)", 60, 220)
  bp_dia      <- ask_numeric("BP Diastolic (mmHg)", 40, 140)
  follicle_l  <- ask_numeric("Follicle No. (L)", 0, 50)
  follicle_r  <- ask_numeric("Follicle No. (R)", 0, 50)
  avg_fsize_l <- ask_numeric("Avg. F size (L) (mm)", 0, 40)
  avg_fsize_r <- ask_numeric("Avg. F size (R) (mm)", 0, 40)
  endometrium <- ask_numeric("Endometrium (mm)", 0, 30)
  
  # --- Additional Advanced Endometriosis Biomarkers ---
  ca_125        <- ask_numeric("CA-125 Level (U/mL)", 0, 1000)
  crp           <- ask_numeric("CRP Level (mg/L)", 0, 200)
  mental_health <- ask_numeric("Mental Health Score (0-100)", 0, 100)
  
  # --- Process Full PCOS Pipeline ---
  full_pcos_input <- data.frame(
    Age..yrs.               = age,
    Weight..Kg.              = weight,
    Height.Cm.              = height,
    BMI                     = bmi,
    Blood.Group             = blood_group,
    Pulse.rate.bpm.         = pulse,
    RR..breaths.min.        = rr,
    Hb.g.dl.                = hb,
    Cycle.R.I.              = cycle,
    Cycle.length.days.      = cycle_length,
    Marraige.Status..Yrs.   = marriage_yrs,
    Pregnant.Y.N.           = pregnant,
    No..of.abortions        = abortions,
    I...beta.HCG.mIU.mL.    = hcg_i,
    II...beta.HCG.mIU.mL.   = hcg_ii,
    FSH.mIU.mL.             = fsh,
    LH.mIU.mL.              = lh,
    FSH.LH                  = fsh_lh,
    Hip.inch.               = hip,
    Waist.inch.             = waist,
    Waist.Hip.Ratio         = waist_hip,
    TSH..mIU.L.             = tsh,
    AMH.ng.mL               = amh,
    PRL.ng.mL.              = prl,
    Vit.D3..ng.mL.          = vit_d3,
    PRG.ng.mL.              = prg,
    RBS.mg.dl.              = rbs,
    Weight.gain.Y.N.        = weight_gain,
    hair.growth.Y.N.        = hair_growth,
    Skin.darkening..Y.N.    = skin_dark,
    Hair.loss.Y.N.          = hair_loss,
    Pimples.Y.N.            = pimples,
    Fast.food..Y.N.         = fast_food,
    Reg.Exercise.Y.N.       = exercise,
    BP._Systolic..mmHg.     = bp_sys,
    BP._Diastolic..mmHg.    = bp_dia,
    Follicle.No...L.        = follicle_l,
    Follicle.No...R.        = follicle_r,
    Avg..F.size..L...mm.    = avg_fsize_l,
    Avg..F.size..R...mm.    = avg_fsize_r,
    Endometrium..mm.        = endometrium
  )
  
  full_pca        <- readRDS("pcos_pca_model.rds")
  full_features   <- readRDS("pcos_feature_names.rds")
  full_n_pcs      <- readRDS("pcos_n_pcs.rds")
  full_pcos_model <- xgb.load("pcos_xgboost_model.json")
  
  full_pcos_input <- full_pcos_input[, full_features, drop = FALSE]
  full_scaled     <- scale(full_pcos_input, center = full_pca$center, scale = full_pca$scale)
  full_pcs        <- as.matrix(full_scaled) %*% full_pca$rotation[, seq_len(full_n_pcs)]
  full_pcos_dmat  <- xgb.DMatrix(as.matrix(full_pcs))
  full_pcos_prob  <- predict(full_pcos_model, full_pcos_dmat)
  full_pcos_class <- ifelse(full_pcos_prob > 0.5, "PCOS Positive", "PCOS Negative")
  
  # --- Process Full Endo Pipeline ---
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
  
  full_endo_features <- readRDS("full_endo_feature_names.rds")
  full_endo_model    <- xgb.load("full_endo_xgboost_tuned.json")
  
  full_endo_input    <- full_endo_input[, full_endo_features, drop = FALSE]
  full_endo_dmat     <- xgb.DMatrix(as.matrix(full_endo_input))
  full_endo_prob     <- predict(full_endo_model, full_endo_dmat)
  full_endo_class    <- ifelse(full_endo_prob > 0.5, "Endometriosis Positive", "Endometriosis Negative")
  
  # ==========================================
  # SHAP EXPLANATORY DATA PROCESSING
  # ==========================================
  pcos_shap <- get_shap_pca(full_pcos_model, full_pcos_dmat, full_pca, full_n_pcs, full_features)
  
  endo_raw_contrib <- predict(full_endo_model, full_endo_dmat, predcontrib = TRUE)
  endo_shap_values <- as.vector(endo_raw_contrib[1L, seq_along(full_endo_features)])
  names(endo_shap_values) <- full_endo_features
  
  # ==========================================
  # PCOS TYPING & ROTTERDAM PROTOCOLS
  # ==========================================
  irregular_periods <- cycle == 4
  high_androgens    <- hair_growth == 1 || pimples == 1
  cystic_ovaries    <- follicle_l > 12 || follicle_r > 12
  
  pcos_type <- if (full_pcos_class == "PCOS Positive") {
    if      ( irregular_periods &&  high_androgens &&  cystic_ovaries) "Type A"
    else if ( irregular_periods &&  high_androgens && !cystic_ovaries) "Type B"
    else if (!irregular_periods &&  high_androgens &&  cystic_ovaries) "Type C"
    else if ( irregular_periods && !high_androgens &&  cystic_ovaries) "Type D"
    else "Unclassified"
  } else { NA }
  
  criterion_hyperandrogenism  <- hair_growth == 1 || pimples == 1
  criterion_oligo_anovulation <- cycle == 4
  criterion_pcom              <- follicle_l > 20 || follicle_r > 20
  
  rotterdam_met   <- c(
    if (criterion_hyperandrogenism)  "Clinical Hyperandrogenism",
    if (criterion_oligo_anovulation) "Oligo-Anovulation",
    if (criterion_pcom)              "Polycystic Ovarian Morphology (>20 follicles)"
  )
  rotterdam_count  <- length(rotterdam_met)
  rotterdam_status <- if (rotterdam_count >= 2) "MET (2/3 or more criteria satisfied)" else "NOT MET (fewer than 2 criteria satisfied)"
  
  # --- Setup Shared Strings ---
  conclusion_str <- if (full_pcos_class == "PCOS Positive" && full_endo_class == "Endometriosis Positive") {
    "⚠ Assessment indicates both PCOS and Endometriosis.\nFurther clinical evaluation is strongly recommended."
  } else if (full_pcos_class == "PCOS Positive") {
    "⚠ Assessment indicates PCOS.\nFurther evaluation is recommended."
  } else if (full_endo_class == "Endometriosis Positive") {
    "⚠ Assessment indicates Endometriosis.\nFurther evaluation is recommended."
  } else {
    "✓ Full assessment does not indicate PCOS or Endometriosis."
  }
  
  # ==============================================================================
  # 3. UNIFIED CONSOLE PRINTING LOOPS
  # ==============================================================================
  W <- strrep("=", 52)
  D <- strrep("-", 52)
  
  # ────────────────────────────────────────────────────────
  # REPORT BLOCK 1: FULL CLINICAL ASSESSMENT
  # ────────────────────────────────────────────────────────
  cat("\n", W, "\n", sep = "")
  cat("           COMBINED CLINICAL ASSESSMENT\n")
  cat(W, "\n\n", sep = "")
  
  # Section A: PCOS
  print_clinical_section(pcos_shap$values, full_pcos_prob, full_pcos_input, full_features, "Polycystic Ovary Syndrome (PCOS)", "PCOS")
  
  # Inline Rotterdam Breakdown
  if (full_pcos_class == "PCOS Positive") {
    cat("  ROTTERDAM DIAGNOSTIC CRITERIA SUMMARY:\n")
    cat("    Rotterdam Status  : ", rotterdam_status, "\n")
    cat("    Phenotypic Type   : ", pcos_type, "\n")
    cat("    Criteria Present  :\n")
    if (rotterdam_count == 0) {
      cat("      None\n")
    } else {
      for (m in rotterdam_met) cat(sprintf("      - %s\n", m))
    }
    cat("\n")
  }
  
  # Section B: Endometriosis
  print_clinical_section(endo_shap_values, full_endo_prob, full_endo_input, full_endo_features, "Endometriosis", "Endometriosis")
  
  # Combined Conclusion Border
  cat(W, "\n  CLINICAL CONCLUSION\n", W, "\n", sep = "")
  cat("  ", gsub("\n", "\n  ", conclusion_str), "\n\n", sep = "")
  
  # ────────────────────────────────────────────────────────
  # REPORT BLOCK 2: FOR THE PATIENT
  # ────────────────────────────────────────────────────────
  cat("\n", W, "\n", sep = "")
  cat("  FOR THE PATIENT:\n")
  cat(W, "\n\n", sep = "")
  
  print_patient_section(pcos_shap$values, full_pcos_prob, full_pcos_input, full_features, "PCOS", full_pca)
  print_patient_section(endo_shap_values, full_endo_prob, full_endo_input, full_endo_features, "Endometriosis", pca_obj = NULL)
  
  cat(D, "\n  NEXT STEPS & GUIDANCE\n", D, "\n", sep = "")
  cat("  This assessment is a preliminary screening tool, not an official medical diagnosis.\n\n")
  cat("  Your body's data shows tracking indicators that merit a closer look. We recommend\n")
  cat("  sharing this complete report profile with your gynecologist or healthcare specialist.\n")
  cat("  They can combine these predictive metrics with diagnostic tests to curate a safe,\n")
  cat("  personalised medical pathway for you.\n\n")
  cat(W, "\n\n", sep = "")
  
  # --- UI Message Popup Backup ---
  final_summary_popup <- paste0(
    "Clinical Reporting Engine Executed.\n",
    "────────────────────────────────────\n",
    "Final Result Status:\n", conclusion_str
  )
  dlgMessage(final_summary_popup, type = "ok")
  
}, error = function(e) {
  if (grepl("cancelled", e$message, ignore.case = TRUE)) {
    dlgMessage("Screening cancelled.\nNo results were saved.", type = "ok")
    message("Screening cancelled by user.")
  } else {
    stop(e)
  }
})