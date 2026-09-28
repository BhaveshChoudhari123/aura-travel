import { useState } from "react";
import { Coffee, Sun, Sunset } from "lucide-react";
import ActivityCard from "./ActivityCard";

export default function ItineraryTimeline({ day, onLocate }) {
  const [removed, setRemoved] = useState([]);
  const sections = [
    { key: "morning", label: "Morning", Icon: Coffee },
    { key: "afternoon", label: "Afternoon", Icon: Sun },
    { key: "evening", label: "Evening", Icon: Sunset },
  ];
  const isOut = (a) => removed.includes(a.id || a.title);
  return (
    <article className="tl-day">
      <div className="tl-rail"><span className="tl-dot" /><span className="tl-line" /></div>
      <div className="tl-body">
        <div className="day-head">
          <div className="day-num">{day.day}</div>
          <div>
            <h3 style={{ margin: 0 }}>{day.title}</h3>
            {day.summary && <p style={{ margin: "2px 0", fontSize: ".86rem" }}>{day.summary}</p>}
            <small style={{ color: "var(--text-2)" }}>≈ ₹{Number(day.estimated_cost || 0).toLocaleString("en-IN")} for the day</small>
          </div>
        </div>
        {sections.map(({ key, label, Icon }) => (
          <div className="period" key={key}>
            <h4><Icon size={15} /> {label}</h4>
            <div className="act-grid">
              {(day[key] || []).map((a) => (
                <ActivityCard key={a.id || a.title} a={a} inPlan={!isOut(a)}
                  onLocate={onLocate ? () => onLocate(a) : null}
                  onTogglePlan={() => setRemoved((r) => isOut(a) ? r.filter((x) => x !== (a.id || a.title)) : [...r, a.id || a.title])} />
              ))}
              {(!day[key] || day[key].length === 0) && <p style={{ fontSize: ".85rem" }}>Free time — rest or explore nearby.</p>}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
