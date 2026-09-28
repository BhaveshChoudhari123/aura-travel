import { Clock, MapPin, Plus, X } from "lucide-react";

const catClass = (c = "") => {
  if (/food/i.test(c)) return "cat-Food";
  if (/culture|histor|temple|museum/i.test(c)) return "cat-Culture";
  if (/nature|beach|mountain|wildlife/i.test(c)) return "cat-Nature";
  if (/shop/i.test(c)) return "cat-Shopping";
  if (/adventure|activity|photo/i.test(c)) return "cat-Activity";
  if (/night/i.test(c)) return "cat-Night";
  return "cat-Transport";
};

export default function ActivityCard({ a, inPlan = true, onTogglePlan, onLocate }) {
  return (
    <div className="act">
      <div className="act-top">
        <span className={`cat ${catClass(a.category)}`}>{a.category}</span>
        {a.estimated_cost > 0 && <span style={{ fontWeight: 700, fontSize: ".82rem" }}>₹{Number(a.estimated_cost).toLocaleString("en-IN")}</span>}
      </div>
      <h5>{a.title}</h5>
      <p>{a.description}</p>
      <div className="act-meta">
        {(a.best_time || a.recommended_time) && <span>🕒 {a.best_time || a.recommended_time}</span>}
        {a.duration && <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><Clock size={13} /> {a.duration}</span>}
        {a.location && <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><MapPin size={13} /> {a.location}</span>}
      </div>
      <div className="act-actions">
        {onLocate && <button className="btn btn-ghost btn-sm" onClick={onLocate}><MapPin size={14} /> View on Map</button>}
        {onTogglePlan && (
          inPlan
            ? <button className="btn btn-ghost btn-sm" onClick={onTogglePlan}><X size={14} /> Remove</button>
            : <button className="btn btn-sm" onClick={onTogglePlan}><Plus size={14} /> Add to Plan</button>
        )}
      </div>
    </div>
  );
}
