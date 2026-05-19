'use client';

import React from 'react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import Avatar from '@/components/Avatar';
import Eyebrow from '@/components/Eyebrow';
import Stat from '@/components/Stat';
import type { GoFn } from '@/lib/screens';


// src/assessment.jsx — multi-step PCOS self-assessment

const ASSESSMENT = [
  {
    section: "About you",
    icon: "user",
    question: "How old are you?",
    sub: "Age helps us interpret your results — PCOS often presents differently in different life stages.",
    kind: "options",
    options: ["Under 18", "18 – 24", "25 – 34", "35 – 44", "45 or older"],
  },
  {
    section: "Cycle",
    icon: "moon",
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
    section: "Cycle",
    icon: "moon",
    question: "When you do bleed, how is the flow?",
    sub: "Both very light and unusually heavy bleeding can be relevant.",
    kind: "options",
    options: ["Light", "Moderate — typical for me", "Heavy", "Very heavy or with clots", "Varies a lot"],
  },
  {
    section: "Skin & hair",
    icon: "sparkle",
    question: "How often do you experience acne, especially around your jawline?",
    sub: "Hormonal acne is one indicator of higher androgens.",
    kind: "options",
    options: ["Rarely or never", "Occasionally — a few times a year", "Often — a few times a month", "Almost constantly"],
  },
  {
    section: "Skin & hair",
    icon: "sparkle",
    question: "Have you noticed extra hair on your face, chest, or stomach?",
    sub: "Called hirsutism — another sign of higher androgens.",
    kind: "options",
    options: ["No, nothing unusual", "A little, mostly upper lip or chin", "Yes, noticeable in several places", "Yes — it affects how I feel daily"],
  },
  {
    section: "Skin & hair",
    icon: "sparkle",
    question: "Any thinning hair on your scalp, or a widening part?",
    kind: "options",
    options: ["No", "Slight thinning", "Noticeable thinning", "Significant hair loss"],
  },
  {
    section: "Body & energy",
    icon: "activity",
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
    section: "Body & energy",
    icon: "activity",
    question: "How often do you feel persistently tired — even after rest?",
    kind: "options",
    options: ["Rarely", "Sometimes", "Often", "Almost every day"],
  },
  {
    section: "Wellbeing",
    icon: "heart",
    question: "How are your mood and emotions, on average?",
    kind: "options",
    options: ["Steady, mostly good", "Mostly fine, occasional dips", "Often anxious or low", "Significantly affected most days"],
  },
  {
    section: "History",
    icon: "shield",
    question: "Has anyone in your family been diagnosed with PCOS, diabetes, or thyroid issues?",
    sub: "Family history is one of the strongest risk factors.",
    kind: "options-multi",
    options: ["PCOS", "Type 2 diabetes", "Insulin resistance / prediabetes", "Thyroid condition", "None that I know of"],
  },
];

const Assessment = ({ go }: { go: GoFn }) => {
  const [step, setStep] = React.useState(0);   // -1 = welcome, otherwise question idx
  const [phase, setPhase] = React.useState("welcome");  // welcome / q / done
  const [answers, setAnswers] = React.useState({});

  const total = ASSESSMENT.length;
  const idx = step;
  const q = ASSESSMENT[idx];
  const progress = phase === "welcome" ? 0 : phase === "done" ? 1 : (idx + 1) / total;

  const pick = (opt) => {
    setAnswers(a => {
      if (q.kind === "options-multi") {
        const arr = a[idx] || [];
        const next = arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt];
        return { ...a, [idx]: next };
      }
      return { ...a, [idx]: opt };
    });
    if (q.kind !== "options-multi") setTimeout(next, 220);
  };

  const next = () => {
    if (idx < total - 1) setStep(idx + 1);
    else setPhase("done");
  };
  const back = () => {
    if (idx > 0) setStep(idx - 1);
    else setPhase("welcome");
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
            canContinue={!!answers[idx] && (q.kind !== "options-multi" || answers[idx].length > 0)}/>
        )}
        {phase === "done" && <DoneCard go={go}/>}
      </div>
    </div>
  );
};

const Welcome = ({ onStart }) => (
  <div className="card" style={{ maxWidth: 760, margin: "0 auto", padding: "64px 56px",
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
      About 3 minutes. No medical jargon. You can skip anything that feels too personal,
      and your answers stay private — even from us.
    </p>

    <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 36, marginBottom: 36,
      padding: "20px 24px", background: "var(--bg-tint)", borderRadius: 20 }}>
      {[
        ["calendar", "10 questions", "across cycle, skin & body"],
        ["lock", "Private", "Encrypted, never sold"],
        ["heart", "Gentle", "Pause or skip any time"],
      ].map(([ic, t, b], i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "#fff",
            display: "grid", placeItems: "center", color: "var(--primary)", flex: "none" }}>
            <Icon name={ic} size={18}/>
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

const QuestionCard = ({ q, value, onPick, onContinue, canContinue }) => {
  const multi = q.kind === "options-multi";
  return (
    <div className="card" style={{ maxWidth: 760, margin: "0 auto", padding: "48px 48px 36px",
      borderRadius: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "var(--primary-soft)",
          color: "var(--primary-deep)", display: "grid", placeItems: "center" }}>
          <Icon name={q.icon} size={18}/>
        </div>
        <span className="chip">{q.section}</span>
      </div>

      <h2 className="serif" style={{ fontSize: 38, lineHeight: 1.15, fontWeight: 500,
        letterSpacing: "-.015em", margin: "22px 0 8px" }}>
        {q.question}
      </h2>
      {q.sub && <p style={{ fontSize: 14.5, color: "var(--ink-2)", margin: "0 0 24px" }}>{q.sub}</p>}

      <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
        {q.options.map((opt, i) => {
          const sel = multi ? (value || []).includes(opt) : value === opt;
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

const DoneCard = ({ go }) => (
  <div className="card" style={{ maxWidth: 760, margin: "0 auto", padding: "64px 56px",
    borderRadius: 32, textAlign: "center", position: "relative", overflow: "hidden" }}>
    <div aria-hidden style={{ position: "absolute", inset: -40, opacity: .5,
      background: "radial-gradient(circle at 50% 0%, var(--primary-soft), transparent 60%)" }}/>
    <div style={{ position: "relative" }}>
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
        We've analyzed your answers and prepared a personal report.
        It isn't a diagnosis — it's a starting point for a real conversation with a clinician.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-rose btn-lg" onClick={() => go("results")}>
          See my report <Icon name="arrow" size={16}/>
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => go("tracker")}>
          Start tracking
        </button>
      </div>
    </div>
  </div>
);

export default Assessment;