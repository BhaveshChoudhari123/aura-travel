import { useEffect, useState } from "react";
import { CloudSun, Droplets, Wind } from "lucide-react";
import { getWeather } from "../services/api";

const EMOJI = { Clear: "☀️", Sunny: "☀️", "Mostly Clear": "🌤️", "Partly Cloudy": "⛅", Pleasant: "🌤️", Foggy: "🌫️", Drizzle: "🌦️", Rain: "🌧️", "Light Rain": "🌦️", Snow: "❄️", Thunderstorm: "⛈️" };

export default function WeatherCard({ destination, days }) {
  const [w, setW] = useState(null);
  useEffect(() => {
    if (!destination) return;
    getWeather(destination, days || 7).then(setW).catch(() => setW(null));
  }, [destination, days]);
  if (!w) return null;
  return (
    <div className="card">
      <h3 style={{ display: "flex", gap: 8, alignItems: "center" }}><CloudSun size={18} /> Weather in {w.destination}</h3>
      <div style={{ fontSize: "2rem", fontWeight: 800 }}>{w.temperature}°C <small style={{ fontSize: ".95rem", color: "var(--text-2)" }}>{EMOJI[w.condition] || "🌤️"} {w.condition}</small></div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: ".88rem", color: "var(--text-2)", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Droplets size={15} /> {w.rain_probability}% rain · {w.humidity}% humidity</span>
        <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Wind size={15} /> {w.wind_kph} kph</span>
        {w.source === "demo" && <span style={{ fontSize: ".75rem" }}>(offline estimate)</span>}
      </div>
      {w.forecast?.length > 0 && (
        <div className="wx-strip">
          {w.forecast.slice(0, 7).map((f) => (
            <div key={f.day} className="wx-day">
              <small>{f.day}</small>
              <span style={{ fontSize: "1.3rem" }}>{EMOJI[f.condition] || "🌤️"}</span>
              <strong>{f.max}°</strong><small style={{ color: "var(--text-3)" }}>{f.min}°</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
