'use client';

import React from 'react';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import Avatar from '@/components/Avatar';
import Eyebrow from '@/components/Eyebrow';
import Stat from '@/components/Stat';
import type { GoFn } from '@/lib/screens';


// src/booking.jsx — appointment booking flow

const DOCTORS = [
  { id: "mira",  name: "Dr. Mira Chandra",  spec: "Endocrinology · PCOS", years: 12, rate: 4.9,
    reviews: 214, tone: "sage", langs: "English, Hindi", price: 60,
    bio: "PCOS specialist with a focus on insulin-resistance phenotypes and integrative care.",
    next: "Tomorrow, 9:30 AM" },
  { id: "aanya", name: "Dr. Aanya Iyer",    spec: "Reproductive Health",   years: 8,  rate: 4.8,
    reviews: 138, tone: "accent", langs: "English, Tamil", price: 55,
    bio: "Gynecologist with extensive experience in cycle disorders and hormonal acne.",
    next: "Mon, 11:00 AM" },
  { id: "rhea",  name: "Dr. Rhea Banerjee", spec: "Nutrition · PCOS",      years: 6,  rate: 4.9,
    reviews: 96,  tone: "warn", langs: "English, Bengali", price: 45,
    bio: "Registered dietician focused on PCOS-related metabolic and lifestyle support.",
    next: "Today, 6:00 PM" },
];

const Booking = ({ go }: { go: GoFn }) => {
  const [doctor, setDoctor]   = React.useState(DOCTORS[0]);
  const [day, setDay]         = React.useState(1);  // 0-6 (next 7 days)
  const [slot, setSlot]       = React.useState("10:00 AM");
  const [type, setType]       = React.useState("Video");
  const [confirmed, setConfirmed] = React.useState(false);

  if (confirmed) return <Confirmation doctor={doctor} day={day} slot={slot} type={type} go={go}/>;

  return (
    <div className="page-enter" style={{ padding: "32px 0 80px" }}>
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <Eyebrow>Book a consultation</Eyebrow>
          <h1 className="serif" style={{ fontSize: 44, lineHeight: 1.05, margin: "12px 0 0",
            fontWeight: 500, letterSpacing: "-.02em" }}>
            Choose a clinician who fits <span className="serif-it"
              style={{ color: "var(--primary)" }}>your story.</span>
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 22 }}>
          {/* Left: doctor list + filters */}
          <div>
            {/* <div className="card" style={{ padding: 20, borderRadius: 22, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["All specialties","PCOS","Endocrinology","Nutrition","Reproductive"].map((f, i) => (
                  <span key={f} className="chip" style={{
                    background: i === 0 ? "var(--ink)" : "transparent",
                    color: i === 0 ? "#fff" : "var(--ink-2)",
                    border: i === 0 ? "none" : "1px solid var(--line)",
                  }}>{f}</span>
                ))}
              </div>
            </div> */}
            <div style={{ display: "grid", gap: 12 }}>
              {DOCTORS.map(d => (
                <DoctorCard key={d.id} d={d} selected={doctor.id === d.id}
                  onSelect={() => setDoctor(d)}/>
              ))}
            </div>
          </div>

          {/* Right: date/time picker for selected doctor */}
          <div className="card" style={{ padding: 28, borderRadius: 28, position: "sticky", top: 90 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <Avatar name={doctor.name} tone={doctor.tone} size={56}/>
              <div style={{ flex: 1 }}>
                <h3 className="serif" style={{ fontSize: 22, margin: 0, fontWeight: 500 }}>{doctor.name}</h3>
                <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{doctor.spec}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="serif" style={{ fontSize: 22, color: "var(--primary)" }}>${doctor.price}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>per session</div>
              </div>
            </div>

            <Section title="Visit type">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { id: "Video", icon: "play",     sub: "20–30 min" },
                  { id: "Chat",  icon: "chat",     sub: "Async, 24h" },
                  { id: "Clinic",icon: "calendar", sub: "In-person" },
                ].map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} style={{
                    padding: 14, borderRadius: 14,
                    background: type === t.id ? "var(--primary-soft)" : "#fff",
                    border: `1.5px solid ${type === t.id ? "var(--primary)" : "var(--line)"}`,
                    textAlign: "left",
                  }}>
                    <Icon name={t.icon} size={16} style={{
                      color: type === t.id ? "var(--primary-deep)" : "var(--ink)" }}/>
                    <div style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>{t.id}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{t.sub}</div>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Day">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date(2026, 4, 18 + i);
                  const dow = date.toLocaleDateString("en", { weekday: "short" });
                  const dnum = date.getDate();
                  const sel = day === i;
                  return (
                    <button key={i} onClick={() => setDay(i)} style={{
                      padding: "10px 0", borderRadius: 14,
                      background: sel ? "var(--ink)" : "#fff",
                      color: sel ? "#fff" : "var(--ink)",
                      border: `1px solid ${sel ? "var(--ink)" : "var(--line)"}`,
                    }}>
                      <div style={{ fontSize: 10.5, opacity: .7, fontWeight: 500 }}>{dow}</div>
                      <div className="serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>{dnum}</div>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Time slot">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {["9:00 AM","9:30 AM","10:00 AM","10:30 AM",
                  "11:00 AM","2:00 PM","2:30 PM","3:00 PM"].map((s, i) => {
                  const disabled = i === 3 || i === 6;
                  const sel = slot === s && !disabled;
                  return (
                    <button key={s} disabled={disabled} onClick={() => setSlot(s)} style={{
                      height: 40, borderRadius: 12,
                      background: sel ? "var(--primary)" : disabled ? "var(--bg-tint)" : "#fff",
                      color: sel ? "#fff" : disabled ? "var(--muted)" : "var(--ink)",
                      border: `1px solid ${sel ? "var(--primary)" : "var(--line)"}`,
                      fontSize: 13.5, fontWeight: 500,
                      textDecoration: disabled ? "line-through" : "none",
                      opacity: disabled ? 0.55 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}>{s}</button>
                  );
                })}
              </div>
            </Section>

            <Section title="Share with your clinician">
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { t: "Pearl assessment report", on: true,  icon: "shield" },
                  { t: "Cycle & symptom log (past 90 days)", on: true, icon: "calendar" },
                  { t: "Personal notes (you'll see before sending)", on: false, icon: "book" },
                ].map((x, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12, background: "var(--bg-tint)",
                    fontSize: 13.5, cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked={x.on}
                      style={{ accentColor: "var(--primary)", width: 16, height: 16 }}/>
                    <Icon name={x.icon} size={14} style={{ color: "var(--ink-2)" }}/>
                    {x.t}
                  </label>
                ))}
              </div>
            </Section>

            <button className="btn btn-rose btn-lg" style={{ width: "100%", marginTop: 24 }}
              onClick={() => setConfirmed(true)}>
              Confirm — ${doctor.price} · {slot} <Icon name="arrow" size={14}/>
            </button>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
              <Icon name="lock" size={11}/> Cancel free up to 12 hours before
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)",
      textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{title}</div>
    {children}
  </div>
);

const DoctorCard = ({ d, selected, onSelect }) => (
  <button onClick={onSelect} style={{
    textAlign: "left", width: "100%", padding: 22, borderRadius: 22,
    background: selected ? "rgba(217,98,126,.05)" : "#fff",
    border: `1.5px solid ${selected ? "var(--primary)" : "var(--line)"}`,
    transition: "all .15s",
  }}>
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <Avatar name={d.name} tone={d.tone} size={56}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <h3 className="serif" style={{ fontSize: 20, margin: 0, fontWeight: 500 }}>{d.name}</h3>
          <span className="chip chip-sage" style={{ fontSize: 11 }}>
            <Icon name="dot" size={9}/> Available {d.next.split(",")[0].toLowerCase()}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
          {d.spec} · {d.years}y experience
        </div>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "10px 0 0", lineHeight: 1.55 }}>{d.bio}</p>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12,
          fontSize: 12.5, color: "var(--ink-2)" }}>
          <span><Icon name="star" size={12} style={{ color: "#E6A23C", fill: "#E6A23C" }}/>
            <b style={{ color: "var(--ink)", marginLeft: 4 }}>{d.rate}</b> ({d.reviews})</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--muted)" }}/>
          <span>{d.langs}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--muted)" }}/>
          <span><b style={{ color: "var(--ink)" }}>${d.price}</b></span>
        </div>
      </div>
    </div>
  </button>
);

// ───────── Confirmation ─────────
const Confirmation = ({ doctor, day, slot, type, go }) => {
  const date = new Date(2026, 4, 18 + day);
  return (
    <div className="page-enter" style={{ padding: "32px 0 80px" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="card" style={{ padding: "48px 48px 36px", borderRadius: 32,
          textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", inset: -40, opacity: .6,
            background: "radial-gradient(circle at 50% 0%, var(--sage-soft), transparent 60%)" }}/>

          <div style={{ position: "relative" }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", margin: "0 auto 24px",
              background: "var(--sage)", color: "#fff",
              display: "grid", placeItems: "center" }}>
              <Icon name="check" size={36} stroke={2.5}/>
            </div>
            <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.1, margin: 0,
              fontWeight: 500, letterSpacing: "-.02em" }}>
              You're booked.<br/>
              <span className="serif-it" style={{ color: "var(--primary)" }}>See you soon, Anya.</span>
            </h1>
            <div style={{ marginTop: 32, padding: 24, borderRadius: 22,
              background: "var(--bg-tint)", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <Avatar name={doctor.name} tone={doctor.tone}/>
                <div>
                  <div style={{ fontWeight: 600 }}>{doctor.name}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{doctor.spec}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Detail label="Date" value={date.toLocaleDateString("en-US",
                  { weekday: "short", month: "short", day: "numeric" })} icon="calendar"/>
                <Detail label="Time" value={slot} icon="moon"/>
                <Detail label="Type" value={type + " call"} icon={type === "Video" ? "play" : "chat"}/>
              </div>
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--line)",
                fontSize: 13, color: "var(--ink-2)" }}>
                We'll share your Pearl report and cycle log with the clinician before the call.
                You'll get a reminder by SMS 1 hour before.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28,
              flexWrap: "wrap" }}>
              {/* <button className="btn btn-primary" onClick={() => go("tracker")}>
                Back to my tracker
              </button> */}
              <button className="btn btn-primary">Add to calendar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value, icon }) => (
  <div>
    <div style={{ fontSize: 11.5, color: "var(--muted)", textTransform: "uppercase",
      letterSpacing: ".08em", fontWeight: 600 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontWeight: 600 }}>
      <Icon name={icon} size={14} style={{ color: "var(--primary)" }}/>
      {value}
    </div>
  </div>
);

export default Booking;