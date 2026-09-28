import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { getSharedTrip } from "../services/api";
import { fmtErr } from "../api/client";
import ItineraryTimeline from "../components/ItineraryTimeline";
import { printTrip } from "./TripResult";

export default function SharedTrip() {
  const { ref } = useParams();
  const [trip, setTrip] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { getSharedTrip(ref).then(setTrip).catch((e) => setErr(fmtErr(e, "Shared trip not found."))); }, [ref]);
  if (err) return <div className="container page"><div className="err">{err}</div></div>;
  if (!trip) return <div className="container page"><div className="skel" style={{ height: 220 }} /></div>;
  return (
    <div className="container page">
      <span className="eyebrow">Shared itinerary</span>
      <h1>{trip.destination} — {trip.duration} days</h1>
      <p>{trip.summary}</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }} className="no-print">
        <button className="btn btn-sm" onClick={() => printTrip(trip)}><Download size={15} /> Download Itinerary</button>
        <Link className="btn btn-ghost btn-sm" to="/planner">Plan your own</Link>
      </div>
      {(trip.days || []).map((d) => <ItineraryTimeline key={d.id || d.day} day={d} />)}
    </div>
  );
}
