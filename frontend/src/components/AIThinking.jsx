import { useEffect, useState } from "react";

const STEPS = ["Understanding your destination…", "Checking the best experiences…", "Optimizing your route…", "Balancing your budget…", "Planning your meals…", "Creating your itinerary…", "Almost ready…"];

export default function AIThinking() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => Math.min(v + 1, STEPS.length - 1)), 1500);
    return () => clearInterval(t);
  }, []);
  const pct = Math.round(((i + 1) / STEPS.length) * 100);
  return (
    <div className="card ai-think">
      <div className="ai-orb"><span /><span /><span /></div>
      <h2>Crafting your journey…</h2>
      <div className="budget-bar" style={{ maxWidth: 420, margin: "12px auto" }}><i style={{ width: `${pct}%`, transition: "width .6s" }} /></div>
      <small style={{ color: "var(--text-2)" }}>{pct}%</small>
      <div className="gen-steps" style={{ maxWidth: 440, margin: "16px auto 0", textAlign: "left" }}>
        {STEPS.map((s, k) => (
          <div className="gen-step" key={s} style={{ opacity: k <= i ? 1 : 0.35 }}>
            {k < i ? "✅" : k === i ? <span className="spin" /> : "·"} {s}
          </div>
        ))}
      </div>
    </div>
  );
}
