import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Plus, Share2 } from "lucide-react";
import { getTrip, getLatestTrip, shareTrip } from "../services/api";
import { addRecentTrip } from "../services/tripService";
import { fmtErr } from "../api/client";
import ItineraryTimeline from "../components/ItineraryTimeline";
import BudgetOverview from "../components/BudgetOverview";
import WeatherCard from "../components/WeatherCard";
import MapView from "../components/MapView";
import Toast from "../components/Toast";

export function printTrip(trip) {
  const w = window.open("", "_blank", "width=900");
  const days = (trip.days || []).map((d) => {
    const sec = (arr, t) => `<h4>${t}</h4><ul>${(arr || []).map((a) => `<li><strong>[${a.category}] ${a.title}</strong> (${a.best_time || a.recommended_time || ""}) — ${a.description} <em>Rs.${a.estimated_cost}, ${a.duration || ""}, ${a.location || ""}</em></li>`).join("")}</ul>`;
    return `<h3>Day ${d.day}: ${d.title} (Rs.${d.estimated_cost})</h3><p>${d.summary || ""}</p>${sec(d.morning, "Morning")}${sec(d.afternoon, "Afternoon")}${sec(d.evening, "Evening")}`;
  }).join("");
  w.document.write(`<html><head><title>Aura Travel — ${trip.destination}</title><style>body{font-family:Arial;padding:32px;color:#111}h1{color:#312E81}h3{color:#7C3AED;border-bottom:1px solid #ddd;padding-bottom:4px}li{margin:4px 0}</style></head><body><h1>Aura Travel — ${trip.destination}</h1><p>${trip.summary || ""}</p><p><strong>${trip.duration} days · ${trip.travelers} travelers (${trip.traveler_type}) · Budget Rs.${trip.budget} · Estimated Rs.${trip.estimated_total_cost}</strong></p><p>${trip.weather_note || ""}</p>${days}</body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => { w.print(); }, 400);
}

export default function TripResult() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [trip, setTrip] = useState(null);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const mapRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const t = id ? await getTrip(id) : await getLatestTrip();
        setTrip(t); addRecentTrip(t);
      } catch (e) { setErr(fmtErr(e, "Trip not found.")); }
    };
    load();
  }, [id]);

  const share = async () => {
    try {
      const { share_url } = await shareTrip(trip.id);
      const full = share_url.startsWith("http") ? share_url : `${window.location.origin}${share_url}`;
      if (navigator.share) await navigator.share({ title: `Trip to ${trip.destination}`, url: full }).catch(() => {});
      else await navigator.clipboard.writeText(full);
      setToast("Share link copied!");
    } catch (e) { setToast(fmtErr(e)); }
    setTimeout(() => setToast(""), 2600);
  };

  if (err) return <div className="container page"><div className="err">{err}</div><Link className="btn" to="/planner" style={{ marginTop: 12 }}>Plan a trip</Link></div>;
  if (!trip) return <div className="container page"><div className="skel" style={{ height: 240 }} /><div className="skel" style={{ height: 160, marginTop: 12 }} /></div>;

  return (
    <div className="container page">
      <Link className="btn btn-ghost btn-sm no-print" to="/planner"><ArrowLeft size={15} /> New search</Link>
      <div className="card glass trip-hero">
        <span className="eyebrow">Your AI itinerary</span>
        <h1>Your {trip.duration}-Day {trip.destination} {trip.travel_styles?.[0] || "Adventure"}</h1>
        <p>{trip.summary}</p>
        {trip.weather_note && <div className="wx-note">🌧️ {trip.weather_note}</div>}
        <div className="trip-chips">
          {[`${trip.duration} days`, `${trip.travelers} travelers`, `Budget ₹${Number(trip.budget).toLocaleString("en-IN")}`, `Est. ₹${Number(trip.estimated_total_cost).toLocaleString("en-IN")}`, ...(trip.travel_styles || [])].map((x) => (
            <span key={x}>{x}</span>))}
        </div>
        <div className="trip-actions no-print">
          <button className="btn btn-warm btn-sm" onClick={share}><Share2 size={15} /> Share</button>
          <button className="btn btn-ghost btn-sm" onClick={() => printTrip(trip)}><Download size={15} /> Download Itinerary</button>
          <Link className="btn btn-ghost btn-sm" to="/planner"><Plus size={15} /> Start a new trip</Link>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 18 }}>
        <BudgetOverview trip={trip} />
        <WeatherCard destination={trip.destination} days={trip.duration} />
      </div>

      <div style={{ marginTop: 18 }} ref={undefined}><MapView ref={mapRef} destination={trip.destination} days={trip.days} lat={trip.latitude} lng={trip.longitude} /></div>

      <h2 style={{ margin: "22px 0 12px" }}>Day-by-day timeline</h2>
      {(trip.days || []).map((d) => (
        <ItineraryTimeline key={d.id || d.day} day={d} onLocate={(a) => { mapRef.current?.locate(a); document.querySelector(".leaflet-container")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} />
      ))}
      <Toast msg={toast} />
    </div>
  );
}
