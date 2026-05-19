'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import Avatar from '@/components/Avatar';
import Eyebrow from '@/components/Eyebrow';
import type { GoFn } from '@/lib/screens';


const Results = ({ go }: { go: GoFn }) => {
  const [primerOpen, setPrimerOpen] = useState(false);

  const overall = 64;
  const indicators = [
    { name: "Cycle irregularity", score: 78, othersScore: 52, level: "high",   icon: "moon",
      detail: "You reported cycles often longer than 35 days. This is a primary Rotterdam criterion." },
    { name: "Skin & hair changes", score: 62, othersScore: 48, level: "moderate", icon: "sparkle",
      detail: "Hormonal acne and some increased facial hair — suggests elevated androgens." },
    { name: "Energy, weight & mood", score: 55, othersScore: 44, level: "moderate", icon: "activity",
      detail: "Persistent fatigue and gradual weight gain can reflect insulin sensitivity changes." },
    { name: "Family history",       score: 40, othersScore: 35, level: "low",      icon: "shield",
      detail: "Some related conditions in your family — worth mentioning to your doctor." },
  ];

  const band = overall >= 70 ? "high" : overall >= 40 ? "moderate" : "low";

  return (
    <div className="page-enter" style={{ padding: "32px 0 80px" }}>
      <div className="container">
        {/* header */}
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between",
          marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Eyebrow>Your report · May 17, 2026</Eyebrow>
            <h1 className="serif" style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.05, margin: "12px 0 0",
              fontWeight: 500, letterSpacing: "-.02em" }}>
              Hi Anya — <span className="serif-it" style={{ color: "var(--primary)" }}>
              here's what we found.</span>
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
          <RiskCard score={overall} band={band}/>
          <SummaryCard band={band} go={go}/>
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
                This is how your results compare to others similar to you. Each pattern aligns with one or more well-known signs of PCOS.
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

// ───────── Risk dial ─────────
const RiskCard = ({ score, band }) => {
  const colors = {
    low:      { fg: "var(--sage)", soft: "var(--sage-soft)", label: "Low likelihood" },
    moderate: { fg: "var(--warn)", soft: "var(--warn-soft)", label: "Moderate likelihood" },
    high:     { fg: "var(--primary)", soft: "var(--primary-soft)", label: "Higher likelihood" },
  }[band];

  const R = 92, C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

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
              color: colors.fg, letterSpacing: "-.02em" }}>{score}</div>
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
          Your answers show patterns worth talking to a doctor about.
        </h3>
        <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>
          This is a likelihood score — not a diagnosis. PCOS can only be confirmed by a clinician
          using bloodwork and (sometimes) ultrasound.
        </p>
      </div>
    </div>
  );
};

// ───────── Summary card ─────────
const SummaryCard = ({ band, go }) => (
  <div className="card" style={{ padding: 32, borderRadius: 28,
    background: "linear-gradient(160deg, #fff, var(--bg-tint))" }}>
    <Eyebrow>What this means</Eyebrow>
    <h3 className="serif" style={{ fontSize: 24, margin: "14px 0 12px", fontWeight: 500,
      lineHeight: 1.3, letterSpacing: "-.01em" }}>
      You reported cycle irregularity, hormonal acne, and persistent fatigue —
      <span className="serif-it" style={{ color: "var(--primary)" }}> a pattern worth investigating.</span>
    </h3>
    <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 22px", display: "grid", gap: 10 }}>
      {[
        ["Cycles longer than 35 days for 6+ months"],
        ["Acne consistent with hormonal pattern"],
        ["Fatigue and weight changes hard to explain"],
      ].map((t,i)=>(
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
          <Icon name="dot" size={10} style={{ color: "var(--primary)" }}/>
          {t}
        </li>
      ))}
    </ul>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button className="btn btn-rose btn-sm" onClick={() => go("booking")}>
        Book a clinician <Icon name="arrow" size={14}/>
      </button>
    </div>
  </div>
);

// ───────── Indicator row ─────────
const IndicatorRow = ({ name, score, othersScore, level, icon, detail }) => {
  const tones = {
    low:      { fg: "var(--sage)", soft: "var(--sage-soft)", txt: "#476158" },
    moderate: { fg: "var(--warn)", soft: "var(--warn-soft)", txt: "#8A4F1F" },
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

      {/* Others avg row */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 11, color: tones.fg, opacity: 0.4, minWidth: 68, fontWeight: 500,
            letterSpacing: ".01em", textTransform: "uppercase" }}>Others</div>
          <div style={{ flex: 1, height: 5, background: "rgba(42,31,37,.06)", borderRadius: 99 }}>
            <div style={{ width: `${othersScore}%`, height: "100%",
              background: tones.fg, borderRadius: 99, opacity: 0.3 }}/>
          </div>
          <div style={{ fontSize: 13, color: tones.fg, opacity: 0.4, fontWeight: 600, minWidth: 28,
            textAlign: "right" }}>{othersScore}</div>
        </div>

        {/* User row */}
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

// ───────── Next steps ─────────
const NextSteps = ({ go, onOpenPrimer }: { go: GoFn; onOpenPrimer: () => void }) => (
  <div className="card" style={{ padding: 32, borderRadius: 28 }}>
    <Eyebrow>Recommended next steps</Eyebrow>
    <h3 className="serif" style={{ fontSize: 26, margin: "12px 0 22px", fontWeight: 500 }}>
      Three things you can do this week.
    </h3>
    <div style={{ display: "grid", gap: 12 }}>
      {[
        { n: "01", icon: "calendar", title: "Book a 20-minute consult",
          body: "We'll match you with a clinician familiar with PCOS. Share your report with one tap.",
          action: "Book a doctor", goTo: "booking" as const },
        { n: "02", icon: "moon", title: "Start tracking your cycle",
          body: "Two weeks of cycle and symptom data will sharpen your report dramatically.",
          action: "Start tracking", goTo: "https://flo.health/" },
        { n: "03", icon: "book", title: "Read: \"PCOS, plainly\"",
          body: "A 6-minute primer on what PCOS is, what the Rotterdam criteria are, and what tests to ask for.",
          action: "Open article", goTo: "primer" as const },
      ].map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 16, padding: "16px 18px",
          borderRadius: 18, background: "var(--bg-tint)" }}>
          <div className="serif-it" style={{ fontSize: 18, color: "var(--primary)",
            minWidth: 28 }}>{s.n}</div>
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

// ───────── PCOS primer modal ─────────
const PrimerModal = ({ onClose }: { onClose: () => void }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(42,31,37,.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: "#fff", borderRadius: 28, maxWidth: 680, width: "100%",
        maxHeight: "88vh", overflowY: "auto",
        padding: "40px 44px", position: "relative",
        boxShadow: "0 24px 80px rgba(42,31,37,.18)",
      }}
    >
      {/* close */}
      <button
        onClick={onClose}
        className="btn btn-ghost btn-sm"
        style={{ position: "absolute", top: 20, right: 20 }}
      >
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
          have cysts on your ovaries to have it. The name comes from a 1935 paper and has
          caused confusion ever since.
        </p>
        <p>
          At its core, PCOS is a hormonal imbalance. The ovaries produce slightly more
          androgen (a group of hormones that includes testosterone) than usual. This
          disrupts the monthly cycle of follicle growth and ovulation, which causes cycles
          to become irregular or stop altogether. The elevated androgens also produce the
          skin and hair symptoms many people notice first: acne along the jawline and chin,
          increased facial or body hair (hirsutism), and sometimes thinning of the hair on
          the scalp.
        </p>
        <p>
          Many people with PCOS also have insulin resistance — the body's cells don't
          respond to insulin as efficiently as they should. The pancreas compensates by
          producing more insulin, and high insulin levels can further drive androgen
          production. This is why weight management can be harder, and why fatigue is so
          commonly reported.
        </p>
      </PrimerSection>

      <PrimerSection title="The Rotterdam criteria — how PCOS is actually diagnosed">
        <p>
          There is no single blood test that says "you have PCOS." Diagnosis is clinical,
          meaning a doctor looks at the whole picture using a standard called the{" "}
          <strong>Rotterdam criteria</strong> (agreed upon by a 2003 expert consensus in
          Rotterdam, Netherlands). You need to meet <strong>at least two of the three
          following criteria</strong> — and other causes must be ruled out first.
        </p>
        <div style={{ display: "grid", gap: 12, margin: "20px 0" }}>
          {[
            {
              n: "1",
              title: "Irregular or absent ovulation",
              body: "Typically shows up as cycles shorter than 21 days or longer than 35 days, or fewer than 8 cycles per year. Some people stop getting a period entirely (amenorrhoea).",
            },
            {
              n: "2",
              title: "Clinical or biochemical signs of high androgens",
              body: "Either visible symptoms (acne, excess facial/body hair, scalp hair thinning) or elevated androgens on a blood test (free testosterone, DHEAS, or androstenedione).",
            },
            {
              n: "3",
              title: "Polycystic-morphology ovaries on ultrasound",
              body: "12 or more follicles (small fluid-filled sacs) visible on one or both ovaries, or an ovarian volume greater than 10 mL. This criterion alone — without the others — does not mean you have PCOS.",
            },
          ].map(c => (
            <div key={c.n} style={{ display: "flex", gap: 14, padding: "16px 18px",
              borderRadius: 16, background: "var(--bg-tint)", border: "1px solid var(--line)" }}>
              <div className="serif-it" style={{ fontSize: 22, color: "var(--primary)",
                minWidth: 20, lineHeight: 1 }}>{c.n}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>
        <p>
          Before diagnosing PCOS, a clinician will typically want to rule out thyroid
          disorders, elevated prolactin, and congenital adrenal hyperplasia — conditions
          that can look identical on the surface.
        </p>
      </PrimerSection>

      <PrimerSection title="What tests to ask for">
        <p>
          When you see a doctor, asking for a targeted panel upfront saves time. Here's
          what's typically ordered at a first appointment for suspected PCOS:
        </p>
        <div style={{ display: "grid", gap: 8, margin: "16px 0" }}>
          {[
            { label: "Free & total testosterone", why: "The core androgen marker for PCOS." },
            { label: "DHEAS (dehydroepiandrosterone sulfate)", why: "Androgen produced by the adrenal glands — helps rule out adrenal causes." },
            { label: "LH & FSH", why: "An elevated LH:FSH ratio (typically >2:1) is common in PCOS." },
            { label: "Fasting insulin & glucose (or HOMA-IR)", why: "Screens for insulin resistance, which affects treatment choices." },
            { label: "TSH (thyroid-stimulating hormone)", why: "Thyroid disorders mimic PCOS symptoms and must be excluded." },
            { label: "Prolactin", why: "Elevated prolactin (hyperprolactinaemia) causes cycle disruption and must be ruled out." },
            { label: "AMH (anti-Müllerian hormone)", why: "Often elevated in PCOS; useful for tracking ovarian reserve and response to treatment." },
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
        <p>
          Not every test is needed for every person. A good clinician will tailor the panel
          to your symptoms. If your GP seems uncertain, asking for a referral to a
          gynaecologist or endocrinologist is entirely reasonable.
        </p>
      </PrimerSection>

      <PrimerSection title="One more thing">
        <p>
          PCOS is chronic but very manageable. Lifestyle changes (particularly reducing
          refined carbohydrates and increasing movement) have strong evidence behind them.
          Medications like combined oral contraceptives, metformin, and spironolactone each
          target different aspects of the syndrome. Fertility is often preserved with
          treatment. The earlier you get clarity, the more options you have.
        </p>
        <p style={{ color: "var(--ink-2)", fontSize: 13 }}>
          This primer is for educational purposes only and does not constitute medical
          advice. Speak with a qualified clinician before making any health decisions.
        </p>
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

// ───────── Doctor pick ─────────
const DoctorPick = ({ go }) => (
  <div className="card" style={{ padding: 28, borderRadius: 28, position: "relative",
    background: "linear-gradient(180deg, #fff, var(--bg-tint))" }}>
    <Eyebrow color="var(--accent)">Match</Eyebrow>
    <h3 className="serif" style={{ fontSize: 22, margin: "12px 0 18px", fontWeight: 500,
      lineHeight: 1.25 }}>
      We found two specialists who fit your profile.
    </h3>
    {[
      { name: "Dr. Mira Chandra", spec: "Endocrinology · PCOS", years: 12, rate: 4.9, tone: "sage", soonest: "Tomorrow, 9:30 AM" },
      { name: "Dr. Aanya Iyer",   spec: "Reproductive Health",    years: 8,  rate: 4.8, tone: "accent", soonest: "Mon, 11:00 AM" },
    ].map((d, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12,
        padding: "14px 14px", borderRadius: 18, background: "#fff",
        border: "1px solid var(--line)", marginBottom: i === 0 ? 10 : 16 }}>
        <Avatar name={d.name} tone={d.tone} size={46}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
            {d.spec} · {d.years}y · ★ {d.rate}
          </div>
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

const Disclaimer = () => (
  <div style={{ marginTop: 22, padding: 18, borderRadius: 16, fontSize: 12.5,
    color: "var(--ink-2)", lineHeight: 1.55,
    background: "rgba(255,255,255,.5)", border: "1px solid var(--line)" }}>
    <Icon name="info" size={13} style={{ color: "var(--ink)", marginRight: 6 }}/>
    Pearl reports are an educational signal, not a medical diagnosis. PCOS is diagnosed
    by a clinician using the Rotterdam criteria — at least two of: irregular cycles,
    signs of high androgens, and polycystic ovaries on ultrasound. Bloodwork is usually required.
  </div>
);

export default Results;
