'use client';

import React from 'react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import Avatar from '@/components/Avatar';
import Eyebrow from '@/components/Eyebrow';
import Stat from '@/components/Stat';
import type { GoFn } from '@/lib/screens';


// src/tracker.jsx — cycle + symptom tracker

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// Mock cycle data — period days flagged
const TODAY = { y: 2026, m: 4, d: 17 }; // May 17 2026 (m is 0-indexed)
const PERIOD_DAYS = [
  // May
  { y: 2026, m: 4, d: 2 }, { y: 2026, m: 4, d: 3 }, { y: 2026, m: 4, d: 4 }, { y: 2026, m: 4, d: 5 },
  // April (skipped/long)
  // March
  { y: 2026, m: 2, d: 18 }, { y: 2026, m: 2, d: 19 }, { y: 2026, m: 2, d: 20 }, { y: 2026, m: 2, d: 21 },
];
const PREDICTED = [
  { y: 2026, m: 5, d: 8 }, { y: 2026, m: 5, d: 9 }, { y: 2026, m: 5, d: 10 }, { y: 2026, m: 5, d: 11 },
];
const SYMPTOM_DAYS = {
  "2026-4-15": ["acne", "fatigue"],
  "2026-4-14": ["fatigue"],
  "2026-4-12": ["mood"],
  "2026-4-10": ["cramps", "acne"],
  "2026-4-7":  ["fatigue", "mood"],
  "2026-4-3":  ["cramps"],
};

const SYMPTOMS = [
  { id: "cramps",  label: "Cramps",   icon: "drop",     color: "var(--primary)" },
  { id: "acne",    label: "Acne",     icon: "sparkle",  color: "var(--accent)" },
  { id: "mood",    label: "Mood",     icon: "heart",    color: "var(--warn)" },
  { id: "fatigue", label: "Fatigue",  icon: "moon",     color: "var(--sage)" },
  { id: "hair",    label: "Hair",     icon: "flower",   color: "#C76B9A" },
  { id: "bloat",   label: "Bloating", icon: "waves",    color: "#8A6FB8" },
];

const Tracker = ({ go }: { go: GoFn }) => {
  const [month, setMonth] = React.useState({ y: 2026, m: 4 }); // May 2026
  const [selected, setSelected] = React.useState({ y: 2026, m: 4, d: 15 });
  const [logged, setLogged] = React.useState(SYMPTOM_DAYS);

  const key = (d) => `${d.y}-${d.m}-${d.d}`;
  const symptomsToday = logged[key(selected)] || [];

  const toggleSymptom = (id) => {
    setLogged(prev => {
      const k = key(selected);
      const arr = prev[k] || [];
      const next = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
      return { ...prev, [k]: next };
    });
  };

  return (
    <div className="page-enter" style={{ padding: "32px 0 80px" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between",
          marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Eyebrow>Cycle & symptoms</Eyebrow>
            <h1 className="serif" style={{ fontSize: 44, lineHeight: 1.05, margin: "12px 0 0",
              fontWeight: 500, letterSpacing: "-.02em" }}>
              Your patterns, <span className="serif-it" style={{ color: "var(--primary)" }}>
              gently surfaced.</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-sm"><Icon name="download" size={14}/> Share with doctor</button>
            <button className="btn btn-primary btn-sm"><Icon name="plus" size={14}/> Log today</button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
          <StatPanel value="Day 14" label="of current cycle" sub="of usually 28" tone="primary"/>
          <StatPanel value="38 days" label="average cycle length" sub="↑ longer than typical" tone="warn"/>
          <StatPanel value="5" label="periods in 12 months" sub="Rotterdam criterion met" tone="primary"/>
          <StatPanel value="7" label="symptoms logged this month" sub="acne, fatigue, mood" tone="accent"/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }}>
          <CalendarCard month={month} setMonth={setMonth} selected={selected} setSelected={setSelected}
            logged={logged}/>
          <DayLogCard selected={selected} symptoms={symptomsToday} toggleSymptom={toggleSymptom}/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 22 }}>
          <CycleTrendCard/>
          <SymptomFrequency logged={logged}/>
        </div>
      </div>
    </div>
  );
};

const StatPanel = ({ value, label, sub, tone }) => {
  const colors = {
    primary: { fg: "var(--primary)", bar: "var(--primary-soft)" },
    accent:  { fg: "var(--accent)",  bar: "var(--accent-soft)" },
    warn:    { fg: "var(--warn)",    bar: "var(--warn-soft)" },
    sage:    { fg: "var(--sage)",    bar: "var(--sage-soft)" },
  }[tone];
  return (
    <div className="card" style={{ padding: 20, borderRadius: 22 }}>
      <div className="serif" style={{ fontSize: 32, lineHeight: 1, color: colors.fg,
        fontWeight: 500, letterSpacing: "-.015em" }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>{sub}</div>
    </div>
  );
};

// ───────── Calendar ─────────
const CalendarCard = ({ month, setMonth, selected, setSelected, logged }) => {
  const firstDay = new Date(month.y, month.m, 1);
  const dayCount = new Date(month.y, month.m + 1, 0).getDate();
  // Monday-first; getDay returns 0 (Sun) -> shift to 6
  const startCol = (firstDay.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= dayCount; d++) cells.push(d);

  const isPeriod = (d) => PERIOD_DAYS.some(p => p.y === month.y && p.m === month.m && p.d === d);
  const isPredicted = (d) => PREDICTED.some(p => p.y === month.y && p.m === month.m && p.d === d);
  const isToday = (d) => TODAY.y === month.y && TODAY.m === month.m && TODAY.d === d;
  const isSel = (d) => selected.y === month.y && selected.m === month.m && selected.d === d;
  const hasSym = (d) => (logged[`${month.y}-${month.m}-${d}`] || []).length > 0;

  const shift = (n) => {
    const nm = month.m + n;
    if (nm < 0) setMonth({ y: month.y - 1, m: 11 });
    else if (nm > 11) setMonth({ y: month.y + 1, m: 0 });
    else setMonth({ ...month, m: nm });
  };

  return (
    <div className="card" style={{ padding: 28, borderRadius: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 22 }}>
        <h3 className="serif" style={{ fontSize: 24, margin: 0, fontWeight: 500 }}>
          {MONTH_NAMES[month.m]} {month.y}
        </h3>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-ghost btn-sm" style={{ width: 38, padding: 0 }}
            onClick={() => shift(-1)}><Icon name="arrowL" size={14}/></button>
          <button className="btn btn-ghost btn-sm" style={{ width: 38, padding: 0 }}
            onClick={() => shift(1)}><Icon name="arrow" size={14}/></button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ fontSize: 11.5, fontWeight: 600, textAlign: "center",
            color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={"e"+i}/>;
          const p = isPeriod(d), pr = isPredicted(d), t = isToday(d),
                s = isSel(d), sy = hasSym(d);
          return (
            <button key={d} onClick={() => setSelected({ y: month.y, m: month.m, d })}
              style={{
                aspectRatio: "1", borderRadius: 14,
                display: "grid", placeItems: "center", position: "relative",
                background: p ? "var(--primary)"
                  : s ? "var(--ink)"
                  : pr ? "transparent"
                  : "transparent",
                color: (p || s) ? "#fff" : "var(--ink)",
                border: pr ? "1.5px dashed var(--primary)"
                  : s ? "none"
                  : "1px solid transparent",
                fontWeight: t ? 700 : 500, fontSize: 14,
                transition: "all .15s",
              }}>
              {d}
              {t && !s && !p && (
                <div style={{ position: "absolute", inset: 0, borderRadius: 14,
                  border: "1.5px solid var(--ink)" }}/>
              )}
              {sy && !p && !s && (
                <div style={{ position: "absolute", bottom: 5, left: "50%",
                  width: 4, height: 4, borderRadius: "50%", background: "var(--accent)",
                  transform: "translateX(-50%)" }}/>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 22,
        fontSize: 12, color: "var(--ink-2)" }}>
        <Legend swatch={<div style={{ width: 12, height: 12, borderRadius: 4,
          background: "var(--primary)" }}/>} label="Period day"/>
        <Legend swatch={<div style={{ width: 12, height: 12, borderRadius: 4,
          border: "1.5px dashed var(--primary)" }}/>} label="Predicted"/>
        <Legend swatch={<div style={{ width: 4, height: 4, borderRadius: "50%",
          background: "var(--accent)", margin: 4 }}/>} label="Symptoms logged"/>
        <Legend swatch={<div style={{ width: 12, height: 12, borderRadius: 4,
          border: "1.5px solid var(--ink)" }}/>} label="Today"/>
      </div>
    </div>
  );
};

const Legend = ({ swatch, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    {swatch}<span>{label}</span>
  </div>
);

// ───────── Day log ─────────
const DayLogCard = ({ selected, symptoms, toggleSymptom }) => {
  const dateLabel = new Date(selected.y, selected.m, selected.d).toLocaleDateString("en-US",
    { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="card" style={{ padding: 28, borderRadius: 28, display: "flex",
      flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", textTransform: "uppercase",
          letterSpacing: ".1em", fontWeight: 600 }}>Day log</div>
        <h3 className="serif" style={{ fontSize: 22, margin: "8px 0 0", fontWeight: 500 }}>
          {dateLabel}
        </h3>
      </div>

      <div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 10 }}>Flow</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {["None", "Spot", "Light", "Med", "Heavy"].map((l, i) => (
            <button key={l} style={{
              padding: "10px 0", borderRadius: 12, fontSize: 12.5, fontWeight: 500,
              border: "1px solid var(--line)",
              background: i === 0 ? "var(--primary-soft)" : "#fff",
              color: i === 0 ? "var(--primary-deep)" : "var(--ink-2)",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 10 }}>Symptoms</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SYMPTOMS.map(s => {
            const on = symptoms.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggleSymptom(s.id)} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 36, padding: "0 14px", borderRadius: 999,
                background: on ? s.color : "var(--bg-tint)",
                color: on ? "#fff" : "var(--ink-2)",
                fontSize: 13, fontWeight: 500,
                border: "1px solid " + (on ? "transparent" : "var(--line)"),
                transition: "all .15s",
              }}>
                <Icon name={s.icon} size={14}/> {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 10 }}>Mood</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["😣","😕","😐","🙂","😊"].map((e, i) => (
            <button key={i} style={{ flex: 1, padding: "10px 0", borderRadius: 12,
              fontSize: 22, background: i === 2 ? "var(--bg-tint)" : "transparent",
              border: "1px solid " + (i === 2 ? "var(--line)" : "transparent") }}>{e}</button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 10 }}>Note</div>
        <textarea rows={2} placeholder="Anything you'd like to remember about today…"
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid var(--line)",
            resize: "none", fontSize: 13.5, lineHeight: 1.5, fontFamily: "inherit",
            background: "var(--bg-tint)", outline: 0 }}/>
      </div>
    </div>
  );
};

// ───────── Cycle trend (bar chart) ─────────
const CycleTrendCard = () => {
  // last 8 cycles in days
  const cycles = [29, 32, 35, 38, 31, 41, 36, 38];
  const max = 50;
  return (
    <div className="card" style={{ padding: 28, borderRadius: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end",
        marginBottom: 18 }}>
        <div>
          <Eyebrow>Cycle length trend</Eyebrow>
          <h3 className="serif" style={{ fontSize: 22, margin: "8px 0 0", fontWeight: 500 }}>
            Last 8 cycles
          </h3>
        </div>
        <span className="chip chip-warn">Often &gt; 35 days</span>
      </div>

      <div style={{ position: "relative", height: 180, display: "flex", alignItems: "end",
        gap: 12, padding: "10px 0" }}>
        {/* threshold line */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: (35/max)*180,
          height: 0, borderTop: "1.5px dashed var(--warn)" }}>
          <span style={{ position: "absolute", right: 0, top: -18, fontSize: 11,
            color: "var(--warn)", fontWeight: 600 }}>35 days</span>
        </div>
        {cycles.map((c, i) => (
          <div key={i} style={{ flex: 1, height: "100%", display: "flex",
            flexDirection: "column", justifyContent: "end", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 11, color: "var(--ink-2)" }}>{c}</div>
            <div style={{ width: "100%", height: `${(c/max)*100}%`,
              background: c > 35 ? "var(--primary)" : "var(--primary-soft)",
              borderRadius: "8px 8px 4px 4px" }}/>
            <div style={{ fontSize: 10.5, color: "var(--muted)" }}>C{i+1}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: "var(--bg-tint)",
        fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
        <Icon name="info" size={12}/> 5 of your last 8 cycles ran longer than 35 days —
        meeting one of the Rotterdam criteria. Worth showing your clinician.
      </div>
    </div>
  );
};

// ───────── Symptom frequency ─────────
const SymptomFrequency = ({ logged }) => {
  // Count per symptom across logged days
  const counts = {};
  Object.values(logged).forEach(arr => arr.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
  const rows = SYMPTOMS.map(s => ({ ...s, n: counts[s.id] || 0 })).sort((a,b) => b.n - a.n);
  const max = Math.max(...rows.map(r => r.n), 1);

  return (
    <div className="card" style={{ padding: 28, borderRadius: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end",
        marginBottom: 18 }}>
        <div>
          <Eyebrow color="var(--accent)">Symptoms this month</Eyebrow>
          <h3 className="serif" style={{ fontSize: 22, margin: "8px 0 0", fontWeight: 500 }}>
            What's been showing up
          </h3>
        </div>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {rows.map(r => (
          <div key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
                <Icon name={r.icon} size={14} style={{ color: r.color }}/>
                {r.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>
                {r.n} {r.n === 1 ? "day" : "days"}
              </div>
            </div>
            <div style={{ height: 6, background: "rgba(42,31,37,.06)", borderRadius: 99 }}>
              <div style={{ width: `${(r.n/max)*100}%`, height: "100%", background: r.color,
                borderRadius: 99, transition: "width .4s" }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tracker;