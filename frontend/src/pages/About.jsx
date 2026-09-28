export default function About() {
  return (
    <div className="container page" style={{ maxWidth: 820 }}>
      <span className="eyebrow">About</span>
      <h1>Aura Travel</h1>
      <p><strong>Your AI-powered travel companion.</strong> No signup, no fees. Aura Travel turns a destination and a few preferences into a realistic day-by-day itinerary — with food, timing, costs, live weather and maps.</p>
      <div className="grid2" style={{ marginTop: 18 }}>
        <div className="card"><h3>Free APIs first</h3><p>Weather and geocoding come from Open-Meteo (no key needed). Maps use OpenStreetMap + Leaflet. Every provider has an offline fallback, so demos never crash.</p></div>
        <div className="card"><h3>Optional OpenAI</h3><p>Set <code>OPENAI_API_KEY</code> for fully personalized itineraries. Without it, the built-in demo generator creates realistic weather-aware plans.</p></div>
      </div>
      <div className="card" style={{ marginTop: 18 }}><h3>Stack</h3><p>React · Vite · React Router · Axios · Framer Motion · Lucide · Leaflet · Django · DRF · SQLite (PostgreSQL-ready) · OpenAI (optional).</p></div>
    </div>
  );
}
