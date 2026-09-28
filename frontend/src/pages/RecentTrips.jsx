import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Copy, Plus, Trash2, Users, Wallet } from "lucide-react";
import { getRecentTrips, removeRecentTrip } from "../services/tripService";
import { deleteTrip } from "../services/api";

export default function RecentTrips() {
  const [trips, setTrips] = useState([]);
  const nav = useNavigate();
  useEffect(() => { setTrips(getRecentTrips()); }, []);

  const del = async (id) => {
    if (!confirm("Delete this trip?")) return;
    try { await deleteTrip(id); } catch { /* already gone server-side */ }
    removeRecentTrip(id);
    setTrips(getRecentTrips());
  };

  return (
    <div className="container page">
      <span className="eyebrow">No account needed</span>
      <h1>My Recent Trips</h1>
      <p>Saved in your browser. View, duplicate or delete anytime.</p>
      {trips.length === 0 ? (
        <div className="empty card"><h3>No trips yet</h3><p>Create your first AI itinerary in under a minute.</p><Link className="btn" to="/planner">Plan My Trip</Link></div>
      ) : (
        <div className="grid3">{trips.map((t) => (
          <div className="card" key={t.id}>
            <h3>{t.destination}</h3>
            <div style={{ display: "flex", gap: 12, fontSize: ".83rem", color: "var(--text-2)", marginBottom: 12 }}>
              <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><CalendarDays size={14} /> {t.duration}d</span>
              <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Wallet size={14} /> ₹{Number(t.budget).toLocaleString("en-IN")}</span>
              <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Users size={14} /> {t.travelers}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link className="btn btn-sm" to={`/trip?id=${t.id}`} style={{ flex: 1, justifyContent: "center" }}>View</Link>
              <button className="icon-btn" title="Duplicate" onClick={() => nav(`/planner?destination=${encodeURIComponent(t.destination)}`)}><Copy size={15} /></button>
              <button className="icon-btn" title="Delete" onClick={() => del(t.id)}><Trash2 size={15} /></button>
            </div>
          </div>))}
        </div>
      )}
      <Link className="btn btn-ghost" to="/planner" style={{ marginTop: 16 }}><Plus size={16} /> Plan another trip</Link>
    </div>
  );
}
