'use client';

import React from 'react';
import Icon, { type IconName } from '@/components/Icon';
import type { GoFn } from '@/lib/screens';

const ASSESSMENT = [
  // ── About you ──────────────────────────────────────────────────────────────
  {
    section: "About you", icon: "user",
    question: "How old are you?",
    sub: "Age helps us interpret your results — PCOS often presents differently across life stages.",
    kind: "options",
    options: ["Under 18", "18 – 24", "25 – 34", "35 – 44", "45 or older"],
  },
  {
    section: "About you", icon: "user",
    question: "How tall are you?",
    sub: "Used alongside your weight to estimate BMI.",
    kind: "options",
    options: [
      "Under 5'1\"  (155 cm)",
      "5'1\" – 5'5\"  (155 – 165 cm)",
      "5'5\" – 5'9\"  (165 – 175 cm)",
      "Over 5'9\"  (175 cm+)",
    ],
  },
  {
    section: "About you", icon: "user",
    question: "How much do you weigh approximately?",
    kind: "options",
    options: [
      "Under 50 kg  (110 lbs)",
      "50 – 65 kg  (110 – 143 lbs)",
      "66 – 80 kg  (145 – 176 lbs)",
      "81 – 95 kg  (179 – 209 lbs)",
      "Over 95 kg  (210+ lbs)",
    ],
  },
  {
    section: "About you", icon: "user",
    question: "Do you know your blood group?",
    kind: "options",
    options: ["A+", "A−", "B+", "B−", "O+", "O−", "AB+", "AB−", "I don't know"],
  },
  {
    section: "About you", icon: "user",
    question: "Are you currently in a relationship or married?",
    sub: "This helps contextualise some hormonal patterns in the model.",
    kind: "options",
    options: [
      "No",
      "Yes — under 2 years",
      "Yes — 2 to 5 years",
      "Yes — 5 to 10 years",
      "Yes — over 10 years",
    ],
  },
  // ── Cycle ──────────────────────────────────────────────────────────────────
  {
    section: "Cycle", icon: "moon",
    question: "How often do you get your period?",
    sub: "Cycle regularity is one of the three Rotterdam criteria.",
    kind: "options",
    options: [
      "Every 21–35 days — pretty regular",
      "Often delayed or skipped",
      "Fewer than 8 periods a year",
      "I haven't had one in months",
      "I'm not sure / I don't track",
    ],
  },
  {
    section: "Cycle", icon: "moon",
    question: "How painful are your periods?",
    sub: "Period pain (dysmenorrhea) is one of the strongest early indicators of endometriosis.",
    kind: "options",
    options: [
      "None — pain-free",
      "Mild — no medication needed",
      "Moderate — I need painkillers",
      "Severe — it disrupts my day",
      "Debilitating — I can't function",
    ],
  },
  {
    section: "Cycle", icon: "moon",
    question: "How old were you when you got your first period?",
    sub: "Age of menarche is a known risk marker for endometriosis.",
    kind: "options",
    options: ["10 or younger", "11 – 12", "13 – 14", "15 or older", "I'm not sure"],
  },
  // ── Skin & hair ────────────────────────────────────────────────────────────
  {
    section: "Skin & hair", icon: "sparkle",
    question: "How often do you experience acne, especially around your jawline?",
    sub: "Hormonal acne is one indicator of higher androgens.",
    kind: "options",
    options: ["Rarely or never", "Occasionally — a few times a year", "Often — a few times a month", "Almost constantly"],
  },
  {
    section: "Skin & hair", icon: "sparkle",
    question: "Have you noticed extra hair on your face, chest, or stomach?",
    sub: "Called hirsutism — another sign of higher androgens.",
    kind: "options",
    options: ["No, nothing unusual", "A little, mostly upper lip or chin", "Yes, noticeable in several places", "Yes — it affects how I feel daily"],
  },
  {
    section: "Skin & hair", icon: "sparkle",
    question: "Any thinning hair on your scalp, or a widening part?",
    kind: "options",
    options: ["No", "Slight thinning", "Noticeable thinning", "Significant hair loss"],
  },
  {
    section: "Skin & hair", icon: "sparkle",
    question: "Have you noticed darkening of your skin — especially in folds like the neck, armpits, or groin?",
    sub: "Called acanthosis nigricans, this can be a sign of insulin resistance linked to PCOS.",
    kind: "options",
    options: ["No", "Slight darkening", "Yes, noticeable", "Yes, quite significant"],
  },
  // ── Body & lifestyle ───────────────────────────────────────────────────────
  {
    section: "Body & lifestyle", icon: "activity",
    question: "Has your weight changed in ways that feel hard to explain?",
    sub: "PCOS can affect insulin and make weight harder to manage.",
    kind: "options",
    options: [
      "No, it's steady",
      "Gradual gain that's hard to lose",
      "Sudden gain in the last year",
      "I've lost weight unexpectedly",
    ],
  },
  {
    section: "Body & lifestyle", icon: "activity",
    question: "How would you describe the shape of your body?",
    sub: "This helps estimate your waist-to-hip ratio, a PCOS indicator.",
    kind: "options",
    options: [
      "Pear — hips noticeably wider than waist",
      "Hourglass — waist clearly narrower than hips",
      "Rectangle — waist and hips about the same",
      "Apple — waist as wide as or wider than hips",
    ],
  },
  {
    section: "Body & lifestyle", icon: "activity",
    question: "How often do you eat fast food or heavily processed meals?",
    kind: "options",
    options: ["Rarely or never", "1 – 2 times a week", "3 – 4 times a week", "Daily or almost daily"],
  },
  {
    section: "Body & lifestyle", icon: "activity",
    question: "Do you exercise regularly?",
    sub: "At least 30 minutes of moderate activity, 3+ times per week.",
    kind: "options",
    options: ["Yes, consistently", "Occasionally — 1–2 times a week", "Rarely", "Not at all"],
  },
  // ── Pain ───────────────────────────────────────────────────────────────────
  {
    section: "Pain", icon: "heart",
    question: "Do you experience pelvic or abdominal pain outside your period?",
    sub: "Persistent pelvic pain unrelated to your cycle is a key sign of endometriosis.",
    kind: "options",
    options: ["Never", "Occasionally", "Often", "Almost always"],
  },
  {
    section: "Pain", icon: "heart",
    question: "Do you experience pain during or after sex?",
    sub: "Dyspareunia is one of the most specific endometriosis symptoms.",
    kind: "options",
    options: ["Not applicable / not sexually active", "Never", "Occasionally", "Often", "Almost always"],
  },
  {
    section: "Pain", icon: "heart",
    question: "Do you experience pain during bowel movements, especially around your period?",
    sub: "Dyschezia — bowel pain linked to menstruation — is a specific endometriosis marker.",
    kind: "options",
    options: ["Never", "Occasionally", "Around my period only", "Often throughout the month"],
  },
  {
    section: "Pain", icon: "heart",
    question: "Do you experience urinary symptoms — urgency, frequency, or pain when urinating?",
    kind: "options",
    options: ["Never", "Occasionally", "Often", "Almost always"],
  },
  // ── Reproductive history ───────────────────────────────────────────────────
  {
    section: "Reproductive history", icon: "shield",
    question: "Are you currently pregnant?",
    kind: "options",
    options: ["No", "Yes", "Possibly / not sure"],
  },
  {
    section: "Reproductive history", icon: "shield",
    question: "Have you ever been pregnant? (Including miscarriages or terminations)",
    kind: "options",
    options: ["Never", "Once", "Twice", "Three or more times"],
  },
  {
    section: "Reproductive history", icon: "shield",
    question: "Have you ever tried to conceive for 12 months or longer without success?",
    sub: "Infertility is one of the strongest risk factors for endometriosis.",
    kind: "options",
    options: [
      "Not applicable / haven't tried",
      "No — conceived within 12 months",
      "Yes — took 12+ months",
      "Yes — diagnosed infertility",
    ],
  },
  // ── Wellbeing ──────────────────────────────────────────────────────────────
  {
    section: "Wellbeing", icon: "heart",
    question: "How are your mood and emotions, on average?",
    kind: "options",
    options: ["Steady, mostly good", "Mostly fine, occasional dips", "Often anxious or low", "Significantly affected most days"],
  },
  // ── History ────────────────────────────────────────────────────────────────
  {
    section: "History", icon: "shield",
    question: "Has anyone in your family been diagnosed with PCOS, diabetes, or thyroid issues?",
    sub: "Family history is one of the strongest risk factors.",
    kind: "options-multi",
    options: ["PCOS", "Endometriosis", "Type 2 diabetes", "Insulin resistance / prediabetes", "Thyroid condition", "None that I know of"],
  },
];

// ── Answer → numeric model input mapping ─────────────────────────────────────

type Answers = Record<number, string | string[]>;

function mapAnswersToInputs(answers: Answers) {
  const str = (i: number) => (answers[i] as string) ?? "";
  const arr = (i: number) => (answers[i] as string[]) ?? [];

  // Q0 — age
  const ageMap: Record<string, number> = {
    "Under 18": 16, "18 – 24": 21, "25 – 34": 30, "35 – 44": 40, "45 or older": 50,
  };
  const age = ageMap[str(0)] ?? 25;

  // Q1 — height (cm midpoints)
  const heightMap: Record<string, number> = {
    "Under 5'1\"  (155 cm)":          150,
    "5'1\" – 5'5\"  (155 – 165 cm)":  160,
    "5'5\" – 5'9\"  (165 – 175 cm)":  170,
    "Over 5'9\"  (175 cm+)":          178,
  };
  const height = heightMap[str(1)] ?? 162;

  // Q2 — weight (kg midpoints)
  const weightMap: Record<string, number> = {
    "Under 50 kg  (110 lbs)":       46,
    "50 – 65 kg  (110 – 143 lbs)":  57,
    "66 – 80 kg  (145 – 176 lbs)":  73,
    "81 – 95 kg  (179 – 209 lbs)":  88,
    "Over 95 kg  (210+ lbs)":       102,
  };
  const weight = weightMap[str(2)] ?? 65;
  const bmi = Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10;

  // Q3 — blood group (model encoding: A+=11 … AB−=18)
  const bgMap: Record<string, number> = {
    "A+": 11, "A−": 12, "B+": 13, "B−": 14,
    "O+": 15, "O−": 16, "AB+": 17, "AB−": 18, "I don't know": 15,
  };
  const blood_group = bgMap[str(3)] ?? 15;

  // Q4 — relationship / marriage → years
  const marriageMap: Record<string, number> = {
    "No": 0,
    "Yes — under 2 years": 1,
    "Yes — 2 to 5 years":  3,
    "Yes — 5 to 10 years": 7,
    "Yes — over 10 years": 12,
  };
  const marriage_yrs = marriageMap[str(4)] ?? 0;

  // Q5 — cycle regularity + length
  const cycleMap: Record<string, { cycle: number; cycle_length: number }> = {
    "Every 21–35 days — pretty regular": { cycle: 2, cycle_length: 28 },
    "Often delayed or skipped":           { cycle: 4, cycle_length: 42 },
    "Fewer than 8 periods a year":        { cycle: 4, cycle_length: 50 },
    "I haven't had one in months":        { cycle: 4, cycle_length: 70 },
    "I'm not sure / I don't track":       { cycle: 2, cycle_length: 30 },
  };
  const { cycle, cycle_length } = cycleMap[str(5)] ?? { cycle: 2, cycle_length: 28 };

  // Q6 — period pain → dysmenorrhea score (0–10)
  const painMap: Record<string, number> = {
    "None — pain-free":                 0,
    "Mild — no medication needed":      2,
    "Moderate — I need painkillers":    5,
    "Severe — it disrupts my day":      8,
    "Debilitating — I can't function":  10,
  };
  const dysmenorrhea = painMap[str(6)] ?? 0;

  // Q7 — age of menarche
  const menarcheMap: Record<string, number> = {
    "10 or younger": 10, "11 – 12": 11, "13 – 14": 13, "15 or older": 15, "I'm not sure": 13,
  };
  const age_menarche = menarcheMap[str(7)] ?? 13;

  // Q8 — acne → pimples (0/1)
  const pimples = ["Often — a few times a month", "Almost constantly"].includes(str(8)) ? 1 : 0;

  // Q9 — extra hair → hair_growth (0/1)
  const hair_growth = ["Yes, noticeable in several places", "Yes — it affects how I feel daily"].includes(str(9)) ? 1 : 0;

  // Q10 — hair thinning → hair_loss (0/1)
  const hair_loss = ["Noticeable thinning", "Significant hair loss"].includes(str(10)) ? 1 : 0;

  // Q11 — skin darkening → skin_dark (0/1)
  const skin_dark = ["Yes, noticeable", "Yes, quite significant"].includes(str(11)) ? 1 : 0;

  // Q12 — weight change → weight_gain (0/1)
  const weight_gain = ["Gradual gain that's hard to lose", "Sudden gain in the last year"].includes(str(12)) ? 1 : 0;

  // Q13 — body shape → waist (in), hip (in), waist_hip ratio
  type BodyVals = { waist: number; hip: number; waist_hip: number };
  const bodyMap: Record<string, BodyVals> = {
    "Pear — hips noticeably wider than waist":      { waist: 28, hip: 40, waist_hip: 0.70 },
    "Hourglass — waist clearly narrower than hips": { waist: 30, hip: 38, waist_hip: 0.79 },
    "Rectangle — waist and hips about the same":    { waist: 33, hip: 37, waist_hip: 0.89 },
    "Apple — waist as wide as or wider than hips":  { waist: 36, hip: 38, waist_hip: 0.95 },
  };
  const { waist, hip, waist_hip } = bodyMap[str(13)] ?? { waist: 31, hip: 38, waist_hip: 0.82 };

  // Q14 — fast food (0/1)
  const fast_food = ["3 – 4 times a week", "Daily or almost daily"].includes(str(14)) ? 1 : 0;

  // Q15 — regular exercise (0/1)
  const exercise = str(15) === "Yes, consistently" ? 1 : 0;

  // Q16 — pelvic pain score (0–10)
  const pelvicMap: Record<string, number> = {
    "Never": 0, "Occasionally": 3, "Often": 6, "Almost always": 9,
  };
  const pelvic_pain = pelvicMap[str(16)] ?? 0;

  // Q17 — dyspareunia score (0–10)
  const dyspMap: Record<string, number> = {
    "Not applicable / not sexually active": 0,
    "Never": 0, "Occasionally": 3, "Often": 6, "Almost always": 9,
  };
  const dyspareunia = dyspMap[str(17)] ?? 0;

  // Q18 — dyschezia score (0–10)
  const dyschMap: Record<string, number> = {
    "Never": 0, "Occasionally": 2, "Around my period only": 5, "Often throughout the month": 8,
  };
  const dyschezia = dyschMap[str(18)] ?? 0;

  // Q19 — urinary symptoms score (0–10)
  const urinaryMap: Record<string, number> = {
    "Never": 0, "Occasionally": 3, "Often": 6, "Almost always": 9,
  };
  const urinary = urinaryMap[str(19)] ?? 0;

  // Q20 — currently pregnant (0/1)
  const pregnant = str(20) === "Yes" ? 1 : 0;

  // Q21 — prior pregnancies → abortions count
  const abortionMap: Record<string, number> = {
    "Never": 0, "Once": 1, "Twice": 2, "Three or more times": 3,
  };
  const abortions = abortionMap[str(21)] ?? 0;

  // Q22 — infertility (0/1)
  const infertility = ["Yes — took 12+ months", "Yes — diagnosed infertility"].includes(str(22)) ? 1 : 0;

  // Q23 — mood → mental_health score (0–100, higher = better)
  const moodMap: Record<string, number> = {
    "Steady, mostly good": 85, "Mostly fine, occasional dips": 65,
    "Often anxious or low": 40, "Significantly affected most days": 20,
  };
  const mental_health = moodMap[str(23)] ?? 65;

  // Q24 — family history → endo flag
  const familyAnswers = arr(24);
  const family_hist = familyAnswers.includes("Endometriosis") ? 1 : 0;

  return {
    age, weight, height, bmi, blood_group,
    cycle, cycle_length, marriage_yrs, pregnant, abortions,
    hip, waist, waist_hip, weight_gain, hair_growth,
    skin_dark, hair_loss, pimples, fast_food, exercise,
    age_menarche, dysmenorrhea, pelvic_pain, dyspareunia,
    dyschezia, urinary, family_hist, infertility, mental_health,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export type ShapFeature = {
  feature: string;
  label: string;
  value: number;
  formatted: string;
  phi: number;
  z: number | null;
};

export type ShapSection = {
  toward: ShapFeature[];
  away: ShapFeature[];
};

export type ScreenResult = {
  pcosProb: number;
  pcosClass: string;
  endoProb: number;
  endoClass: string;
  pcosShap?: ShapSection;
  endoShap?: ShapSection;
};

export type RotterdamCriteria = {
  hyperandrogenism: boolean;
  oligoAnovulation: boolean;
  pcom: boolean;
  met: boolean;
  metCount: number;
  pcosType: string | null;
};

export type FullScreenResult = ScreenResult & {
  rotterdam: RotterdamCriteria;
};

const Assessment = ({ go }: { go: GoFn }) => {
  const [step, setStep] = React.useState(0);
  const [phase, setPhase] = React.useState<"welcome" | "q" | "done">("welcome");
  const [answers, setAnswers] = React.useState<Answers>({});
  const [result, setResult] = React.useState<ScreenResult | null>(null);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const total = ASSESSMENT.length;
  const idx = step;
  const q = ASSESSMENT[idx];
  const progress = phase === "welcome" ? 0 : phase === "done" ? 1 : (idx + 1) / total;

  const pick = (opt: string) => {
    setAnswers(a => {
      if (q.kind === "options-multi") {
        const existing = (a[idx] as string[]) || [];
        const next = existing.includes(opt) ? existing.filter(x => x !== opt) : [...existing, opt];
        return { ...a, [idx]: next };
      }
      return { ...a, [idx]: opt };
    });
    if (q.kind !== "options-multi") setTimeout(next, 220);
  };

  const next = () => {
    if (idx < total - 1) setStep(idx + 1);
    else finishAssessment();
  };

  const back = () => {
    if (idx > 0) setStep(idx - 1);
    else setPhase("welcome");
  };

  const finishAssessment = async () => {
    setPhase("done");
    setResult(null);
    setFetchError(null);

    const inputs = mapAnswersToInputs(answers);
    try {
      const res = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Screening failed");
      const data: ScreenResult = await res.json();
      setResult(data);
      localStorage.setItem("screenResult", JSON.stringify({ ...data, answers }));
      localStorage.setItem("screenInputs", JSON.stringify(inputs));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setFetchError(msg);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: "calc(100vh - 80px)",
      padding: "32px 0 80px", display: "flex", flexDirection: "column" }}>
      <div className="container" style={{ flex: 1 }}>
        {/* progress + section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 760, margin: "0 auto 28px" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (phase === "welcome") go("landing");
            else if (phase === "q" && idx === 0) setPhase("welcome");
            else if (phase === "done") setPhase("q");
            else back();
          }}>
            <Icon name="arrowL" size={14}/> Back
          </button>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            {phase === "welcome" ? "Get started"
              : phase === "done" ? "All done"
              : `${q.section} · Question ${idx + 1} of ${total}`}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => go("landing")}>
            Save & exit
          </button>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto 22px" }}>
          <div style={{ height: 6, background: "rgba(42,31,37,.06)", borderRadius: 99 }}>
            <div style={{ width: `${progress * 100}%`, height: "100%",
              background: "var(--primary)", borderRadius: 99,
              transition: "width .4s cubic-bezier(.4,0,.2,1)" }}/>
          </div>
        </div>

        {phase === "welcome" && <Welcome onStart={() => { setPhase("q"); setStep(0); }} />}
        {phase === "q" && (
          <QuestionCard q={q} value={answers[idx]} onPick={pick} onContinue={next}
            canContinue={!!answers[idx] && (q.kind !== "options-multi" || (answers[idx] as string[]).length > 0)}/>
        )}
        {phase === "done" && (
          <DoneCard go={go} result={result} error={fetchError}/>
        )}
      </div>
    </div>
  );
};

// ── Welcome ───────────────────────────────────────────────────────────────────

const Welcome = ({ onStart }: { onStart: () => void }) => (
  <div className="card card-pad-lg" style={{ maxWidth: 760, margin: "0 auto", padding: "64px 56px",
    borderRadius: 32, textAlign: "center" }}>
    <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px",
      background: "radial-gradient(circle at 30% 30%, #fff, var(--primary-soft) 50%, var(--primary) 120%)",
      boxShadow: "0 20px 40px -10px rgba(217,98,126,.3)" }}/>
    <h1 className="serif" style={{ fontSize: 48, lineHeight: 1.05, margin: 0,
      fontWeight: 500, letterSpacing: "-.02em" }}>
      Let's get a clearer picture<br/>
      <span className="serif-it" style={{ color: "var(--primary)" }}>of how you're doing.</span>
    </h1>
    <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 480,
      margin: "20px auto 0" }}>
      About 8 minutes. No medical jargon. You can skip anything that feels too personal,
      and your answers stay private — even from us.
    </p>

    <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap", marginTop: 36, marginBottom: 36,
      padding: "20px 24px", background: "var(--bg-tint)", borderRadius: 20 }}>
      {([
        ["calendar", "25 questions", "covering all clinical inputs"],
        ["lock", "Private", "Never sold"],
        ["heart", "Gentle", "Pause or skip any time"],
      ] as const).map(([ic, t, b], i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "#fff",
            display: "grid", placeItems: "center", color: "var(--primary)", flex: "none" }}>
            <Icon name={ic as IconName} size={18}/>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t}</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{b}</div>
          </div>
        </div>
      ))}
    </div>

    <button className="btn btn-rose btn-lg" onClick={onStart}>
      Begin assessment <Icon name="arrow" size={16}/>
    </button>
    <div style={{ marginTop: 18, fontSize: 12.5, color: "var(--muted)" }}>
      Already have an account? <a style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</a> to resume.
    </div>
  </div>
);

// ── Question card ─────────────────────────────────────────────────────────────

const QuestionCard = ({ q, value, onPick, onContinue, canContinue }: {
  q: typeof ASSESSMENT[number];
  value: string | string[] | undefined;
  onPick: (opt: string) => void;
  onContinue: () => void;
  canContinue: boolean;
}) => {
  const multi = q.kind === "options-multi";
  return (
    <div className="card card-pad-lg" style={{ maxWidth: 760, margin: "0 auto", padding: "48px 48px 36px",
      borderRadius: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "var(--primary-soft)",
          color: "var(--primary-deep)", display: "grid", placeItems: "center" }}>
          <Icon name={q.icon as IconName} size={18}/>
        </div>
        <span className="chip">{q.section}</span>
      </div>

      <h2 className="serif" style={{ fontSize: 38, lineHeight: 1.15, fontWeight: 500,
        letterSpacing: "-.015em", margin: "22px 0 8px" }}>
        {q.question}
      </h2>
      {q.sub && <p style={{ fontSize: 14.5, color: "var(--ink-2)", margin: "0 0 24px" }}>{q.sub}</p>}

      <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
        {q.options.map((opt) => {
          const sel = multi ? ((value as string[]) || []).includes(opt) : value === opt;
          return (
            <button key={opt} onClick={() => onPick(opt)} style={{
              display: "flex", alignItems: "center", gap: 14, textAlign: "left",
              padding: "16px 20px", borderRadius: 16,
              border: `1.5px solid ${sel ? "var(--primary)" : "var(--line)"}`,
              background: sel ? "rgba(217,98,126,.06)" : "#fff",
              fontSize: 15.5, fontWeight: sel ? 600 : 500, width: "100%",
              transition: "all .15s ease",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: multi ? 6 : "50%",
                border: `1.5px solid ${sel ? "var(--primary)" : "rgba(42,31,37,.18)"}`,
                background: sel ? "var(--primary)" : "transparent",
                color: "#fff", display: "grid", placeItems: "center", flex: "none",
              }}>{sel && <Icon name="check" size={12} stroke={3}/>}</div>
              {opt}
            </button>
          );
        })}
      </div>

      {multi && (
        <button className="btn btn-rose"
          style={{ marginTop: 24, width: "100%",
            opacity: canContinue ? 1 : .4, pointerEvents: canContinue ? "auto" : "none" }}
          onClick={onContinue}>
          Continue <Icon name="arrow" size={14}/>
        </button>
      )}

      <div style={{ marginTop: 24, fontSize: 12.5, color: "var(--muted)", textAlign: "center" }}>
        <Icon name="lock" size={11}/> Your answers are encrypted and only visible to you.
      </div>
    </div>
  );
};

// ── Done card ─────────────────────────────────────────────────────────────────

const DoneCard = ({ go, result, error }: {
  go: GoFn;
  result: ScreenResult | null;
  error: string | null;
}) => {
  const loading = !result && !error;

  return (
    <div className="card card-pad-lg" style={{ maxWidth: 760, margin: "0 auto", padding: "64px 56px",
      borderRadius: 32, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", inset: -40, opacity: .5,
        background: "radial-gradient(circle at 50% 0%, var(--primary-soft), transparent 60%)" }}/>
      <div style={{ position: "relative" }}>
        {loading && (
          <>
            <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px",
              border: "4px solid var(--primary-soft)", borderTopColor: "var(--primary)",
              animation: "spin 1s linear infinite" }}/>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.1, margin: 0, fontWeight: 500 }}>
              Analysing your answers…
            </h1>
            <p style={{ fontSize: 16, color: "var(--ink-2)", marginTop: 16 }}>
              Running the screening model. This takes a few seconds.
            </p>
          </>
        )}

        {error && (
          <>
            <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px",
              background: "var(--warn-soft)", color: "var(--warn)",
              display: "grid", placeItems: "center" }}>
              <Icon name="info" size={36}/>
            </div>
            <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.1, margin: 0, fontWeight: 500 }}>
              Screening service offline
            </h1>
            <p style={{ fontSize: 15, color: "var(--ink-2)", maxWidth: 440, margin: "16px auto 0", lineHeight: 1.6 }}>
              {error}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 12 }}>
              Start the Plumber API with: <code>Rscript -e "plumber::plumb('plumber.R')$run(port=8000)"</code>
            </p>
            <button className="btn btn-rose btn-lg" style={{ marginTop: 28 }} onClick={() => go("results")}>
              See report anyway <Icon name="arrow" size={16}/>
            </button>
          </>
        )}

        {result && (
          <>
            <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px",
              background: "var(--sage-soft)", color: "#476158",
              display: "grid", placeItems: "center" }}>
              <Icon name="check" size={36} stroke={2.5}/>
            </div>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1.05, margin: 0,
              fontWeight: 500, letterSpacing: "-.02em" }}>
              Thank you for sharing.<br/>
              <span className="serif-it" style={{ color: "var(--primary)" }}>Your report is ready.</span>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 460,
              margin: "20px auto 32px" }}>
              We've analysed your answers and prepared a personal report.
              It isn't a diagnosis — it's a starting point for a real conversation with a clinician.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-rose btn-lg" onClick={() => go("results")}>
                See my report <Icon name="arrow" size={16}/>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Assessment;
