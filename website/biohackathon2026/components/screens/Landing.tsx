'use client';

import React from 'react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import Avatar from '@/components/Avatar';
import Eyebrow from '@/components/Eyebrow';
import Stat from '@/components/Stat';
import type { GoFn } from '@/lib/screens';


// src/landing.jsx — marketing landing page for Pearl

const Landing = ({ go }: { go: GoFn }) => {
  return (
    <div className="page-enter">
      <Hero go={go} />
      <TrustStrip />
      <WhatIsPCOS />
      <HowItWorks go={go} />
      <AssessmentTeaser go={go} />
      <Testimonials />
      <FinalCTA go={go} />
      <Footer />
    </div>
  );
};

// ───────── Hero ─────────
const Hero = ({ go }) => (
  <section style={{ position: "relative", overflow: "hidden", paddingTop: 56, paddingBottom: 80 }}>
    {/* soft background blobs */}
    <div aria-hidden style={{
      position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
    }}>
      <div style={{ position: "absolute", top: -120, right: -120, width: 520, height: 520,
        background: "radial-gradient(closest-side, var(--primary-soft), transparent 70%)",
        filter: "blur(8px)", opacity: .9 }}/>
      <div style={{ position: "absolute", top: 200, left: -160, width: 480, height: 480,
        background: "radial-gradient(closest-side, var(--accent-soft), transparent 70%)",
        filter: "blur(8px)", opacity: .8 }}/>
    </div>

    <div className="container" style={{ position: "relative", zIndex: 1,
      display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 56, alignItems: "center" }}>
      <div>
        <Eyebrow>For women navigating PCOS</Eyebrow>
        <h1 className="serif" style={{ fontSize: 84, lineHeight: 1.02, margin: "20px 0 0",
          fontWeight: 500, letterSpacing: "-.025em" }}>
          Your body has been
          <br />
          <span className="serif-it" style={{ color: "var(--primary)" }}>trying to tell you</span> something.
        </h1>
        <p style={{ marginTop: 22, fontSize: 18.5, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 540 }}>
          Pearl helps you understand the signs of PCOS, track them over time,
          and connect with doctors who actually listen — gently, privately, on your timeline.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <button className="btn btn-rose btn-lg" onClick={() => go("assessment")}>
            Take the 3-minute check
            <Icon name="arrow" size={16} />
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => go("tracker")}>
            <Icon name="play" size={14} /> See how it works
          </button>
        </div>

        <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex" }}>
            {["MR","TS","JN","KP"].map((n,i)=>(
              <div key={i} style={{ marginLeft: i?-10:0, border: "2px solid var(--bg)", borderRadius: "50%" }}>
                <Avatar name={n} size={34} tone={["rose","accent","sage","warn"][i]} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.4 }}>
            <div style={{ display: "flex", gap: 2, color: "#E6A23C" }}>
              {[0,1,2,3,4].map(i => <Icon key={i} name="star" size={13} stroke={0} style={{ fill: "#E6A23C" }}/>)}
            </div>
            <div>Trusted by <b style={{ color: "var(--ink)" }}>12,400+</b> women</div>
          </div>
        </div>
      </div>

      {/* Hero illustration */}
      <HeroCard />
    </div>
  </section>
);

const HeroCard = () => (
  <div style={{ position: "relative", height: 560 }}>
    {/* big soft pearl */}
    <div style={{ position: "absolute", inset: "8% 4% 12% 8%", borderRadius: "50%",
      background: "radial-gradient(circle at 30% 28%, #fff 0%, var(--primary-soft) 45%, var(--primary) 130%)",
      boxShadow: "0 40px 80px -20px rgba(217,98,126,.4), inset -30px -40px 80px rgba(168,66,94,.18)" }}/>
    <div style={{ position: "absolute", left: "16%", top: "16%", width: 90, height: 70, borderRadius: "50%",
      background: "rgba(255,255,255,.55)", filter: "blur(2px)" }}/>

    {/* Floating info card 1 — cycle */}
    <div className="card" style={{ position: "absolute", left: -32, top: 40, padding: 18,
      width: 230, borderRadius: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "var(--primary-soft)",
          display: "grid", placeItems: "center", color: "var(--primary-deep)" }}>
          <Icon name="moon" size={18} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Cycle insight</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Day 14 · Ovulation</div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 4 }}>
        {Array.from({length:28}).map((_,i)=>(
          <div key={i} style={{ width: 5, height: i===13?20:i>=11&&i<=15?14:8, borderRadius: 3,
            background: i===13?"var(--primary)":i>=11&&i<=15?"var(--primary-soft)":"rgba(42,31,37,.08)" }}/>
        ))}
      </div>
    </div>

    {/* Floating info card 2 — risk */}
    <div className="card" style={{ position: "absolute", right: -16, top: 220, padding: 18,
      width: 240, borderRadius: 22 }}>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>Your risk indicators</div>
      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {[
          ["Cycle irregularity", 78, "var(--primary)"],
          ["Skin & hair signs", 42, "var(--accent)"],
          ["Energy & mood", 55, "var(--warn)"],
        ].map(([l,v,c],i)=>(
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span>{l}</span><span style={{ fontWeight: 600 }}>{v}%</span>
            </div>
            <div style={{ height: 5, background: "rgba(42,31,37,.06)", borderRadius: 99, marginTop: 4 }}>
              <div style={{ width: `${v}%`, height: "100%", background: c, borderRadius: 99 }}/>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Floating info card 3 — chat with dr */}
    <div className="card" style={{ position: "absolute", left: 30, bottom: 0, padding: 14,
      width: 280, borderRadius: 22, display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar name="Dr. M" tone="sage" size={42}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. Mira Chandra</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-2)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          “Let’s look at your last 3 cycles together.”
        </div>
      </div>
      <div className="chip chip-sage" style={{ height: 24, padding: "0 8px", fontSize: 11 }}>
        Online
      </div>
    </div>
  </div>
);

// ───────── Trust strip ─────────
const TrustStrip = () => (
  <section style={{ padding: "16px 0 64px" }}>
    <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32,
        padding: "28px 36px", borderRadius: 24,
        background: "linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,.4))",
        border: "1px solid var(--line)" }}>
        <Stat value="1 in 10" label="women have PCOS" color="var(--primary)"/>
        <Stat value="70%" label="go undiagnosed for years" color="var(--accent)"/>
        <Stat value="3 min" label="to take the assessment" color="var(--ink)"/>
        <Stat value="HIPAA" label="private & encrypted" color="var(--sage)"/>
      </div>
    </div>
  </section>
);

// ───────── What is PCOS ─────────
const WhatIsPCOS = () => {
  const signs = [
    {
      icon: "moon", tone: "rose",
      title: "Irregular cycles",
      body: "Periods that come less than 8× a year, are 35+ days apart, or stop entirely.",
      stat: "75%", statLabel: "of women with PCOS"
    },
    {
      icon: "sparkle", tone: "accent",
      title: "Skin & hair changes",
      body: "Persistent acne, hair growth on the face or chest, or hair thinning on the scalp.",
      stat: "60%", statLabel: "report this sign"
    },
    {
      icon: "activity", tone: "warn",
      title: "Energy, mood & weight",
      body: "Fatigue, mood shifts, insulin resistance, and stubborn weight changes.",
      stat: "50%", statLabel: "experience insulin issues"
    },
  ];
  return (
    <section style={{ padding: "80px 0" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "end" }}>
          <div>
            <Eyebrow>What is PCOS</Eyebrow>
            <h2 className="serif" style={{ fontSize: 56, lineHeight: 1.05, margin: "14px 0 0",
              fontWeight: 500, letterSpacing: "-.02em" }}>
              A hormonal condition,<br/>
              <span className="serif-it" style={{ color: "var(--primary)" }}>not a personal failing.</span>
            </h2>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 560 }}>
            Polycystic Ovary Syndrome affects how your ovaries work — but it shows up
            differently in every body. Pearl helps you recognize the patterns,
            track them over time, and bring real data to your doctor.
          </p>
        </div>

        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
          {signs.map((s, i) => (
            <div key={i} className="card" style={{ padding: 28, borderRadius: 26 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16,
                background: `var(--${s.tone === "rose" ? "primary" : s.tone}-soft)`,
                color: s.tone === "rose" ? "var(--primary-deep)" :
                  s.tone === "accent" ? "#4D3FA8" : "#8A4F1F",
                display: "grid", placeItems: "center" }}>
                <Icon name={s.icon} size={24} />
              </div>
              <h3 className="serif" style={{ fontSize: 24, margin: "20px 0 8px", fontWeight: 500 }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--ink-2)", margin: 0 }}>
                {s.body}
              </p>
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)",
                display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="serif" style={{ fontSize: 28, fontWeight: 600,
                  color: s.tone === "rose" ? "var(--primary)" :
                    s.tone === "accent" ? "var(--accent)" : "var(--warn)" }}>{s.stat}</span>
                <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{s.statLabel}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
          Pearl is an educational tool. Diagnosis requires a clinician.
        </div>
      </div>
    </section>
  );
};

// ───────── How it works ─────────
const HowItWorks = ({ go }) => {
  const steps = [
    { n: "01", title: "Take the assessment", body: "20 questions about your cycle, symptoms, and history — 3 minutes.", icon: "check" },
    { n: "02", title: "See your patterns", body: "A personal report shows which PCOS signs apply to you and how strongly.", icon: "chart" },
    { n: "03", title: "Track over time", body: "Log your cycle and daily symptoms to surface trends doctors miss.", icon: "calendar" },
    { n: "04", title: "Talk to a clinician", body: "Book a video consult and share your full report with one tap.", icon: "chat" },
  ];
  return (
    <section style={{ padding: "80px 0", background: "var(--bg-tint)" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 32 }}>
          <div>
            <Eyebrow color="var(--accent)">How Pearl works</Eyebrow>
            <h2 className="serif" style={{ fontSize: 56, lineHeight: 1.05, margin: "14px 0 0",
              fontWeight: 500, letterSpacing: "-.02em", maxWidth: 720 }}>
              From <span className="serif-it" style={{ color: "var(--accent)" }}>“something feels off”</span> to a clear next step.
            </h2>
          </div>
          <button className="btn btn-primary" onClick={() => go("assessment")}>
            Start now <Icon name="arrow" size={14}/>
          </button>
        </div>

        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div className="card" style={{ padding: 26, borderRadius: 24, height: "100%",
                background: "#fff" }}>
                <div className="serif-it" style={{ fontSize: 20, color: "var(--primary)" }}>{s.n}</div>
                <div style={{ marginTop: 32, width: 44, height: 44, borderRadius: 14,
                  background: "var(--bg)", display: "grid", placeItems: "center",
                  color: "var(--ink)" }}>
                  <Icon name={s.icon} size={20}/>
                </div>
                <h3 className="serif" style={{ fontSize: 20, margin: "16px 0 6px", fontWeight: 600 }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)", margin: 0 }}>{s.body}</p>
              </div>
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", top: 60, right: -14, color: "var(--muted)",
                  zIndex: 1, fontSize: 18 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ───────── Assessment teaser ─────────
const AssessmentTeaser = ({ go }) => (
  <section style={{ padding: "100px 0" }}>
    <div className="container" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64, alignItems: "center" }}>
      <div className="card" style={{ padding: 36, borderRadius: 32, position: "relative",
        background: "linear-gradient(180deg, #fff, #FFF6F1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="chip">Question 7 of 20</span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>~2 min left</span>
        </div>
        <div style={{ height: 4, background: "rgba(42,31,37,.06)", borderRadius: 99, marginTop: 14 }}>
          <div style={{ width: "35%", height: "100%", background: "var(--primary)", borderRadius: 99 }}/>
        </div>

        <h3 className="serif" style={{ fontSize: 32, lineHeight: 1.15, fontWeight: 500,
          margin: "32px 0 6px", letterSpacing: "-.015em" }}>
          How often do you experience acne, especially around your jawline?
        </h3>
        <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 24 }}>
          Hormonal acne is one indicator of higher androgens.
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {[
            ["Rarely or never", false],
            ["Occasionally — a few times a year", false],
            ["Often — a few times a month", true],
            ["Almost constantly", false],
          ].map(([t, sel], i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px", borderRadius: 16,
              border: `1.5px solid ${sel ? "var(--primary)" : "var(--line)"}`,
              background: sel ? "rgba(217,98,126,.06)" : "#fff",
              fontSize: 15, fontWeight: sel ? 600 : 500,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                border: `1.5px solid ${sel ? "var(--primary)" : "var(--line)"}`,
                background: sel ? "var(--primary)" : "transparent",
                color: "#fff", display: "grid", placeItems: "center",
              }}>{sel && <Icon name="check" size={12} stroke={3}/>}</div>
              {t}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button className="btn btn-ghost btn-sm"><Icon name="arrowL" size={14}/> Back</button>
          <button className="btn btn-rose btn-sm">Continue <Icon name="arrow" size={14}/></button>
        </div>
      </div>

      <div>
        <Eyebrow>The assessment</Eyebrow>
        <h2 className="serif" style={{ fontSize: 52, lineHeight: 1.05, margin: "14px 0 16px",
          fontWeight: 500, letterSpacing: "-.02em" }}>
          Questions that feel <span className="serif-it" style={{ color: "var(--primary)" }}>like a friend</span> asked them.
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 480 }}>
          We ask only what matters — no waiting rooms, no awkward forms.
          Skip anything that feels too personal. Your answers stay private.
        </p>

        <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "grid", gap: 14 }}>
          {[
            ["20 questions", "covering cycle, skin & hair, mood, and history"],
            ["Plain language", "no medical jargon, no clinical guilt-trips"],
            ["Save & resume", "come back any time, your progress is kept"],
          ].map(([t,b], i)=>(
            <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: 10, background: "var(--sage-soft)",
                color: "#476158", display: "grid", placeItems: "center", flex: "none" }}>
                <Icon name="check" size={14} stroke={2.4}/>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{t}</div>
                <div style={{ color: "var(--ink-2)", fontSize: 14 }}>{b}</div>
              </div>
            </li>
          ))}
        </ul>

        <button className="btn btn-rose btn-lg" style={{ marginTop: 32 }} onClick={() => go("assessment")}>
          Start your assessment <Icon name="arrow" size={16}/>
        </button>
      </div>
    </div>
  </section>
);

// ───────── Testimonials ─────────
const Testimonials = () => {
  const quotes = [
    { name: "Anita R.", age: 28, tone: "rose",
      text: "I'd been told 'it's just stress' for six years. Pearl gave me the language and the data to actually be heard." },
    { name: "Priya K.", age: 24, tone: "accent",
      text: "The tracker showed me my cycle had been 47 days on average. I had no idea — and neither did my GP until I shared the report." },
    { name: "Mehak S.", age: 31, tone: "sage",
      text: "It didn't feel like a medical app. It felt like someone finally took my questions seriously." },
  ];
  return (
    <section style={{ padding: "80px 0", background: "var(--bg-tint)" }}>
      <div className="container">
        <Eyebrow>Real stories</Eyebrow>
        <h2 className="serif" style={{ fontSize: 52, lineHeight: 1.05, margin: "14px 0 48px",
          fontWeight: 500, letterSpacing: "-.02em", maxWidth: 720 }}>
          From women who finally <span className="serif-it" style={{ color: "var(--primary)" }}>felt heard.</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
          {quotes.map((q, i) => (
            <div key={i} className="card" style={{ padding: 32, borderRadius: 26 }}>
              <div className="serif" style={{ fontSize: 64, lineHeight: 0.6, color: "var(--primary)",
                fontStyle: "italic" }}>“</div>
              <p className="serif" style={{ fontSize: 19, lineHeight: 1.45, fontWeight: 400,
                margin: "12px 0 28px", letterSpacing: "-.005em" }}>{q.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={q.name} tone={q.tone}/>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{q.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>Age {q.age} · Pearl member</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ───────── Final CTA band ─────────
const FinalCTA = ({ go }) => (
  <section style={{ padding: "100px 0" }}>
    <div className="container">
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 36, padding: "72px 60px",
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 70%, var(--accent) 130%)",
        color: "#fff",
      }}>
        <div aria-hidden style={{ position: "absolute", right: -100, top: -120, width: 380, height: 380,
          borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,.7), transparent 65%)" }}/>
        <div aria-hidden style={{ position: "absolute", right: 80, bottom: -80, width: 220, height: 220,
          borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,.45), transparent 65%)" }}/>

        <div style={{ position: "relative", maxWidth: 720 }}>
          <Eyebrow color="rgba(255,255,255,.8)">Start today</Eyebrow>
          <h2 className="serif" style={{ fontSize: 64, lineHeight: 1.03, margin: "16px 0 0",
            fontWeight: 500, letterSpacing: "-.025em" }}>
            Three minutes today.<br/>
            <span className="serif-it">A clearer picture for life.</span>
          </h2>
          <p style={{ fontSize: 17.5, lineHeight: 1.55, marginTop: 18, opacity: .9, maxWidth: 540 }}>
            Pearl is free to start. No insurance needed. No medical jargon, ever.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <button className="btn btn-lg" style={{ background: "#fff", color: "var(--primary-deep)" }}
              onClick={() => go("assessment")}>
              Take the assessment <Icon name="arrow" size={16}/>
            </button>
            <button className="btn btn-lg" style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}
              onClick={() => go("booking")}>
              Or book a consult
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ───────── Footer ─────────
const Footer = () => (
  <footer style={{ padding: "56px 0 32px", borderTop: "1px solid var(--line)" }}>
    <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 32 }}>
        <div>
          <Logo size={32}/>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 14, maxWidth: 320, lineHeight: 1.55 }}>
            Pearl is a women's health platform for understanding and managing PCOS,
            built with clinicians and women living with the condition.
          </p>
        </div>
        {[
          ["Product", ["Assessment", "Cycle tracker", "Book a doctor", "For clinics"]],
          ["Learn", ["What is PCOS", "Symptoms guide", "Rotterdam criteria", "Research"]],
          ["Company", ["About", "Privacy", "Terms", "Contact"]],
        ].map(([h, items]) => (
          <div key={h}>
            <div style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase",
              color: "var(--muted)", fontWeight: 600 }}>{h}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 8 }}>
              {items.map(x => <li key={x} style={{ fontSize: 14, color: "var(--ink-2)" }}>{x}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48, paddingTop: 22, borderTop: "1px solid var(--line)",
        display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)" }}>
        <span>© 2026 Pearl Health. For educational purposes — not a substitute for clinical diagnosis.</span>
        <span style={{ display: "flex", gap: 16 }}>
          <span><Icon name="shield" size={12}/> HIPAA-compliant</span>
          <span><Icon name="lock" size={12}/> End-to-end encrypted</span>
        </span>
      </div>
    </div>
  </footer>
);

export default Landing;