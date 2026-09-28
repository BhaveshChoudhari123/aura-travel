import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { searchDestinations, recommendDestinations } from "../services/api";

const IMGS = {
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=60",
  Pune: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=60",
  Mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=60",
  Delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=60",
  Jaipur: "https://images.unsplash.com/photo-1599661046289-e318978c876f?w=800&q=60",
  Manali: "https://images.unsplash.com/photo-1626621349274-7b3b0aede0a2?w=800&q=60",
  Dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=60",
  Tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=60",
  Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=60",
  Bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=60",
};

export default function Explore() {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [rec, setRec] = useState({ budget: 20000, duration: 4, style: "Adventure", interest: "Nature" });
  const [recs, setRecs] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => searchDestinations(q).then(setList).catch(() => setList([])), 250);
    return () => clearTimeout(t);
  }, [q]);

  const find = async () => {
    const r = await recommendDestinations({ budget: rec.budget, duration: rec.duration, travel_styles: [rec.style], interests: [rec.interest] });
    setRecs(r);
  };

  return (
    <div className="container page">
      <span className="eyebrow">Explore</span>
      <h1>Destinations & smart suggestions</h1>
      <div className="card" style={{ display: "flex", gap: 10, alignItems: "center", margin: "14px 0 20px" }}>
        <Search size={18} /><input className="input" style={{ border: 0 }} placeholder="Search destinations…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search destinations" />
      </div>
      <div className="grid3">
        {list.map((d) => (
          <div key={d.name} className="card dest-card">
            <img src={IMGS[d.name]} alt={d.name} loading="lazy" />
            <h3 style={{ marginTop: 10 }}>{d.name} · ⭐{d.rating}</h3>
            <p style={{ margin: "0 0 6px" }}>{d.description}</p>
            <small style={{ color: "var(--text-2)" }}>Best for: {d.best_for}<br />{d.budget} · {d.duration}</small>
            <button className="btn btn-sm" style={{ marginTop: 10, width: "100%", justifyContent: "center" }} onClick={() => nav(`/planner?destination=${d.name}`)}>Plan This Trip</button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 26 }}>
        <h2><Sparkles size={18} style={{ verticalAlign: -3 }} /> Not sure where to go?</h2>
        <p>Tell us your budget, duration and vibe — we'll suggest destinations you may enjoy.</p>
        <div className="grid4">
          <div className="field"><label>Budget (₹)</label><input type="number" className="input" value={rec.budget} onChange={(e) => setRec({ ...rec, budget: Number(e.target.value) })} /></div>
          <div className="field"><label>Duration (days)</label><input type="number" className="input" value={rec.duration} onChange={(e) => setRec({ ...rec, duration: Number(e.target.value) })} /></div>
          <div className="field"><label>Style</label><select className="select" value={rec.style} onChange={(e) => setRec({ ...rec, style: e.target.value })}>{["Adventure", "Relaxed", "Luxury", "Budget", "Romantic", "Family", "Cultural", "Foodie", "Nature"].map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="field"><label>Interest</label><select className="select" value={rec.interest} onChange={(e) => setRec({ ...rec, interest: e.target.value })}>{["Beaches", "Mountains", "Food", "Culture", "Adventure", "Nature", "Shopping", "Nightlife"].map((x) => <option key={x}>{x}</option>)}</select></div>
        </div>
        <button className="btn" onClick={find}>Find my destinations</button>
        {recs && (
          <div className="grid3" style={{ marginTop: 16 }}>
            {recs.map((d) => (
              <div key={d.name} className="card">
                <h3>{d.name}</h3>
                <ul style={{ paddingLeft: 18, fontSize: ".88rem", color: "var(--text-2)" }}>{d.why.map((w) => <li key={w}>{w}</li>)}</ul>
                <small>{d.estimated_budget} · {d.ideal_duration}</small><br />
                <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => nav(`/planner?destination=${d.name}`)}>Plan This Destination</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
