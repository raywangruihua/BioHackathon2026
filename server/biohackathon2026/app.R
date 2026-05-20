rm(list = ls())
library(xgboost)
library(rstudioapi)
library(svDialogs)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# -----------------------------
# HELPER FUNCTION
# -----------------------------
ask_numeric <- function(prompt, min_val = -Inf, max_val = Inf) {
  repeat {
    val <- suppressWarnings(as.numeric(dlgInput(prompt)$res))
    if (length(val) == 0) stop("User cancelled input.")
    if (!is.na(val) && val >= min_val && val <= max_val) return(val)
    dlgMessage(paste0("Invalid input. Please enter a number between ", min_val, " and ", max_val, "."), type = "ok")
  }
}

# -----------------------------
# MAIN SCRIPT
# -----------------------------
tryCatch({
  
  # ==============================
  # STAGE 1 — INITIAL SCREENING
  # ==============================
  dlgMessage("STAGE 1: Initial Screening\n\nPlease enter the patient's details.\nThis will screen for both PCOS and Endometriosis.", type = "ok")
  
  # --- Shared inputs ---
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
  
  # --- Endo-specific inputs ---
  age_menarche <- ask_numeric("Age of Menarche (yrs)", 8, 20)
  dysmenorrhea <- ask_numeric("Dysmenorrhea Score (0-10)", 0, 10)
  pelvic_pain  <- ask_numeric("Pelvic Pain Score (0-10)", 0, 10)
  dyspareunia  <- ask_numeric("Dyspareunia Score (0-10)", 0, 10)
  dyschezia    <- ask_numeric("Dyschezia Score (0-10)", 0, 10)
  urinary      <- ask_numeric("Urinary Symptoms Score (0-10)", 0, 10)
  family_hist  <- ask_numeric("Family History of Endometriosis (Yes = 1, No = 0)", 0, 1)
  infertility  <- ask_numeric("Infertility Status (Yes = 1, No = 0)", 0, 1)
  
  # --- Partial PCOS model ---
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
  
  partial_pca        <- readRDS("partial_pcos_pca_model.rds")
  partial_features   <- readRDS("partial_pcos_feature_names.rds")
  partial_n_pcs      <- readRDS("partial_pcos_n_pcs.rds")
  partial_pcos_model <- xgb.load("partial_pcos_xgboost_model.json")
  
  partial_pcos_input <- partial_pcos_input[, partial_features, drop = FALSE]
  partial_scaled     <- scale(partial_pcos_input, center = partial_pca$center, scale = partial_pca$scale)
  partial_pcs        <- as.matrix(partial_scaled) %*% partial_pca$rotation[, 1:partial_n_pcs]
  partial_pcos_prob  <- predict(partial_pcos_model, xgb.DMatrix(as.matrix(partial_pcs)))
  partial_pcos_class <- ifelse(partial_pcos_prob > 0.5, "PCOS Positive", "PCOS Negative")
  
  # --- Partial Endo model ---
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
  
  # --- Stage 1 results ---
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
  
  # ==============================
  # STAGE 2 — FULL ASSESSMENT
  # ==============================
  dlgMessage("STAGE 2: Full Clinical Assessment\n\nPreviously entered values will be reused.\nPlease enter the remaining clinical values.", type = "ok")
  
  # --- Additional PCOS inputs ---
  pulse       <- ask_numeric("Pulse rate (bpm)", 40, 180)
  rr          <- ask_numeric("RR (breaths/min)", 5, 50)
  hb          <- ask_numeric("Hb (g/dl)", 1, 20)
  hcg_i       <- ask_numeric("I beta-HCG (mIU/mL)", 0, 100000)
  hcg_ii       <- ask_numeric("II beta-HCG (mIU/mL)", 0, 100000)
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
  
  # --- Additional Endo inputs ---
  ca_125        <- ask_numeric("CA-125 Level (U/mL)", 0, 1000)
  crp           <- ask_numeric("CRP Level (mg/L)", 0, 200)
  mental_health <- ask_numeric("Mental Health Score (0-100)", 0, 100)
  
  # --- Full PCOS model ---
  full_pcos_input <- data.frame(
    Age..yrs.               = age,
    Weight..Kg.             = weight,
    Height.Cm.              = height,
    BMI                     = bmi,
    Blood.Group             = blood_group,
    Pulse.rate.bpm.         = pulse,
    RR..breaths.min.        = rr,
    Hb.g.dl.               = hb,
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
  full_pcs        <- as.matrix(full_scaled) %*% full_pca$rotation[, 1:full_n_pcs]
  full_pcos_prob  <- predict(full_pcos_model, xgb.DMatrix(as.matrix(full_pcs)))
  full_pcos_class <- ifelse(full_pcos_prob > 0.5, "PCOS Positive", "PCOS Negative")
  
  # --- Full Endo model ---
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
  
  full_endo_input <- full_endo_input[, full_endo_features, drop = FALSE]
  full_endo_prob  <- predict(full_endo_model, xgb.DMatrix(as.matrix(full_endo_input)))
  full_endo_class <- ifelse(full_endo_prob > 0.5, "Endometriosis Positive", "Endometriosis Negative")
  
  # ==============================
  # PCOS TYPING + ROTTERDAM
  # ==============================
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
  
  # Rotterdam: 2 out of 3 criteria needed
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
  
  # ==============================
  # BUILD FINAL SUMMARY STRINGS
  # ==============================
  pcos_type_str <- if (full_pcos_class == "PCOS Positive") {
    rotterdam_list_str <- if (rotterdam_count == 0) {
      "    None\n"
    } else {
      paste0(paste0("    - ", rotterdam_met, "\n"), collapse = "")
    }
    paste0(
      "  PCOS Type             : ", pcos_type, "\n",
      "  Rotterdam Criteria    : ", rotterdam_status, "\n",
      "  Criteria present      :\n",
      rotterdam_list_str
    )
  } else { "" }
  
  conclusion_str <- if (full_pcos_class == "PCOS Positive" && full_endo_class == "Endometriosis Positive") {
    "⚠ Assessment indicates both PCOS and Endometriosis.\nFurther evaluation is strongly recommended."
  } else if (full_pcos_class == "PCOS Positive") {
    "⚠ Assessment indicates PCOS.\nFurther evaluation is recommended."
  } else if (full_endo_class == "Endometriosis Positive") {
    "⚠ Assessment indicates Endometriosis.\nFurther evaluation is recommended."
  } else {
    "✓ Full assessment does not indicate PCOS or Endometriosis."
  }
  
  final_msg <- paste0(
    "FINAL RESULTS SUMMARY\n",
    "────────────────────────────────────\n",
    "PCOS\n",
    "  Stage 1 (Partial) : ", partial_pcos_class,
    " (Pos Probability ", round(partial_pcos_prob * 100, 2), "%)\n",
    "  Stage 2 (Full)    : ", full_pcos_class,
    " (Pos Probability ", round(full_pcos_prob * 100, 2), "%)\n",
    pcos_type_str,
    "\nENDOMETRIOSIS\n",
    "  Stage 1 (Partial) : ", partial_endo_class,
    " (Pos Probability ", round(partial_endo_prob * 100, 2), "%)\n",
    "  Stage 2 (Full)    : ", full_endo_class,
    " (Pos Probability ", round(full_endo_prob * 100, 2), "%)\n",
    "────────────────────────────────────\n\n",
    conclusion_str
  )
  
  dlgMessage(final_msg, type = "ok")
  cat(final_msg, "\n")
  
}, error = function(e) {
  if (grepl("cancelled", e$message, ignore.case = TRUE)) {
    dlgMessage("Screening cancelled.\nNo results were saved.", type = "ok")
    message("Screening cancelled by user.")
  } else {
    stop(e)
  }
})