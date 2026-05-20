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

function getPatientPhrase(feat: ShapFeature, condition: "PCOS" | "Endo"): string {
  if (condition === "PCOS") {
    if (feat.feature === "Cycle.R.I.")
      return feat.value === 4 ? "irregular periods" : "regular periods";
    if (feat.feature in BINARY_PCOS)
      return BINARY_PCOS[feat.feature][feat.value === 1 ? 0 : 1];
  } else {
    if (feat.feature in BINARY_ENDO)
      return BINARY_ENDO[feat.feature][feat.value === 1 ? 0 : 1];
  }
  const level = feat.z == null ? "notable"
    : feat.z > 1.5  ? "elevated"
    : feat.z < -1.5 ? "low"
    : "borderline";
  const label = String(feat.label ?? feat.feature ?? "");
  return `${level} ${label.toLowerCase()}`;
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

  // Overall score = highest of the two probabilities
  const overall = Math.max(pcosProb, endoProb);
  const band    = riskBand(overall);

  const indicators: {
    name: string; score: number; othersScore: number;
    level: "low" | "moderate" | "high"; icon: IconName; detail: string;
  }[] = [
    {
      name: "PCOS likelihood",
      score: Math.round(pcosProb),
      othersScore: 35,
      level: riskBand(pcosProb),
      icon: "moon",
      detail: pcosClass === "PCOS Positive"
        ? `Your screening score of ${pcosProb}% places you in the ${riskBand(pcosProb)} range for PCOS. Cycle regularity, androgens, and body metrics were the key signals.`
        : `Your screening score of ${pcosProb}% does not strongly suggest PCOS at this stage. Continuing to track your cycle is still worthwhile.`,
    },
    {
      name: "Endometriosis likelihood",
      score: Math.round(endoProb),
      othersScore: 20,
      level: riskBand(endoProb),
      icon: "heart",
      detail: endoClass === "Endometriosis Positive"
        ? `Your pain scores and cycle data gave an endometriosis screening score of ${endoProb}%. This warrants discussion with a gynaecologist.`
        : `Your endometriosis screening score was ${endoProb}%. No strong indicators at this stage, though monitoring pain patterns remains important.`,
    },
  ];

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

        {/* Top row — risk + summary */}
        <div className="rg-results-top" style={{ marginBottom: 22 }}>
          <RiskCard score={overall} band={band} pcosClass={pcosClass} endoClass={endoClass}/>
          <SummaryCard pcosProb={pcosProb} endoProb={endoProb} pcosClass={pcosClass} endoClass={endoClass} pcosShap={pcosShap} endoShap={endoShap} go={go}/>
        </div>

        {/* Indicators */}
        <div className="card" style={{ padding: 32, borderRadius: 28, marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end",
            marginBottom: 22 }}>
            <div>
              <h3 className="serif" style={{ fontSize: 26, margin: 0, fontWeight: 500 }}>
                Your indicators, broken down
              </h3>
              <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "6px 0 0" }}>
                Screening scores from our PCOS and Endometriosis models, compared to a reference population.
              </p>
            </div>
            <button className="btn btn-ghost btn-sm">
              <Icon name="info" size={14}/> Learn more
            </button>
          </div>

          <div className="rg-2" style={{ gap: 12 }}>
            {indicators.map((ind, i) => <IndicatorRow key={i} {...ind}/>)}
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

// ── Risk dial ──────────────────────────────────────────────────────────────

const RiskCard = ({ score, band, pcosClass, endoClass }: {
  score: number; band: "low" | "moderate" | "high"; pcosClass: string; endoClass: string;
}) => {
  const colors = {
    low:      { fg: "var(--sage)",    soft: "var(--sage-soft)",    label: "Low likelihood" },
    moderate: { fg: "var(--warn)",    soft: "var(--warn-soft)",    label: "Moderate likelihood" },
    high:     { fg: "var(--primary)", soft: "var(--primary-soft)", label: "Higher likelihood" },
  }[band];

  const R = 92, C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  const bothPositive = pcosClass.includes("Positive") && endoClass.includes("Positive");
  const eitherPositive = pcosClass.includes("Positive") || endoClass.includes("Positive");

  return (
    <div className="card risk-inner" style={{ padding: 32, borderRadius: 28, position: "relative" }}>
      <div className="risk-dial">
        <svg viewBox="0 0 220 220" width="100%" height="100%">
          <circle cx="110" cy="110" r={R} fill="none"
            stroke="rgba(42,31,37,.06)" strokeWidth="14"/>
          <circle cx="110" cy="110" r={R} fill="none"
            stroke={colors.fg} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            transform="rotate(-90 110 110)"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
          textAlign: "center" }}>
          <div>
            <div className="serif" style={{ fontSize: 60, lineHeight: 1, fontWeight: 500,
              color: colors.fg, letterSpacing: "-.02em" }}>{Math.round(score)}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 2 }}>of 100</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div className="chip" style={{ background: colors.soft, color: colors.fg }}>
          <Icon name="dot" size={10}/> {colors.label}
        </div>
        <h3 className="serif" style={{ fontSize: 26, lineHeight: 1.2, margin: "14px 0 8px",
          fontWeight: 500, letterSpacing: "-.015em" }}>
          {bothPositive
            ? "Patterns associated with both conditions were found."
            : eitherPositive
              ? "Some patterns worth discussing with a clinician."
              : "No strong patterns detected at this stage."}
        </h3>
        <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>
          This is a likelihood score — not a diagnosis. Both conditions can only be confirmed
          by a clinician using bloodwork and, where appropriate, imaging.
        </p>
      </div>
    </div>
  );
};

// ── Summary card ───────────────────────────────────────────────────────────

const SummaryCard = ({ pcosProb, endoProb, pcosClass, endoClass, pcosShap, endoShap, go }: {
  pcosProb: number; endoProb: number; pcosClass: string; endoClass: string;
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
        prob={pcosProb} condClass={pcosClass} shap={pcosShap}/>
      <PatientShapSection conditionKey="Endo" conditionLabel="Endometriosis"
        prob={endoProb} condClass={endoClass} shap={endoShap}/>
    </div>

    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button className="btn btn-rose btn-sm" onClick={() => go("booking")}>
        Book a clinician <Icon name="arrow" size={14}/>
      </button>
    </div>
  </div>
);

// ── Patient SHAP section ────────────────────────────────────────────────────

const PatientShapSection = ({ conditionKey, conditionLabel, prob, condClass, shap }: {
  conditionKey: "PCOS" | "Endo"; conditionLabel: string;
  prob: number; condClass: string; shap?: ShapSection;
}) => {
  const isPositive = condClass.includes("Positive");
  const toward = (Array.isArray(shap?.toward) ? shap!.toward : Object.values(shap?.toward ?? {})).slice(0, 3) as ShapFeature[];
  const away   = (Array.isArray(shap?.away)   ? shap!.away   : Object.values(shap?.away   ?? {})).slice(0, 3) as ShapFeature[];

  return (
    <div style={{ padding: "16px 18px", borderRadius: 16,
      background: "var(--bg-tint)", border: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{conditionLabel}</div>
        <span style={{ fontSize: 13, fontWeight: 700,
          color: isPositive ? "var(--primary)" : "var(--sage)" }}>
          {Math.round(prob)}%
        </span>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 10px", lineHeight: 1.5 }}>
        {isPositive
          ? `Some patterns in your results are associated with ${conditionLabel}.`
          : `No strong patterns associated with ${conditionLabel} were found.`}
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

// ── Indicator row ──────────────────────────────────────────────────────────

const IndicatorRow = ({ name, score, othersScore, level, icon, detail }: {
  name: string; score: number; othersScore: number;
  level: "low" | "moderate" | "high"; icon: IconName; detail: string;
}) => {
  const tones = {
    low:      { fg: "var(--sage)",    soft: "var(--sage-soft)",    txt: "#476158" },
    moderate: { fg: "var(--warn)",    soft: "var(--warn-soft)",    txt: "#8A4F1F" },
    high:     { fg: "var(--primary)", soft: "var(--primary-soft)", txt: "var(--primary-deep)" },
  }[level];

  return (
    <div style={{ padding: 20, borderRadius: 20, border: "1px solid var(--line)",
      background: "rgba(255,255,255,.6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: tones.soft,
            color: tones.txt, display: "grid", placeItems: "center" }}>
            <Icon name={icon} size={18}/>
          </div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
        </div>
        <span className="chip" style={{ background: tones.soft, color: tones.txt,
          textTransform: "capitalize" }}>{level}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 11, color: tones.fg, opacity: 0.4, minWidth: 68, fontWeight: 500,
            letterSpacing: ".01em", textTransform: "uppercase" }}>Others</div>
          <div style={{ flex: 1, height: 5, background: "rgba(42,31,37,.06)", borderRadius: 99 }}>
            <div style={{ width: `${othersScore}%`, height: "100%",
              background: tones.fg, borderRadius: 99, opacity: 0.3 }}/>
          </div>
          <div style={{ fontSize: 13, color: tones.fg, opacity: 0.4, fontWeight: 600,
            minWidth: 28, textAlign: "right" }}>{othersScore}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 7 }}>
          <div style={{ fontSize: 11, color: tones.txt, minWidth: 68, fontWeight: 600,
            letterSpacing: ".01em", textTransform: "uppercase" }}>You</div>
          <div style={{ flex: 1, height: 7, background: "rgba(42,31,37,.06)", borderRadius: 99 }}>
            <div style={{ width: `${score}%`, height: "100%", background: tones.fg, borderRadius: 99 }}/>
          </div>
          <div className="serif" style={{ fontSize: 16, color: tones.fg, fontWeight: 700,
            minWidth: 28, textAlign: "right" }}>{score}</div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "12px 0 0", lineHeight: 1.5 }}>{detail}</p>
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
