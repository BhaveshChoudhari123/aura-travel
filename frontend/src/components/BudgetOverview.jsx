import { useState } from "react";
import { PiggyBank, Wallet } from "lucide-react";
import { optimizeBudget } from "../services/api";
import { fmtErr } from "../api/client";

const COLORS = { accommodation: "#312E81", food: "#FB7185", transport: "#0EA5E9", activities: "#7C3AED", shopping: "#14B8A6", miscellaneous: "#94A3B8", transportation: "#0EA5E9" };

export default function BudgetOverview({ trip }) {
  const bb = trip.budget_breakdown || {};
  const total = trip.estimated_total_cost || trip.budget || 1;
  const rows = Object.entries(bb);
  const remaining = Math.max((trip.budget || 0) - (trip.estimated_total_cost || 0), 0);
  const over = (trip.estimated_total_cost || 0) > (trip.budget || 0);
  const [opt, setOpt] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true); setErr("");
    try { setOpt(await optimizeBudget(trip.id)); }
    catch (e) { setErr(fmtErr(e)); }
    finally { setBusy(false); }
  };

  const donut = () => {
    let acc = 0;
    const segs = rows.map(([k, v]) => {
      const from = (acc / total) * 360; acc += (v || 0);
      const to = (acc / total) * 360;
      return `${COLORS[k] || "#7C3AED"} ${from}deg ${to}deg`;
    });
    return { background: `conic-gradient(${segs.join(",")})` };
  };

  return (
    <div className="card">
      <h3 style={{ display: "flex", gap: 8, alignItems: "center" }}><Wallet size={18} /> Smart Budget</h3>
      <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", margin: "10px 0" }}>
        <div className="donut" style={donut()}><div className="donut-hole"><strong>₹{Number(total).toLocaleString("en-IN")}</strong><small>estimated</small></div></div>
        <div style={{ display: "grid", gap: 6 }}>
          <div><small style={{ color: "var(--text-2)" }}>Total budget</small><div style={{ fontWeight: 800, fontSize: "1.25rem" }}>₹{Number(trip.budget || 0).toLocaleString("en-IN")}</div></div>
          <div><small style={{ color: "var(--text-2)" }}>Remaining</small><div style={{ fontWeight: 800, fontSize: "1.25rem", color: over ? "#c23c2c" : "#0d7a5f" }}>₹{remaining.toLocaleString("en-IN")}</div></div>
          {over && <div className="err">⚠️ Estimated spend exceeds your budget — try Optimize below.</div>}
        </div>
      </div>
      {rows.map(([k, v]) => (
        <div className="b-row" key={k}>
          <span style={{ textTransform: "capitalize" }}><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: COLORS[k], marginRight: 7 }} />{k}</span>
          <strong>₹{Number(v || 0).toLocaleString("en-IN")}</strong>
        </div>
      ))}
      <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={run} disabled={busy}><PiggyBank size={15} /> {busy ? "Optimizing…" : "Optimize My Budget"}</button>
      {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}
      {opt && (
        <div className="opt-box">
          <strong>💰 Save ₹{opt.savings.toLocaleString("en-IN")} → new estimate ₹{opt.optimized.toLocaleString("en-IN")}</strong>
          {opt.tips.map((t) => (
            <div key={t.area} style={{ fontSize: ".86rem", marginTop: 8 }}>
              <strong>{t.area}:</strong> ₹{t.original.toLocaleString("en-IN")} → ₹{t.optimized.toLocaleString("en-IN")} (save ₹{t.savings.toLocaleString("en-IN")})<br />
              <span style={{ color: "var(--text-2)" }}>{t.tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
