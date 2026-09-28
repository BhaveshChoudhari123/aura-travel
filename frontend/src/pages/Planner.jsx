import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Minus, Plus, Sparkles } from "lucide-react";
import { geocode, getSuggestions, planTrip } from "../services/api";
import { addRecentTrip } from "../services/tripService";
import { fmtErr } from "../api/client";
import AIThinking from "../components/AIThinking";
import SuggestionCard from "../components/SuggestionCard";

const DURATIONS = [1, 2, 3, 4, 5, 7, 10, 14];
const TTYPES = ["Solo", "Couple", "Friends", "Family", "Group"];
const TIERS = [
  { n: "Budget", r: "₹5,000 – ₹15,000", v: 10000 },
  { n: "Moderate", r: "₹15,000 – ₹30,000", v: 22500 },
  { n: "Comfort", r: "₹30,000 – ₹60,000", v: 45000 },
  { n: "Premium", r: "₹60,000+", v: 80000 },
];
const STYLES = ["Adventure", "Relaxed", "Luxury", "Budget", "Romantic", "Family", "Solo", "Cultural", "Foodie", "Nature", "Photography", "Nightlife"];
const INTERESTS = ["Beaches", "Mountains", "Historical Places", "Museums", "Food", "Street Food", "Shopping", "Photography", "Adventure", "Wildlife", "Nightlife", "Temples", "Architecture", "Local Culture", "Cafes"];
const FOODS = ["Vegetarian", "Non-Vegetarian", "Vegan", "Street Food", "Local Cuisine", "Fine Dining", "Cafes", "No Preference"];
const STEPS = ["Destination", "Duration", "Travelers", "Budget", "Style", "Interests", "Food", "Generate"];

export default function Planner() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [geo, setGeo] = useState(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [sugg, setSugg] = useState([]);
  const [f, setF] = useState({
    destination: params.get("destination") || "", duration: 4, traveler_type: "Couple",
    adults: 2, children: 0, budget_tier: "Moderate", budget: 22500,
    travel_styles: ["Relaxed"], interests: ["Food", "Culture"], food_preferences: "Local Cuisine",
  });

  const lookup = async (dest) => {
    if (!dest || dest.trim().length < 2) return;
    setGeoBusy(true);
    try {
      const g = await geocode(dest);
      setGeo(g);
      try { setSugg((await getSuggestions(dest)).suggestions || []); } catch { setSugg([]); }
    } catch { setGeo(null); }
    finally { setGeoBusy(false); }
  };

  useEffect(() => { if (f.destination) lookup(f.destination); /* run once on prefill */ // eslint-disable-next-line
  }, []);

  const toggle = (key, v) => setF({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] });

  const generate = async () => {
    setBusy(true); setErr("");
    try {
      const trip = await planTrip({ ...f, travelers: f.adults + f.children });
      addRecentTrip(trip);
      nav(`/trip?id=${trip.id}`);
    } catch (e) { setErr(fmtErr(e)); setBusy(false); }
  };

  if (busy) return <div className="container page" style={{ maxWidth: 640 }}><AIThinking />{err && <div className="err" style={{ marginTop: 12 }}>{err}</div>}</div>;

  return (
    <div className="container page">
      <span className="eyebrow"><Sparkles size={13} /> AI trip planner</span>
      <h1>Design your journey</h1>
      <div className="builder" style={{ marginTop: 16 }}>
        <aside className="steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-item ${i === step ? "cur" : ""} ${i < step ? "done" : ""}`}>{i < step ? "✓" : `${i + 1}.`} {s}</div>
          ))}
        </aside>
        <div className="card">
          {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

          {step === 0 && (
            <><h2>Where do you want to go?</h2>
              <div className="field"><label htmlFor="d">Destination</label>
                <input id="d" className="input" placeholder="Goa, Pune, Mumbai, Dubai, Tokyo, Paris, London, Bali…" value={f.destination}
                  onChange={(e) => setF({ ...f, destination: e.target.value })} /></div>
              <div className="chips">{["Goa", "Pune", "Mumbai", "Delhi", "Jaipur", "Manali", "Dubai", "Tokyo", "Paris", "Bali"].map((d) => (
                <button key={d} className={`chip ${f.destination === d ? "on alt" : ""}`} onClick={() => { setF({ ...f, destination: d }); lookup(d); }}>{d}</button>))}</div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => lookup(f.destination)} disabled={geoBusy}>{geoBusy ? "Locating…" : "Continue"}</button>
              {geo && (
                <div className="geo-preview">
                  <MapPin size={18} />
                  <div><strong>{geo.city}{geo.country ? `, ${geo.country}` : ""}</strong><br />
                  <small>{geo.region} · {Number(geo.latitude).toFixed(2)}, {Number(geo.longitude).toFixed(2)} · {geo.timezone}</small></div>
                  <span className="src-badge">{geo.source === "open-meteo" ? "live" : "offline"}</span>
                </div>
              )}
              {sugg.length > 0 && (<><h3 style={{ marginTop: 16 }}>Things you might love here</h3>
                {sugg.slice(0, 4).map((g) => (
                  <div key={g.category}><h4 className="sugg-head">{g.category}</h4>
                    <div className="grid2">{g.places.slice(0, 2).map((p) => <SuggestionCard key={p.title} place={p} />)}</div></div>
                ))}</>)}
            </>
          )}

          {step === 1 && (<><h2>How long is your trip?</h2><div className="pick-grid">
            {DURATIONS.map((d) => <button key={d} className={`pick ${f.duration === d ? "on" : ""}`} onClick={() => setF({ ...f, duration: d })}><strong>{d}</strong><small>{d === 1 ? "Day" : "Days"}</small></button>)}
          </div></>)}

          {step === 2 && (<><h2>Who's travelling?</h2><div className="chips">
            {TTYPES.map((t) => <button key={t} className={`chip ${f.traveler_type === t ? "on alt" : ""}`} onClick={() => setF({ ...f, traveler_type: t, adults: t === "Solo" ? 1 : t === "Couple" ? 2 : f.adults })}>{t}</button>)}
          </div>
          <div className="grid2" style={{ marginTop: 14 }}>
            <div className="counter"><span>Adults</span><span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="icon-btn" onClick={() => setF({ ...f, adults: Math.max(1, f.adults - 1) })}><Minus size={15} /></button><strong>{f.adults}</strong>
              <button className="icon-btn" onClick={() => setF({ ...f, adults: Math.min(30, f.adults + 1) })}><Plus size={15} /></button></span></div>
            <div className="counter"><span>Children</span><span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="icon-btn" onClick={() => setF({ ...f, children: Math.max(0, f.children - 1) })}><Minus size={15} /></button><strong>{f.children}</strong>
              <button className="icon-btn" onClick={() => setF({ ...f, children: Math.min(20, f.children + 1) })}><Plus size={15} /></button></span></div>
          </div></>)}

          {step === 3 && (<><h2>What is your approximate budget?</h2><div className="pick-grid">
            {TIERS.map((t) => <button key={t.n} className={`pick ${f.budget_tier === t.n ? "on" : ""}`} onClick={() => setF({ ...f, budget_tier: t.n, budget: t.v })}><strong>{t.n}</strong><small>{t.r}</small></button>)}
          </div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, marginTop: 14 }}>₹{Number(f.budget).toLocaleString("en-IN")}</div>
          <input type="range" className="range" min={5000} max={200000} step={1000} value={f.budget}
            onChange={(e) => setF({ ...f, budget: Number(e.target.value), budget_tier: "Custom" })} aria-label="Custom budget" />
          <small style={{ color: "var(--text-2)" }}>Custom budget</small></>)}

          {step === 4 && (<><h2>Pick your travel styles <small>(multiple)</small></h2><div className="chips">
            {STYLES.map((s) => <button key={s} className={`chip ${f.travel_styles.includes(s) ? "on" : ""}`} onClick={() => toggle("travel_styles", s)}>{s}</button>)}
          </div></>)}

          {step === 5 && (<><h2>What do you love? <small>(multiple)</small></h2><div className="chips">
            {INTERESTS.map((s) => <button key={s} className={`chip ${f.interests.includes(s) ? "on alt" : ""}`} onClick={() => toggle("interests", s)}>{s}</button>)}
          </div></>)}

          {step === 6 && (<><h2>What kind of food do you prefer?</h2><div className="chips">
            {FOODS.map((s) => <button key={s} className={`chip ${f.food_preferences === s ? "on alt" : ""}`} onClick={() => setF({ ...f, food_preferences: s })}>{s}</button>)}
          </div></>)}

          {step === 7 && (<><h2>Ready to create?</h2>
            <div className="summary-box">
              {[["Destination", f.destination], ["Duration", `${f.duration} days`], ["Travelers", `${f.traveler_type} · ${f.adults} adult(s)${f.children ? `, ${f.children} child(ren)` : ""}`],
                ["Budget", `₹${Number(f.budget).toLocaleString("en-IN")} (${f.budget_tier})`], ["Travel style", f.travel_styles.join(", ")],
                ["Interests", f.interests.join(", ")], ["Food", f.food_preferences]].map(([k, v]) => (
                <div className="b-row" key={k}><span>{k}</span><strong>{v}</strong></div>))}
            </div></>)}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button>}
            <span style={{ flex: 1 }} />
            {step < STEPS.length - 1
              ? <button className="btn" disabled={step === 0 && f.destination.trim().length < 2} onClick={() => { if (step === 0 && !geo) lookup(f.destination); setStep(step + 1); }}>Continue <ArrowRight size={16} /></button>
              : <button className="btn" onClick={generate}><Sparkles size={16} /> Create My AI Trip</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
