'use client';

import React from 'react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import Avatar, { type AvatarTone } from '@/components/Avatar';
import Eyebrow from '@/components/Eyebrow';
import Stat from '@/components/Stat';
import type { GoFn } from '@/lib/screens';
import type { ScreenResult, FullScreenResult, ShapSection, ShapFeature } from '@/components/screens/Assessment';


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
  const [screenResult, setScreenResult]   = React.useState<ScreenResult | null>(null);
  const [screenInputs, setScreenInputs]   = React.useState<Record<string, number> | null>(null);
  const [fullResult,   setFullResult]     = React.useState<FullScreenResult | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("screenResult");
      if (raw) setScreenResult(JSON.parse(raw) as ScreenResult);
      const inp = localStorage.getItem("screenInputs");
      if (inp) setScreenInputs(JSON.parse(inp) as Record<string, number>);
      const full = localStorage.getItem("fullScreenResult");
      if (full) setFullResult(JSON.parse(full) as FullScreenResult);
    } catch {}
  }, []);

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
          <PatientDetail patient={selected} screenResult={screenResult}
            screenInputs={screenInputs} fullResult={fullResult}
            setFullResult={setFullResult} go={go}/>
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

// ───────── Clinical SHAP section ─────────
const ClinicalShapSection = ({ condition, prob, shap }: {
  condition: string; prob: number; shap?: ShapSection;
}) => {
  const towardArr = (Array.isArray(shap?.toward) ? shap!.toward : Object.values(shap?.toward ?? {})) as ShapFeature[];
  const awayArr   = (Array.isArray(shap?.away)   ? shap!.away   : Object.values(shap?.away   ?? {})) as ShapFeature[];
  if (!shap || (towardArr.length === 0 && awayArr.length === 0)) return null;
  const isPositive = prob > 50;
  const riskLvl = prob > 70 ? "HIGH" : prob > 45 ? "MODERATE" : "LOW";
  const toneColor = prob > 70 ? "var(--primary)" : prob > 45 ? "var(--warn)" : "var(--sage)";

  return (
    <div style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,.5)",
      border: "1px solid var(--line)", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase",
            letterSpacing: ".08em", fontWeight: 600 }}>{condition} screening</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
            {isPositive ? `${condition} Positive` : `${condition} Negative`}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="serif" style={{ fontSize: 28, fontWeight: 500,
            color: toneColor, lineHeight: 1 }}>{Math.round(prob)}%</div>
          <div style={{ fontSize: 11, color: toneColor, fontWeight: 600 }}>{riskLvl}</div>
        </div>
      </div>

      {towardArr.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase",
            letterSpacing: ".06em", fontWeight: 600, marginBottom: 6 }}>Top findings supporting</div>
          <div style={{ display: "grid", gap: 3 }}>
            {towardArr.map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between",
                padding: "5px 10px", borderRadius: 8, background: "var(--bg)", fontSize: 12.5 }}>
                <span style={{ color: "var(--ink-2)" }}>{f.label}</span>
                <span style={{ fontWeight: 600 }}>{f.formatted}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {awayArr.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase",
            letterSpacing: ".06em", fontWeight: 600, marginBottom: 6 }}>Top findings against</div>
          <div style={{ display: "grid", gap: 3 }}>
            {awayArr.map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between",
                padding: "5px 10px", borderRadius: 8, background: "var(--bg)", fontSize: 12.5 }}>
                <span style={{ color: "var(--ink-2)" }}>{f.label}</span>
                <span style={{ fontWeight: 600 }}>{f.formatted}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ───────── Patient detail ─────────
const PatientDetail = ({ patient, screenResult, screenInputs, fullResult, setFullResult, go }) => {
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

      {screenResult && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase",
            letterSpacing: ".08em", fontWeight: 600, marginBottom: 10 }}>
            Pearl AI Screening Findings
          </div>
          <ClinicalShapSection condition="PCOS" prob={screenResult.pcosProb} shap={screenResult.pcosShap}/>
          <ClinicalShapSection condition="Endometriosis" prob={screenResult.endoProb} shap={screenResult.endoShap}/>
        </div>
      )}

      <ClinicalForm screenInputs={screenInputs} fullResult={fullResult} setFullResult={setFullResult}/>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <LabsCard/>
        <NotesCard/>
      </div>
    </div>
  );
};

// ───────── Clinical data entry form ─────────
const CLINICAL_FIELDS: { key: string; label: string; unit: string; group: string; min?: number; max?: number; step?: number }[] = [
  { key: "pulse",       label: "Pulse rate",            unit: "bpm",      group: "Vitals",      min: 40,  max: 180 },
  { key: "rr",          label: "Respiratory rate",      unit: "br/min",   group: "Vitals",      min: 5,   max: 50 },
  { key: "hb",          label: "Haemoglobin",           unit: "g/dL",     group: "Vitals",      min: 1,   max: 20, step: 0.1 },
  { key: "bp_sys",      label: "Systolic BP",           unit: "mmHg",     group: "Vitals",      min: 60,  max: 220 },
  { key: "bp_dia",      label: "Diastolic BP",          unit: "mmHg",     group: "Vitals",      min: 40,  max: 140 },
  { key: "fsh",         label: "FSH",                   unit: "mIU/mL",   group: "Hormones",    min: 0, step: 0.1 },
  { key: "lh",          label: "LH",                    unit: "mIU/mL",   group: "Hormones",    min: 0, step: 0.1 },
  { key: "tsh",         label: "TSH",                   unit: "mIU/L",    group: "Hormones",    min: 0, step: 0.01 },
  { key: "amh",         label: "AMH",                   unit: "ng/mL",    group: "Hormones",    min: 0, step: 0.1 },
  { key: "prl",         label: "Prolactin",             unit: "ng/mL",    group: "Hormones",    min: 0, step: 0.1 },
  { key: "prg",         label: "Progesterone",          unit: "ng/mL",    group: "Hormones",    min: 0, step: 0.1 },
  { key: "hcg_i",       label: "Beta-HCG I",            unit: "mIU/mL",   group: "Blood",       min: 0 },
  { key: "hcg_ii",      label: "Beta-HCG II",           unit: "mIU/mL",   group: "Blood",       min: 0 },
  { key: "vit_d3",      label: "Vitamin D3",            unit: "ng/mL",    group: "Blood",       min: 0, step: 0.1 },
  { key: "rbs",         label: "Random blood sugar",    unit: "mg/dL",    group: "Blood",       min: 50, max: 500 },
  { key: "ca_125",      label: "CA-125",                unit: "U/mL",     group: "Blood",       min: 0, step: 0.1 },
  { key: "crp",         label: "CRP",                   unit: "mg/L",     group: "Blood",       min: 0, step: 0.1 },
  { key: "follicle_l",  label: "Follicle count (L)",    unit: "",         group: "Ultrasound",  min: 0 },
  { key: "follicle_r",  label: "Follicle count (R)",    unit: "",         group: "Ultrasound",  min: 0 },
  { key: "avg_fsize_l", label: "Avg follicle size (L)", unit: "mm",       group: "Ultrasound",  min: 0, step: 0.1 },
  { key: "avg_fsize_r", label: "Avg follicle size (R)", unit: "mm",       group: "Ultrasound",  min: 0, step: 0.1 },
  { key: "endometrium", label: "Endometrial thickness", unit: "mm",       group: "Ultrasound",  min: 0, step: 0.1 },
  { key: "mental_health", label: "Mental health score", unit: "/100",     group: "Other",       min: 0, max: 100 },
];

const GROUPS = ["Vitals", "Hormones", "Blood", "Ultrasound", "Other"] as const;

const ClinicalForm = ({ screenInputs, fullResult, setFullResult }) => {
  const [open,    setOpen]    = React.useState(false);
  const [values,  setValues]  = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState<string | null>(null);
  const [done,    setDone]    = React.useState(!!fullResult);

  const set = (key: string, val: string) => setValues(v => ({ ...v, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    const numeric: Record<string, number> = {};
    for (const f of CLINICAL_FIELDS) {
      const v = parseFloat(values[f.key] ?? "");
      if (!isNaN(v)) numeric[f.key] = v;
    }
    // auto-calc FSH/LH if both present
    if (numeric.fsh != null && numeric.lh != null && numeric.lh > 0)
      numeric.fsh_lh = parseFloat((numeric.fsh / numeric.lh).toFixed(2));

    const body = { ...(screenInputs ?? {}), ...numeric };
    try {
      const res = await fetch("/api/screen/full", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const data = await res.json() as FullScreenResult;
      localStorage.setItem("fullScreenResult", JSON.stringify(data));
      setFullResult(data);
      setDone(true); setOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: open ? 14 : 0 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase",
            letterSpacing: ".08em", fontWeight: 600 }}>Full Clinical Screening</div>
          {done && !open && (
            <div style={{ fontSize: 12, color: "var(--sage)", marginTop: 2 }}>
              <Icon name="check" size={11}/> Report generated — visible on patient results page
            </div>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)}>
          {open ? "Cancel" : done ? "Re-run" : "Enter clinical data"}
          <Icon name={open ? "close" : "arrow"} size={12}/>
        </button>
      </div>

      {open && (
        <div style={{ padding: 20, borderRadius: 18, border: "1px solid var(--line)",
          background: "rgba(255,255,255,.5)" }}>
          {!screenInputs && (
            <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)",
              color: "#8A4F1F", fontSize: 12.5, marginBottom: 14 }}>
              No pre-screening data found. Ask the patient to complete the assessment first.
            </div>
          )}

          {GROUPS.map(group => {
            const fields = CLINICAL_FIELDS.filter(f => f.group === group);
            return (
              <div key={group} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase",
                  letterSpacing: ".08em", fontWeight: 600, marginBottom: 8 }}>{group}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {fields.map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 500,
                        display: "block", marginBottom: 4 }}>
                        {f.label}{f.unit ? ` (${f.unit})` : ""}
                      </label>
                      <input
                        type="number" min={f.min} max={f.max} step={f.step ?? 1}
                        value={values[f.key] ?? ""}
                        onChange={e => set(f.key, e.target.value)}
                        placeholder="—"
                        style={{ width: "100%", height: 38, padding: "0 10px", borderRadius: 10,
                          border: "1px solid var(--line)", background: "#fff",
                          fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--primary-soft)",
              color: "var(--primary-deep)", fontSize: 12.5, marginBottom: 12 }}>{error}</div>
          )}

          <button className="btn btn-primary" style={{ width: "100%" }}
            onClick={handleSubmit} disabled={loading || !screenInputs}>
            {loading
              ? "Running full screening…"
              : <><Icon name="sparkle" size={14}/> Generate full screening report</>}
          </button>
        </div>
      )}
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