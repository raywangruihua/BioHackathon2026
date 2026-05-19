'use client';

import React from 'react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import Avatar, { type AvatarTone } from '@/components/Avatar';
import Eyebrow from '@/components/Eyebrow';
import Stat from '@/components/Stat';
import type { GoFn } from '@/lib/screens';


// src/doctor.jsx — clinician view: patient queue + patient detail

const PATIENTS: { id: number; name: string; age: number; risk: number; band: string; tone: AvatarTone; last: string; cycles: string; flag: string; status: string }[] = [
  { id: 1, name: "Anya Verma",     age: 24, risk: 78, band: "high",     tone: "rose",
    last: "May 17, 2026",  cycles: "5/12 mo", flag: "Cycle > 35 days",  status: "New report" },
  { id: 2, name: "Priya Khanna",   age: 28, risk: 64, band: "moderate", tone: "accent",
    last: "May 16, 2026",  cycles: "8/12 mo", flag: "Hormonal acne",     status: "Follow-up" },
  { id: 3, name: "Mehak Sharma",   age: 31, risk: 52, band: "moderate", tone: "warn",
    last: "May 14, 2026",  cycles: "9/12 mo", flag: "Weight & mood",     status: "Awaiting labs" },
  { id: 4, name: "Sara D'Souza",   age: 22, risk: 32, band: "low",      tone: "sage",
    last: "May 12, 2026",  cycles: "11/12 mo", flag: "—",                status: "Cleared" },
  { id: 5, name: "Tanvi Mehta",    age: 27, risk: 71, band: "high",     tone: "rose",
    last: "May 11, 2026",  cycles: "6/12 mo", flag: "Hirsutism + cycle", status: "Needs review" },
  { id: 6, name: "Lina Bose",      age: 33, risk: 44, band: "moderate", tone: "accent",
    last: "May 10, 2026",  cycles: "10/12 mo", flag: "Insulin signal",   status: "Follow-up" },
];

const Doctor = ({ go }: { go: GoFn }) => {
  const [selected, setSelected] = React.useState(PATIENTS[0]);

  return (
    <div className="page-enter" style={{ padding: "32px 0 80px" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between",
          marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Eyebrow color="var(--accent)">Clinician dashboard</Eyebrow>
            <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.05, margin: "12px 0 0",
              fontWeight: 500, letterSpacing: "-.02em" }}>
              Good morning, <span className="serif-it" style={{ color: "var(--primary)" }}>
              Dr. Chandra.</span>
            </h1>
            <div style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 6 }}>
              You have <b style={{ color: "var(--ink)" }}>3 new reports</b> and{" "}
              <b style={{ color: "var(--ink)" }}>4 consultations</b> today.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-sm"><Icon name="search" size={14}/> Search patients</button>
            <button className="btn btn-primary btn-sm"><Icon name="plus" size={14}/> Add patient</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
          <DocStat label="Patients this month" value="42" delta="+8" tone="primary"/>
          <DocStat label="High-risk reports" value="11" delta="+3" tone="warn"/>
          <DocStat label="Avg. response time" value="4.2h" delta="−12%" tone="sage" deltaGood/>
          <DocStat label="Today's consults"   value="4"  delta="2 video, 2 chat" tone="accent"/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 22 }}>
          <Queue selected={selected} setSelected={setSelected}/>
          <PatientDetail patient={selected} go={go}/>
        </div>
      </div>
    </div>
  );
};

const DocStat = ({ label, value, delta, tone, deltaGood = false }) => {
  const tones = {
    primary: "var(--primary)", warn: "var(--warn)", sage: "var(--sage)", accent: "var(--accent)",
  };
  return (
    <div className="card" style={{ padding: 20, borderRadius: 22 }}>
      <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
        <div className="serif" style={{ fontSize: 36, lineHeight: 1, color: tones[tone],
          fontWeight: 500, letterSpacing: "-.015em" }}>{value}</div>
        <div style={{ fontSize: 12, color: deltaGood ? "var(--sage)" : "var(--ink-2)",
          fontWeight: 600 }}>{delta}</div>
      </div>
    </div>
  );
};

// ───────── Patient queue ─────────
const Queue = ({ selected, setSelected }) => {
  const [filter, setFilter] = React.useState("All");
  const filtered = filter === "All" ? PATIENTS :
    PATIENTS.filter(p => p.band === filter.toLowerCase());

  const bandTone = (b) => ({
    high:     { bg: "var(--primary-soft)", fg: "var(--primary-deep)" },
    moderate: { bg: "var(--warn-soft)",    fg: "#8A4F1F" },
    low:      { bg: "var(--sage-soft)",    fg: "#476158" },
  })[b];

  return (
    <div className="card" style={{ padding: 22, borderRadius: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16 }}>
        <h3 className="serif" style={{ fontSize: 22, margin: 0, fontWeight: 500 }}>Patient queue</h3>
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "High", "Moderate", "Low"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              height: 30, padding: "0 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: filter === f ? "var(--ink)" : "transparent",
              color: filter === f ? "#fff" : "var(--ink-2)",
              border: filter === f ? "none" : "1px solid var(--line)",
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid",
        gridTemplateColumns: "1.5fr .8fr 1fr .9fr",
        gap: 8, padding: "0 12px 8px",
        fontSize: 11, color: "var(--muted)", letterSpacing: ".08em",
        textTransform: "uppercase", fontWeight: 600 }}>
        <div>Patient</div>
        <div>Risk</div>
        <div>Flag</div>
        <div>Status</div>
      </div>

      <div style={{ display: "grid", gap: 4 }}>
        {filtered.map(p => {
          const sel = p.id === selected.id;
          const tone = bandTone(p.band);
          return (
            <button key={p.id} onClick={() => setSelected(p)} style={{
              display: "grid",
              gridTemplateColumns: "1.5fr .8fr 1fr .9fr",
              gap: 8, alignItems: "center",
              padding: "14px 12px", borderRadius: 14, textAlign: "left",
              background: sel ? "var(--bg-tint)" : "transparent",
              border: sel ? "1px solid var(--line)" : "1px solid transparent",
              transition: "all .15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <Avatar name={p.name} tone={p.tone} size={36}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Age {p.age} · {p.last}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="serif" style={{ fontSize: 18, color: tone.fg,
                  fontWeight: 600, minWidth: 26 }}>{p.risk}</div>
                <div style={{ flex: 1, height: 4, background: "rgba(42,31,37,.06)", borderRadius: 99 }}>
                  <div style={{ width: `${p.risk}%`, height: "100%",
                    background: tone.fg, borderRadius: 99 }}/>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{p.flag}</div>
              <div>
                <span className="chip" style={{ background: tone.bg, color: tone.fg, fontSize: 11 }}>
                  {p.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ───────── Patient detail ─────────
const PatientDetail = ({ patient, go }) => {
  const tone = ({
    high:     { fg: "var(--primary)", soft: "var(--primary-soft)", label: "High likelihood" },
    moderate: { fg: "var(--warn)",    soft: "var(--warn-soft)",    label: "Moderate" },
    low:      { fg: "var(--sage)",    soft: "var(--sage-soft)",    label: "Low" },
  })[patient.band];

  return (
    <div className="card" style={{ padding: 28, borderRadius: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <Avatar name={patient.name} tone={patient.tone} size={64}/>
        <div style={{ flex: 1 }}>
          <h3 className="serif" style={{ fontSize: 26, margin: 0, fontWeight: 500 }}>{patient.name}</h3>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
            {patient.age} years old · ID #PRL-{1000 + patient.id} · Last update {patient.last}
          </div>
        </div>
        <button className="btn btn-soft btn-sm"><Icon name="chat" size={14}/> Message</button>
        <button className="btn btn-primary btn-sm"><Icon name="play" size={14}/> Start call</button>
      </div>

      {/* Risk strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
        <div style={{ padding: 16, borderRadius: 18, background: tone.soft }}>
          <div style={{ fontSize: 11.5, color: tone.fg, textTransform: "uppercase",
            letterSpacing: ".08em", fontWeight: 600 }}>Pearl score</div>
          <div className="serif" style={{ fontSize: 36, color: tone.fg, fontWeight: 500,
            lineHeight: 1, marginTop: 8 }}>{patient.risk}/100</div>
          <div style={{ fontSize: 12.5, color: tone.fg, marginTop: 4 }}>{tone.label}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 18, background: "var(--bg-tint)" }}>
          <div style={{ fontSize: 11.5, color: "var(--ink-2)", textTransform: "uppercase",
            letterSpacing: ".08em", fontWeight: 600 }}>Cycles tracked</div>
          <div className="serif" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1, marginTop: 8 }}>
            {patient.cycles}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 4 }}>Last 12 months</div>
        </div>
        <div style={{ padding: 16, borderRadius: 18, background: "var(--bg-tint)" }}>
          <div style={{ fontSize: 11.5, color: "var(--ink-2)", textTransform: "uppercase",
            letterSpacing: ".08em", fontWeight: 600 }}>Avg. cycle</div>
          <div className="serif" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1, marginTop: 8 }}>
            38d
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 4 }}>
            Above 35d threshold
          </div>
        </div>
      </div>

      {/* Rotterdam criteria checklist */}
      <div style={{ padding: 22, borderRadius: 22, background: "rgba(255,255,255,.5)",
        border: "1px solid var(--line)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase",
              letterSpacing: ".08em", fontWeight: 600 }}>Rotterdam criteria</div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>
              2 of 3 likely met
            </div>
          </div>
          <span className="chip" style={{ background: tone.soft, color: tone.fg }}>
            Suggests PCOS
          </span>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <CriterionRow met label="Oligo/anovulation"
            note="5 periods in 12 mo · avg cycle 38d"/>
          <CriterionRow met label="Clinical or biochemical hyperandrogenism"
            note="Patient-reported hirsutism + persistent jawline acne"/>
          <CriterionRow met={false} label="Polycystic ovaries on ultrasound"
            note="Not yet ordered · recommend pelvic US"/>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <LabsCard/>
        <NotesCard/>
      </div>
    </div>
  );
};

const CriterionRow = ({ met, label, note }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 10,
    borderRadius: 12 }}>
    <div style={{
      width: 22, height: 22, borderRadius: 7, flex: "none",
      background: met ? "var(--sage)" : "var(--bg-tint)",
      color: met ? "#fff" : "var(--muted)",
      display: "grid", placeItems: "center",
      border: met ? "none" : "1px solid var(--line)",
    }}>{met ? <Icon name="check" size={13} stroke={3}/> : "—"}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{note}</div>
    </div>
  </div>
);

const LabsCard = () => (
  <div style={{ padding: 20, borderRadius: 20, background: "rgba(255,255,255,.5)",
    border: "1px solid var(--line)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 12 }}>
      <div className="serif" style={{ fontSize: 17, fontWeight: 500 }}>Labs requested</div>
      <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, height: 28 }}>
        + Order more
      </button>
    </div>
    <div style={{ display: "grid", gap: 8 }}>
      {[
        ["Free testosterone", "Pending", "warn"],
        ["LH / FSH ratio",   "Pending", "warn"],
        ["Fasting insulin",   "Awaiting", "muted"],
        ["TSH",               "Done · 2.1", "sage"],
      ].map(([n, s, c], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between",
          padding: "8px 12px", borderRadius: 10, background: "var(--bg)",
          fontSize: 12.5 }}>
          <span>{n}</span>
          <span style={{ fontWeight: 600,
            color: c === "sage" ? "var(--sage)" : c === "warn" ? "var(--warn)" : "var(--muted)" }}>
            {s}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const NotesCard = () => (
  <div style={{ padding: 20, borderRadius: 20, background: "rgba(255,255,255,.5)",
    border: "1px solid var(--line)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 12 }}>
      <div className="serif" style={{ fontSize: 17, fontWeight: 500 }}>Clinical notes</div>
      <span style={{ fontSize: 11.5, color: "var(--muted)" }}>May 14 · last edit</span>
    </div>
    <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
      Patient reports cycles 35–47d for past 9 months, with persistent jawline acne and
      new chin hair growth in last 6 months. Mother has Type 2 diabetes. BMI 26.4.
      Plan: order labs (TSH done, normal), schedule pelvic US, discuss lifestyle &
      potential metformin trial after lab review.
    </p>
    <button className="btn btn-ghost btn-sm" style={{ marginTop: 14, fontSize: 12, height: 28 }}>
      <Icon name="plus" size={12}/> Add note
    </button>
  </div>
);

export default Doctor;