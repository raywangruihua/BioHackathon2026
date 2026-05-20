'use client';

import { useState, useEffect } from 'react';
import Icon, { type IconName } from '@/components/Icon';
import Avatar, { type AvatarTone } from '@/components/Avatar';
import Eyebrow from '@/components/Eyebrow';
import type { GoFn } from '@/lib/screens';
import type { ScreenResult, ShapSection, ShapFeature } from '@/components/screens/Assessment';

// ── Helpers ────────────────────────────────────────────────────────────────

function riskBand(prob: number): "low" | "moderate" | "high" {
  if (prob > 70) return "high";
  if (prob > 45) return "moderate";
  return "low";
}

function loadResult(): ScreenResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("screenResult");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const BINARY_PCOS: Record<string, [string, string]> = {
  "Weight.gain.Y.N.":     ["recent weight gain",        "no recent weight gain"],
  "hair.growth.Y.N.":     ["excessive hair growth",     "no excessive hair growth"],
  "Skin.darkening..Y.N.": ["skin darkening",            "no skin darkening"],
  "Hair.loss.Y.N.":       ["hair loss",                 "no significant hair loss"],
  "Pimples.Y.N.":         ["acne or pimples",           "clear skin"],
  "Fast.food..Y.N.":      ["frequent fast food",        "low fast food intake"],
  "Reg.Exercise.Y.N.":    ["regular exercise",          "not exercising regularly"],
  "Pregnant.Y.N.":        ["currently pregnant",        "not currently pregnant"],
};

const BINARY_ENDO: Record<string, [string, string]> = {
  "Family_History":     ["family history of endometriosis", "no known family history of endometriosis"],
  "Infertility_Status": ["history of infertility",          "no recorded fertility barriers"],
};

const DEMO_PCOS_SHAP: ShapSection = {
  toward: [
    { feature: "Cycle.R.I.",       label: "Menstrual cycle",        value: 4, formatted: "Irregular", phi:  0.42, z: null },
    { feature: "Weight.gain.Y.N.", label: "Weight gain",            value: 1, formatted: "Yes",       phi:  0.31, z: null },
    { feature: "hair.growth.Y.N.", label: "Excessive hair growth",  value: 1, formatted: "Yes",       phi:  0.22, z: null },
  ],
  away: [
    { feature: "Reg.Exercise.Y.N.", label: "Regular exercise", value: 1,    formatted: "Yes",   phi: -0.18, z: null },
    { feature: "Pimples.Y.N.",      label: "Acne / pimples",   value: 0,    formatted: "No",    phi: -0.12, z: null },
    { feature: "BMI",               label: "BMI",               value: 22.5, formatted: "22.50", phi: -0.09, z: -0.8 },
  ],
};

const DEMO_ENDO_SHAP: ShapSection = {
  toward: [
    { feature: "Dysmenorrhea_Score", label: "Dysmenorrhea score", value: 4, formatted: "4.00", phi:  0.15, z: 0.9 },
    { feature: "Pelvic_Pain_Score",  label: "Pelvic pain score",  value: 3, formatted: "3.00", phi:  0.09, z: 0.5 },
  ],
  away: [
    { feature: "Family_History",     label: "Family history of endometriosis", value: 0, formatted: "No",    phi: -0.21, z: null },
    { feature: "Infertility_Status", label: "Infertility history",             value: 0, formatted: "No",    phi: -0.17, z: null },
    { feature: "Age_of_Menarche",    label: "Age of menarche",                 value: 13, formatted: "13.00", phi: -0.08, z: 0.2 },
  ],
};

function getHumanValue(feat: ShapFeature): string {
  const { feature, value } = feat;
  const painLevel = (v: number) => v === 0 ? "none" : v <= 3 ? "mild" : v <= 6 ? "moderate" : "severe";

  switch (feature) {
    case "Cycle.R.I.":            return value === 4 ? "Irregular" : "Regular";
    case "Cycle.length.days.":
    case "Cycle_Length":          return `${Math.round(value)} days`;
    case "Weight.gain.Y.N.":      return value === 1 ? "Yes" : "No";
    case "hair.growth.Y.N.":      return value === 1 ? "Yes" : "No";
    case "Skin.darkening..Y.N.":  return value === 1 ? "Yes" : "No";
    case "Hair.loss.Y.N.":        return value === 1 ? "Yes" : "No";
    case "Pimples.Y.N.":          return value === 1 ? "Yes" : "No";
    case "Fast.food..Y.N.":       return value === 1 ? "Yes" : "No";
    case "Reg.Exercise.Y.N.":     return value === 1 ? "Yes" : "No";
    case "Pregnant.Y.N.":         return value === 1 ? "Yes" : "No";
    case "Family_History":        return value === 1 ? "Yes" : "No";
    case "Infertility_Status":    return value === 1 ? "Yes" : "No";
    case "Dysmenorrhea_Score":    return painLevel(value);
    case "Pelvic_Pain_Score":     return painLevel(value);
    case "Dyspareunia_Score":     return painLevel(value);
    case "Dyschezia_Score":       return painLevel(value);
    case "Urinary_Symptoms_Score":return painLevel(value);
    case "Age_of_Menarche":       return `Age ${Math.round(value)}`;
    case "Age..yrs.":
    case "Age":                   return `${Math.round(value)} years old`;
    case "Weight..Kg.":           return `${Math.round(value)} kg`;
    case "Height.Cm.":            return `${Math.round(value)} cm`;
    case "No..of.abortions":      return value === 0 ? "None" : String(Math.round(value));
    case "BMI": {
      if (value < 18.5) return "Underweight";
      if (value < 25)   return "Healthy weight";
      if (value < 30)   return "Overweight";
      return "Obese range";
    }
    case "Waist.Hip.Ratio": {
      if (value <= 0.72) return "Pear shape";
      if (value <= 0.84) return "Hourglass shape";
      if (value <= 0.92) return "Rectangle shape";
      return "Apple shape";
    }
    case "Hip.inch.":             return `${Math.round(value)} in`;
    case "Waist.inch.":           return `${Math.round(value)} in`;
    default:                      return feat.formatted;
  }
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  "Dysmenorrhea_Score":     "Pain experienced during your period",
  "Pelvic_Pain_Score":      "Ongoing pain in the lower abdomen or pelvis",
  "Dyspareunia_Score":      "Pain or discomfort during sex",
  "Dyschezia_Score":        "Pain or difficulty during bowel movements",
  "Urinary_Symptoms_Score": "Frequency, urgency, or pain when urinating",
  "Age_of_Menarche":        "The age at which you had your first period",
  "BMI":                    "Body mass index — a measure of weight relative to height",
  "Waist.Hip.Ratio":        "Estimated from your body shape",
  "Waist.inch.":            "Estimated from your body shape",
  "Hip.inch.":              "Estimated from your body shape",
  "Cycle.length.days.":     "The number of days in your typical cycle",
  "Cycle_Length":           "The number of days in your typical cycle",
  "Blood.Group":            "Your ABO blood type",
  "Marraige.Status..Yrs.":  "How long you have been married",
};

function getFeatureLabel(feat: ShapFeature, condition: "PCOS" | "Endo"): string {
  if (condition === "PCOS") {
    if (feat.feature === "Cycle.R.I.") return feat.value === 4 ? "Irregular periods" : "Regular periods";
    if (feat.feature in BINARY_PCOS)   return BINARY_PCOS[feat.feature][feat.value === 1 ? 0 : 1];
  } else {
    if (feat.feature in BINARY_ENDO)   return BINARY_ENDO[feat.feature][feat.value === 1 ? 0 : 1];
  }
  if (feat.feature === "BMI") {
    const lvl = feat.z == null ? "notable" : feat.z > 1.5 ? "elevated" : feat.z < -1.5 ? "low" : "average";
    return `${lvl} BMI`;
  }
  const level = feat.z == null ? "notable"
    : feat.z > 1.5  ? "elevated"
    : feat.z < -1.5 ? "low"
    : "average";
  const label = String(feat.label ?? feat.feature ?? "");
  return `${level} ${label.toLowerCase().replace(/\bbmi\b/g, "BMI")}`;
}

function getPatientPhrase(feat: ShapFeature, condition: "PCOS" | "Endo"): string {
  return getFeatureLabel(feat, condition);
}

// ── Component ──────────────────────────────────────────────────────────────

const Results = ({ go }: { go: GoFn }) => {
  const [primerOpen, setPrimerOpen] = useState(false);
  const [result, setResult] = useState<ScreenResult | null>(null);

  useEffect(() => {
    setResult(loadResult());
  }, []);

  // Derive display values from real result, or fall back to demo values
  const pcosProb  = result?.pcosProb  ?? 64;
  const endoProb  = result?.endoProb  ?? 38;
  const pcosClass = result?.pcosClass ?? "PCOS Positive";
  const endoClass = result?.endoClass ?? "Endometriosis Negative";
  const pcosShap  = result?.pcosShap ?? DEMO_PCOS_SHAP;
  const endoShap  = result?.endoShap ?? DEMO_ENDO_SHAP;

  return (
    <div className="page-enter" style={{ padding: "32px 0 80px" }}>
      <div className="container">
        {/* header */}
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between",
          marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Eyebrow>Your report · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</Eyebrow>
            <h1 className="serif" style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.05, margin: "12px 0 0",
              fontWeight: 500, letterSpacing: "-.02em" }}>
              Here's{" "}
              <span className="serif-it" style={{ color: "var(--primary)" }}>what we found.</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-sm"><Icon name="download" size={14}/> Download PDF</button>
            <button className="btn btn-primary btn-sm" onClick={() => go("booking")}>
              <Icon name="calendar" size={14}/> Book consult
            </button>
          </div>
        </div>

        {/* Top row — two risk cards */}
        <div className="rg-2" style={{ marginBottom: 22, gap: 16 }}>
          <RiskCard label="PCOS" prob={pcosProb}/>
          <RiskCard label="Endometriosis" prob={endoProb}/>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: 22 }}>
          <SummaryCard pcosProb={pcosProb} endoProb={endoProb} pcosShap={pcosShap} endoShap={endoShap} go={go}/>
        </div>

        {/* Indicators */}
        <div className="card" style={{ padding: 32, borderRadius: 28, marginBottom: 22 }}>
          <h3 className="serif" style={{ fontSize: 26, margin: "0 0 6px", fontWeight: 500 }}>
            Your indicators, broken down
          </h3>
          <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 22px" }}>
            Key factors the model identified in your responses, and how much each one contributed.
          </p>
          <div className="rg-2" style={{ gap: 20 }}>
            <ConditionFeatures conditionKey="PCOS" label="PCOS" shap={pcosShap}/>
            <ConditionFeatures conditionKey="Endo" label="Endometriosis" shap={endoShap}/>
          </div>
        </div>

        {/* Next steps */}
        <div className="rg-next">
          <NextSteps go={go} onOpenPrimer={() => setPrimerOpen(true)}/>
          <DoctorPick go={go}/>
        </div>

        <Disclaimer/>
      </div>

      {primerOpen && <PrimerModal onClose={() => setPrimerOpen(false)}/>}
    </div>
  );
};

// ── Risk card (single condition) ───────────────────────────────────────────

const RiskCard = ({ label, prob }: {
  label: string; prob: number;
}) => {
  const band = riskBand(prob);
  const colors = {
    low:      { fg: "var(--sage)",    soft: "var(--sage-soft)",    label: "Low likelihood" },
    moderate: { fg: "var(--warn)",    soft: "var(--warn-soft)",    label: "Moderate likelihood" },
    high:     { fg: "var(--primary)", soft: "var(--primary-soft)", label: "Higher likelihood" },
  }[band];

  const R = 72, C = 2 * Math.PI * R;
  const dash = (prob / 100) * C;
  const description = {
    low:      `No strong patterns associated with ${label} were found in your responses.`,
    moderate: `Some patterns linked to ${label} were present.`,
    high:     `Several strong patterns associated with ${label} were detected.`,
  }[band];

  return (
    <div className="card" style={{ padding: 28, borderRadius: 28, display: "flex",
      flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
      <div style={{ position: "relative", width: 180, height: 180, flex: "none" }}>
        <svg viewBox="0 0 180 180" width="180" height="180">
          <circle cx="90" cy="90" r={R} fill="none"
            stroke="rgba(42,31,37,.06)" strokeWidth="12"/>
          <circle cx="90" cy="90" r={R} fill="none"
            stroke={colors.fg} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            transform="rotate(-90 90 90)"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div>
            <div className="serif" style={{ fontSize: 52, lineHeight: 1, fontWeight: 500,
              color: colors.fg, letterSpacing: "-.02em" }}>{Math.round(prob)}</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>of 100</div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{label}</div>
        <div className="chip" style={{ background: colors.soft, color: colors.fg, marginBottom: 10 }}>
          <Icon name="dot" size={10}/> {colors.label}
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-2)", margin: 0, lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  );
};

// ── Summary card ───────────────────────────────────────────────────────────

const SummaryCard = ({ pcosProb, endoProb, pcosShap, endoShap, go }: {
  pcosProb: number; endoProb: number;
  pcosShap: ShapSection; endoShap: ShapSection; go: GoFn;
}) => (
  <div className="card" style={{ padding: 32, borderRadius: 28,
    background: "linear-gradient(160deg, #fff, var(--bg-tint))" }}>
    <Eyebrow>What this means</Eyebrow>
    <h3 className="serif" style={{ fontSize: 24, margin: "14px 0 12px", fontWeight: 500,
      lineHeight: 1.3, letterSpacing: "-.01em" }}>
      Your results are ready —
      <span className="serif-it" style={{ color: "var(--primary)" }}> here's the summary.</span>
    </h3>

    <div style={{ display: "grid", gap: 12, margin: "16px 0 22px" }}>
      <PatientShapSection conditionKey="PCOS" conditionLabel="PCOS"
        prob={pcosProb} shap={pcosShap}/>
      <PatientShapSection conditionKey="Endo" conditionLabel="Endometriosis"
        prob={endoProb} shap={endoShap}/>
    </div>

    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button className="btn btn-rose btn-sm" onClick={() => go("booking")}>
        Book a clinician <Icon name="arrow" size={14}/>
      </button>
    </div>
  </div>
);

// ── Patient SHAP section ────────────────────────────────────────────────────

const PatientShapSection = ({ conditionKey, conditionLabel, prob, shap }: {
  conditionKey: "PCOS" | "Endo"; conditionLabel: string;
  prob: number; shap?: ShapSection;
}) => {
  const band  = riskBand(prob);
  const bandColor = { low: "var(--sage)", moderate: "var(--warn)", high: "var(--primary)" }[band];
  const description = {
    low:      `No strong patterns associated with ${conditionLabel} were found in your responses.`,
    moderate: `Some patterns linked to ${conditionLabel} were present — worth keeping an eye on.`,
    high:     `Several strong patterns associated with ${conditionLabel} were detected in your responses.`,
  }[band];

  const toward = (Array.isArray(shap?.toward) ? shap!.toward : Object.values(shap?.toward ?? {})).slice(0, 3) as ShapFeature[];
  const away   = (Array.isArray(shap?.away)   ? shap!.away   : Object.values(shap?.away   ?? {})).slice(0, 3) as ShapFeature[];

  return (
    <div style={{ padding: "16px 18px", borderRadius: 16,
      background: "var(--bg-tint)", border: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{conditionLabel}</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: bandColor }}>
          {Math.round(prob)}%
        </span>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 10px", lineHeight: 1.5 }}>
        {description}
      </p>

      {toward.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>
            Factors that contributed
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {toward.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13 }}>
                <Icon name="dot" size={9} style={{ color: "var(--primary)", marginTop: 5, flex: "none" }}/>
                {getPatientPhrase(f, conditionKey)}
              </div>
            ))}
          </div>
        </div>
      )}

      {away.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>
            Working in your favour
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {away.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13 }}>
                <Icon name="dot" size={9} style={{ color: "var(--sage)", marginTop: 5, flex: "none" }}/>
                {getPatientPhrase(f, conditionKey)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Condition feature breakdown ────────────────────────────────────────────

const ConditionFeatures = ({ conditionKey, label, shap }: {
  conditionKey: "PCOS" | "Endo"; label: string; shap: ShapSection;
}) => {
  const toward = (Array.isArray(shap.toward) ? shap.toward : Object.values(shap.toward)) as ShapFeature[];
  const away   = (Array.isArray(shap.away)   ? shap.away   : Object.values(shap.away))   as ShapFeature[];
  const all    = [...toward, ...away];
  const maxPhi = Math.max(...all.map(f => Math.abs(f.phi)), 0.01);

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14,
        borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>{label}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {toward.map((f, i) => <FeatureRow key={`t${i}`} feat={f} conditionKey={conditionKey} maxPhi={maxPhi} direction="toward"/>)}
        {away.map((f, i)   => <FeatureRow key={`a${i}`} feat={f} conditionKey={conditionKey} maxPhi={maxPhi} direction="away"/>)}
      </div>
    </div>
  );
};

const FeatureRow = ({ feat, conditionKey, maxPhi, direction }: {
  feat: ShapFeature; conditionKey: "PCOS" | "Endo";
  maxPhi: number; direction: "toward" | "away";
}) => {
  const isToward = direction === "toward";
  const tones = isToward
    ? { fg: "var(--primary)", soft: "var(--primary-soft)", txt: "var(--primary-deep)", chipLabel: "Raised risk" }
    : { fg: "var(--sage)",    soft: "var(--sage-soft)",    txt: "#476158",             chipLabel: "In your favour" };

  const barPct     = Math.round((Math.abs(feat.phi) / maxPhi) * 100);
  const phrase     = getPatientPhrase(feat, conditionKey);
  const answer     = getHumanValue(feat);
  const description = FEATURE_DESCRIPTIONS[feat.feature];

  return (
    <div style={{ padding: 18, borderRadius: 18, border: "1px solid var(--line)",
      background: "rgba(255,255,255,.6)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: 12, gap: 10 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>{phrase}</div>
          {description && (
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{description}</div>
          )}
        </div>
        <span className="chip" style={{ background: tones.soft, color: tones.txt,
          fontSize: 11, whiteSpace: "nowrap", flex: "none" }}>{tones.chipLabel}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 7 }}>
        <div style={{ fontSize: 11, color: "var(--ink-2)", minWidth: 72, fontWeight: 500,
          textTransform: "uppercase", letterSpacing: ".01em" }}>Your answer</div>
        <div style={{ flex: 1, height: 5, background: "rgba(42,31,37,.06)", borderRadius: 99 }}>
          <div style={{ width: `${barPct}%`, height: "100%",
            background: tones.fg, borderRadius: 99, opacity: 0.3 }}/>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", minWidth: 72,
          textAlign: "right", fontWeight: 500 }}>{answer}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 11, color: tones.txt, minWidth: 72, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: ".01em" }}>Impact</div>
        <div style={{ flex: 1, height: 7, background: "rgba(42,31,37,.06)", borderRadius: 99 }}>
          <div style={{ width: `${barPct}%`, height: "100%",
            background: tones.fg, borderRadius: 99, transition: "width .5s ease" }}/>
        </div>
        <div className="serif" style={{ fontSize: 15, color: tones.fg, fontWeight: 700,
          minWidth: 72, textAlign: "right" }}>
          {barPct >= 75 ? "strong" : barPct >= 40 ? "moderate" : "mild"}
        </div>
      </div>
    </div>
  );
};

// ── Next steps ─────────────────────────────────────────────────────────────

const NextSteps = ({ go, onOpenPrimer }: { go: GoFn; onOpenPrimer: () => void }) => (
  <div className="card" style={{ padding: 32, borderRadius: 28 }}>
    <Eyebrow>Recommended next steps</Eyebrow>
    <h3 className="serif" style={{ fontSize: 26, margin: "12px 0 22px", fontWeight: 500 }}>
      Three things you can do this week.
    </h3>
    <div style={{ display: "grid", gap: 12 }}>
      {[
        { n: "01", icon: "calendar" as IconName, title: "Book a 20-minute consult",
          body: "We'll match you with a clinician familiar with PCOS and endometriosis. Share your report with one tap.",
          action: "Book a doctor", goTo: "booking" as const },
        { n: "02", icon: "moon" as IconName, title: "Start tracking your cycle",
          body: "Two weeks of cycle and symptom data will sharpen your report dramatically.",
          action: "Start tracking", goTo: "https://flo.health/" },
        { n: "03", icon: "book" as IconName, title: "Read: \"PCOS, plainly\"",
          body: "A 6-minute primer on what PCOS is, what the Rotterdam criteria are, and what tests to ask for.",
          action: "Open article", goTo: "primer" as const },
      ].map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 16, padding: "16px 18px",
          borderRadius: 18, background: "var(--bg-tint)" }}>
          <div className="serif-it" style={{ fontSize: 18, color: "var(--primary)", minWidth: 28 }}>{s.n}</div>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff",
            display: "grid", placeItems: "center", color: "var(--ink)", flex: "none" }}>
            <Icon name={s.icon} size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.5 }}>{s.body}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: "center" }}
            onClick={() => {
              if (s.goTo === "primer") { onOpenPrimer(); return; }
              if (s.goTo.startsWith("http")) window.open(s.goTo, "_blank");
              else go(s.goTo as any);
            }}>
            {s.action} <Icon name="arrow" size={12}/>
          </button>
        </div>
      ))}
    </div>
  </div>
);

// ── PCOS primer modal ──────────────────────────────────────────────────────

const PrimerModal = ({ onClose }: { onClose: () => void }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(42,31,37,.55)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px 16px",
  }}>
    <div onClick={e => e.stopPropagation()} style={{
      background: "#fff", borderRadius: 28, maxWidth: 680, width: "100%",
      maxHeight: "88vh", overflowY: "auto",
      padding: "40px 44px", position: "relative",
      boxShadow: "0 24px 80px rgba(42,31,37,.18)",
    }}>
      <button onClick={onClose} className="btn btn-ghost btn-sm"
        style={{ position: "absolute", top: 20, right: 20 }}>
        <Icon name="close" size={16}/> Close
      </button>

      <Eyebrow>6-minute read</Eyebrow>
      <h2 className="serif" style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-.02em",
        margin: "12px 0 6px", lineHeight: 1.1 }}>
        PCOS, plainly.
      </h2>
      <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 32px" }}>
        What it is, how doctors diagnose it, and what to ask at your next appointment.
      </p>

      <PrimerSection title="What is PCOS?">
        <p>
          Polycystic ovary syndrome (PCOS) is the most common hormonal condition in people
          with ovaries — affecting roughly 1 in 10. Despite the name, you don't need to
          have cysts on your ovaries to have it.
        </p>
        <p>
          At its core, PCOS is a hormonal imbalance. The ovaries produce slightly more
          androgen than usual, disrupting the monthly cycle of follicle growth and ovulation.
          The elevated androgens also produce the skin and hair symptoms many people notice
          first: acne along the jawline, increased facial or body hair, and scalp thinning.
        </p>
        <p>
          Many people with PCOS also have insulin resistance, which is why weight management
          can be harder and why fatigue is so commonly reported.
        </p>
      </PrimerSection>

      <PrimerSection title="The Rotterdam criteria — how PCOS is actually diagnosed">
        <p>
          There is no single blood test that says "you have PCOS." Diagnosis requires
          at least <strong>two of the three Rotterdam criteria</strong> — and other causes must be ruled out first.
        </p>
        <div style={{ display: "grid", gap: 12, margin: "20px 0" }}>
          {[
            { n: "1", title: "Irregular or absent ovulation",
              body: "Cycles shorter than 21 days or longer than 35 days, or fewer than 8 cycles per year." },
            { n: "2", title: "Clinical or biochemical signs of high androgens",
              body: "Visible symptoms (acne, excess hair, scalp thinning) or elevated androgens on a blood test." },
            { n: "3", title: "Polycystic-morphology ovaries on ultrasound",
              body: "12 or more follicles on one or both ovaries, or ovarian volume greater than 10 mL." },
          ].map(c => (
            <div key={c.n} style={{ display: "flex", gap: 14, padding: "16px 18px",
              borderRadius: 16, background: "var(--bg-tint)", border: "1px solid var(--line)" }}>
              <div className="serif-it" style={{ fontSize: 22, color: "var(--primary)", minWidth: 20, lineHeight: 1 }}>{c.n}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      </PrimerSection>

      <PrimerSection title="What tests to ask for">
        <div style={{ display: "grid", gap: 8, margin: "16px 0" }}>
          {[
            { label: "Free & total testosterone", why: "The core androgen marker for PCOS." },
            { label: "LH & FSH", why: "An elevated LH:FSH ratio (typically >2:1) is common in PCOS." },
            { label: "Fasting insulin & glucose", why: "Screens for insulin resistance." },
            { label: "TSH", why: "Thyroid disorders mimic PCOS symptoms and must be excluded." },
            { label: "AMH", why: "Often elevated in PCOS; useful for tracking ovarian reserve." },
            { label: "Pelvic ultrasound", why: "Looks at ovarian morphology and endometrial thickness." },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px",
              borderRadius: 12, background: i % 2 === 0 ? "var(--bg-tint)" : "transparent" }}>
              <Icon name="dot" size={10} style={{ color: "var(--primary)", marginTop: 4, flex: "none" }}/>
              <div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</span>
                <span style={{ fontSize: 13, color: "var(--ink-2)" }}> — {t.why}</span>
              </div>
            </div>
          ))}
        </div>
      </PrimerSection>
    </div>
  </div>
);

const PrimerSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 32 }}>
    <h3 className="serif" style={{ fontSize: 22, fontWeight: 500, margin: "0 0 14px",
      letterSpacing: "-.01em", borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
      {title}
    </h3>
    <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink)", display: "grid", gap: 14 }}>
      {children}
    </div>
  </div>
);

// ── Doctor pick ────────────────────────────────────────────────────────────

const DoctorPick = ({ go }: { go: GoFn }) => (
  <div className="card" style={{ padding: 28, borderRadius: 28, position: "relative",
    background: "linear-gradient(180deg, #fff, var(--bg-tint))" }}>
    <Eyebrow color="var(--accent)">Match</Eyebrow>
    <h3 className="serif" style={{ fontSize: 22, margin: "12px 0 18px", fontWeight: 500, lineHeight: 1.25 }}>
      We found two specialists who fit your profile.
    </h3>
    {[
      { name: "Dr. Mira Chandra", spec: "Endocrinology · PCOS", years: 12, rate: 4.9, tone: "sage" as AvatarTone, soonest: "Tomorrow, 9:30 AM" },
      { name: "Dr. Aanya Iyer",   spec: "Reproductive Health",  years: 8,  rate: 4.8, tone: "accent" as AvatarTone, soonest: "Mon, 11:00 AM" },
    ].map((d, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12,
        padding: "14px 14px", borderRadius: 18, background: "#fff",
        border: "1px solid var(--line)", marginBottom: i === 0 ? 10 : 16 }}>
        <Avatar name={d.name} tone={d.tone} size={46}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{d.spec} · {d.years}y · ★ {d.rate}</div>
          <div style={{ fontSize: 11.5, color: "var(--primary)", marginTop: 2 }}>
            <Icon name="calendar" size={11}/> Soonest: {d.soonest}
          </div>
        </div>
        <button className="btn btn-soft btn-sm" onClick={() => go("booking")}>Book</button>
      </div>
    ))}
    <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={() => go("booking")}>
      See all clinicians <Icon name="arrow" size={12}/>
    </button>
  </div>
);

// ── Disclaimer ─────────────────────────────────────────────────────────────

const Disclaimer = () => (
  <div style={{ marginTop: 22, padding: 18, borderRadius: 16, fontSize: 12.5,
    color: "var(--ink-2)", lineHeight: 1.55,
    background: "rgba(255,255,255,.5)", border: "1px solid var(--line)" }}>
    <Icon name="info" size={13} style={{ color: "var(--ink)", marginRight: 6 }}/>
    Pearl reports are an educational signal, not a medical diagnosis. PCOS is diagnosed
    by a clinician using the Rotterdam criteria. Endometriosis is confirmed by laparoscopy or MRI.
    Bloodwork and specialist referral are typically required for both.
  </div>
);

export default Results;
