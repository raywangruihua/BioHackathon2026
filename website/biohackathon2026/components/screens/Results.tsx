'use client';

import React from 'react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import Avatar from '@/components/Avatar';
import Eyebrow from '@/components/Eyebrow';
import Stat from '@/components/Stat';
import type { GoFn } from '@/lib/screens';


// src/results.jsx — patient results & risk dashboard

const Results = ({ go }: { go: GoFn }) => {
  // Mock data — would come from assessment in real app
  const overall = 64; // moderate
  const indicators = [
    { name: "Cycle irregularity", score: 78, level: "high",   icon: "moon",
      detail: "You reported cycles often longer than 35 days. This is a primary Rotterdam criterion." },
    { name: "Skin & hair changes", score: 62, level: "moderate", icon: "sparkle",
      detail: "Hormonal acne and some increased facial hair — suggests elevated androgens." },
    { name: "Energy, weight & mood", score: 55, level: "moderate", icon: "activity",
      detail: "Persistent fatigue and gradual weight gain can reflect insulin sensitivity changes." },
    { name: "Family history",       score: 40, level: "low",      icon: "shield",
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
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1.05, margin: "12px 0 0",
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
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1.4fr", gap: 22, marginBottom: 22 }}>
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
                Each pattern aligns with one or more well-known signs of PCOS.
              </p>
            </div>
            <button className="btn btn-ghost btn-sm">
              <Icon name="info" size={14}/> Learn more
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {indicators.map((ind, i) => <IndicatorRow key={i} {...ind}/>)}
          </div>
        </div>

        {/* Next steps */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 22 }}>
          <NextSteps go={go}/>
          <DoctorPick go={go}/>
        </div>

        <Disclaimer/>
      </div>
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
    <div className="card" style={{ padding: 32, borderRadius: 28, position: "relative",
      display: "flex", alignItems: "center", gap: 28 }}>
      <div style={{ position: "relative", width: 220, height: 220, flex: "none" }}>
        <svg viewBox="0 0 220 220" width="220" height="220">
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
      <button className="btn btn-ghost btn-sm" onClick={() => go("tracker")}>
        Start cycle tracking
      </button>
    </div>
  </div>
);

// ───────── Indicator row ─────────
const IndicatorRow = ({ name, score, level, icon, detail }) => {
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
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: "rgba(42,31,37,.06)", borderRadius: 99 }}>
          <div style={{ width: `${score}%`, height: "100%", background: tones.fg, borderRadius: 99 }}/>
        </div>
        <div className="serif" style={{ fontSize: 18, color: tones.fg, fontWeight: 600, minWidth: 38 }}>
          {score}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "12px 0 0", lineHeight: 1.5 }}>{detail}</p>
    </div>
  );
};

// ───────── Next steps ─────────
const NextSteps = ({ go }) => (
  <div className="card" style={{ padding: 32, borderRadius: 28 }}>
    <Eyebrow>Recommended next steps</Eyebrow>
    <h3 className="serif" style={{ fontSize: 26, margin: "12px 0 22px", fontWeight: 500 }}>
      Three things you can do this week.
    </h3>
    <div style={{ display: "grid", gap: 12 }}>
      {[
        { n: "01", icon: "calendar", title: "Book a 20-minute consult",
          body: "We'll match you with a clinician familiar with PCOS. Share your report with one tap.",
          action: "Book a doctor", goTo: "booking" },
        { n: "02", icon: "moon", title: "Start tracking your cycle",
          body: "Two weeks of cycle and symptom data will sharpen your report dramatically.",
          action: "Open tracker", goTo: "tracker" },
        { n: "03", icon: "book", title: "Read: \"PCOS, plainly\"",
          body: "A 6-minute primer on what PCOS is, what the Rotterdam criteria are, and what tests to ask for.",
          action: "Open article", goTo: null },
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
            onClick={() => s.goTo && go(s.goTo)}>
            {s.action} <Icon name="arrow" size={12}/>
          </button>
        </div>
      ))}
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