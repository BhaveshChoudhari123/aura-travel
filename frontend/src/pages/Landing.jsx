import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Wallet, UtensilsCrossed, CalendarDays, MapPin, ArrowRight, CloudSun } from "lucide-react";

const FEATURES = [
  { Icon: Sparkles, t: "AI-Powered Itineraries", d: "Morning/afternoon/evening plans tuned to your style, pace and interests." },
  { Icon: Wallet, t: "Smart Budget Planning", d: "Every day stays inside your budget with a clear visual breakdown." },
  { Icon: CloudSun, t: "Weather-Aware Plans", d: "Rain expected? Your itinerary shifts to museums, cafes and markets." },
  { Icon: CalendarDays, t: "Day-by-Day Scheduling", d: "Realistic pacing with travel gaps, food stops and rest built in." },
  { Icon: UtensilsCrossed, t: "Local Food Discovery", d: "Regional dishes, street food and cafes matched to your taste." },
  { Icon: MapPin, t: "Explore & Map", d: "Hidden gems, live OpenStreetMap markers and day-wise routes." },
];

const DESTS = [
  { name: "Goa", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=60", tag: "Beaches & sunsets" },
  { name: "Tokyo", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=60", tag: "Neon & temples" },
  { name: "Paris", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=60", tag: "Art & cafes" },
  { name: "Bali", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=60", tag: "Temples & surf" },
  { name: "Jaipur", img: "https://images.unsplash.com/photo-1599661046289-e318978c876f?w=800&q=60", tag: "Palaces & bazaars" },
  { name: "Manali", img: "https://images.unsplash.com/photo-1626621349274-7b3b0aede0a2?w=800&q=60", tag: "Snow & treks" },
];

export default function Landing() {
  const [dest, setDest] = useState("");
  const nav = useNavigate();
  return (
    <div className="container">
      <section className="hero">
        <div>
          <span className="eyebrow"><Sparkles size={13} /> Your AI-powered travel companion</span>
          <h1>Plan your next adventure <span>with AI.</span></h1>
          <p>Tell us where you want to go, what you love, and how you want to travel. Aura Travel creates a personalized itinerary in seconds.</p>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <Link className="btn" to="/planner">Plan My Trip <ArrowRight size={16} /></Link>
            <Link className="btn btn-ghost" to="/explore">Explore Destinations</Link>
          </div>
          <form className="card hero-search" onSubmit={(e) => { e.preventDefault(); nav(`/planner?destination=${encodeURIComponent(dest || "Goa")}`); }}>
            <MapPin size={18} />
            <input placeholder="Where to? Try Goa, Tokyo, Bali…" value={dest} onChange={(e) => setDest(e.target.value)} aria-label="Destination" />
            <button className="btn btn-sm" type="submit">Go</button>
          </form>
        </div>
        <div className="hero-visual">
          <div className="orb" style={{ width: 230, height: 230, background: "#c4b5fd", top: -20, right: 10 }} />
          <div className="orb" style={{ width: 150, height: 150, background: "#a5e8dd", bottom: 0, left: -10 }} />
          <motion.div className="trip-mock" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=60" alt="Traveller overlooking mountains" loading="lazy" />
            <h3 style={{ marginTop: 12 }}>5-Day Bali Escape</h3>
            <p style={{ margin: "2px 0 10px", fontSize: ".9rem" }}>Temples at dawn, rice terraces at noon, beach clubs at sunset — ₹42,800 estimated.</p>
            <div className="budget-bar"><i style={{ width: "68%" }} /></div>
          </motion.div>
          <div className="float-card" style={{ top: 26, left: -12 }}>✨ Itinerary ready in seconds</div>
          <div className="float-card" style={{ bottom: 34, right: -6 }}>🌧️ Weather-aware routing</div>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><span className="eyebrow">Features</span><h2>Everything you need for the perfect trip</h2></div>
        <div className="grid3">
          {FEATURES.map(({ Icon, t, d }) => (
            <div className="card" key={t}><Icon size={22} color="var(--primary)" /><h3 style={{ marginTop: 10 }}>{t}</h3><p style={{ margin: 0 }}>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><span className="eyebrow">How it works</span><h2>From idea to itinerary in four steps</h2></div>
        <div className="grid4">
          {[["01", "Choose destination", "Pick anywhere — geocoded instantly with a live preview."], ["02", "Customize preferences", "Duration, travelers, budget, styles, interests and food."], ["03", "Get AI suggestions", "Loved places, hidden gems and weather-smart swaps."], ["04", "Travel with confidence", "Timeline, map, budget, share and download."]].map(([n, t, d]) => (
            <div className="card" key={n}><div style={{ fontWeight: 800, color: "var(--primary)" }}>{n}</div><h3>{t}</h3><p style={{ margin: 0 }}>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><span className="eyebrow">Trending</span><h2>Destinations travellers love</h2></div>
        <div className="grid3">
          {DESTS.map((d) => (
            <Link key={d.name} className="card dest-card" to={`/planner?destination=${d.name}`}>
              <img src={d.img} alt={d.name} loading="lazy" /><h3 style={{ marginTop: 10 }}>{d.name}</h3>
              <p style={{ margin: 0 }}>{d.tag}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="card glass cta-band">
          <h2>Your next adventure starts here.</h2>
          <p>No signup. No fees. Just your perfect trip.</p>
          <Link className="btn btn-warm" to="/planner">Plan My Trip <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}
