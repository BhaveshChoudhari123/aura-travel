"""AI provider switch: OpenAI when key exists, else local demo. Validates + repairs JSON."""
import json
from django.conf import settings
from .prompt_builder import build_prompt
from .demo_generator import generate_demo_itinerary

ALLOWED = {"Food", "Culture", "Nature", "Adventure", "Shopping", "Relaxation", "Nightlife",
           "Beaches", "Historical Places", "Museums", "Photography", "Temples",
           "Must Visit", "Activity", "Transport", "Architecture", "Street Food", "Cafes"}

class AIProvider:
    name = "base"
    def generate(self, payload, weather=None): raise NotImplementedError

class OpenAIProvider(AIProvider):
    name = "openai"
    def generate(self, payload, weather=None):
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY.strip())
        system, user = build_prompt(payload, weather)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            temperature=0.7, max_tokens=4000, response_format={"type": "json_object"},
        )
        return _normalize(_parse(resp.choices[0].message.content), payload)

class DemoAIProvider(AIProvider):
    name = "demo"
    def generate(self, payload, weather=None):
        return generate_demo_itinerary(payload, weather)

def _parse(text: str) -> dict:
    t = (text or "").strip()
    if t.startswith("```"):
        t = t.strip("`")
        if t.lower().startswith("json"):
            t = t[4:]
    return json.loads(t)

def _acts(items):
    out = []
    for a in (items or [])[:2]:
        if not isinstance(a, dict):
            continue
        cat = a.get("category", "Activity")
        out.append({
            "title": str(a.get("title", "Explore"))[:160],
            "description": str(a.get("description", "")),
            "location": str(a.get("location", "")),
            "duration": str(a.get("duration", "1.5 hrs")),
            "estimated_cost": _num(a.get("estimated_cost")),
            "category": cat if cat in ALLOWED else "Activity",
            "best_time": str(a.get("best_time", a.get("recommended_time", ""))),
        })
    return out

def _num(v):
    try: return float(v or 0)
    except (TypeError, ValueError): return 0.0

def _normalize(data: dict, payload: dict) -> dict:
    days = []
    for i, d in enumerate((data or {}).get("days", [])[:14], start=1):
        if not isinstance(d, dict): continue
        days.append({
            "day": d.get("day", i), "title": str(d.get("title", f"Day {i}"))[:160],
            "summary": str(d.get("summary", ""))[:500],
            "estimated_cost": _num(d.get("estimated_cost")),
            "morning": _acts(d.get("morning")), "afternoon": _acts(d.get("afternoon")),
            "evening": _acts(d.get("evening")),
        })
    bb = (data or {}).get("budget_breakdown", {}) or {}
    keys = ("accommodation", "food", "transport", "activities", "shopping", "miscellaneous")
    return {
        "summary": str((data or {}).get("summary", ""))[:2000],
        "estimated_total": _num((data or {}).get("estimated_total", (data or {}).get("estimated_total_cost", 0))),
        "budget_breakdown": {k: _num(bb.get(k)) for k in keys},
        "weather_note": str((data or {}).get("weather_note", ""))[:500],
        "days": days,
    }

def generate_itinerary(payload: dict, weather: dict | None = None) -> tuple[dict, str]:
    if (getattr(settings, "OPENAI_API_KEY", "") or "").strip():
        try:
            return OpenAIProvider().generate(payload, weather), "openai"
        except Exception:
            pass  # fall through to demo
    return DemoAIProvider().generate(payload, weather), "demo"
