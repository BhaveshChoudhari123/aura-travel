"""Local demo itinerary generator. Weather-aware, budget-aware, realistic pacing."""
import random
from typing import Any
from apps.travel.places_service import CURATED, GENERIC

INDOOR = [
    ("City Museum trail", "Museums", "Curated galleries and local stories, perfect for a rainy morning."),
    ("Heritage cafe crawl", "Food", "Historic cafes, filter coffee and bakes."),
    ("Indoor craft market", "Shopping", "Covered bazaar for textiles and souvenirs."),
    ("Cooking experience", "Food", "Learn 3 regional dishes with a home chef."),
    ("Art gallery afternoon", "Museums", "Contemporary wing plus photo exhibit."),
    ("Spa & slow evening", "Relaxation", "Ayurvedic massage and herbal teas."),
]

def _pool(dest: str):
    key = (dest or "").lower()
    for name, items in CURATED.items():
        if name in key:
            return list(items) + list(GENERIC)
    return list(GENERIC) + CURATED["goa"][:4] + CURATED["tokyo"][:2]

def generate_demo_itinerary(p: dict[str, Any], weather: dict | None = None) -> dict:
    dest = p.get("destination", "Goa")
    duration = max(1, min(int(p.get("duration", 3)), 14))
    travelers = max(1, int(p.get("travelers", 2)))
    ttype = p.get("traveler_type", "Couple")
    budget = float(p.get("budget", 25000))
    styles = p.get("travel_styles", []) or ["Relaxed"]
    interests = p.get("interests", []) or ["Food", "Culture"]
    food = p.get("food_preferences", "Local Cuisine")
    rainy = bool((weather or {}).get("rain_expected"))
    rng = random.Random(abs(hash(dest.lower())) % 99991)
    pool = _pool(dest)
    rng.shuffle(pool)
    if rainy:
        pool = INDOOR * 2 + pool  # bias toward indoor options
    per_day = budget / max(duration, 1)
    days, total, idx = [], 0, 0
    seen = set()
    for d in range(1, duration + 1):
        day_cost = round(per_day * rng.uniform(0.85, 1.08))
        total += day_cost
        day = {"day": d, "title": "", "summary": "", "estimated_cost": day_cost,
               "morning": [], "afternoon": [], "evening": []}
        for period, times in (("morning", ["9:00 AM", "10:30 AM"]),
                              ("afternoon", ["1:00 PM", "3:30 PM"]),
                              ("evening", ["5:30 PM", "7:30 PM"])):
            acts = []
            for j in range(2):
                for _ in range(len(pool)):
                    name, cat, desc = pool[idx % len(pool)]
                    idx += 1
                    if name not in seen:
                        seen.add(name)
                        break
                if interests and rng.random() < 0.35 and cat not in ("Food",):
                    cat = rng.choice(interests)
                cost = round(per_day * rng.uniform(0.03, 0.11))
                acts.append({"title": name, "description": desc, "location": f"{name}, {dest}",
                             "duration": rng.choice(["1 hr", "1.5 hrs", "2 hrs"]),
                             "estimated_cost": cost, "category": cat, "best_time": times[j % 2]})
            if period == "afternoon":
                acts[0]["category"] = "Food"
                acts[0]["title"] = f"{food} tasting near {pool[idx % len(pool)][0]}"
                acts[0]["description"] = f"{food}-style lunch picked for a {' & '.join(styles[:2]).lower()} pace."
            day[period] = acts
        day["title"] = f"Day {d} — {day['morning'][0]['title']}"
        day["summary"] = f"Easy-paced day for {ttype.lower()} travelers mixing {', '.join(interests[:2])}."
        days.append(day)
    food_c = round(total * 0.28); stay = round(total * 0.32); trans = round(total * 0.14)
    acts_c = round(total * 0.14); shop = round(total * 0.07)
    misc = max(round(total - food_c - stay - trans - acts_c - shop), 0)
    note = ""
    if rainy:
        note = "Your itinerary was adjusted because rain is expected — more museums, cafes and indoor markets."
    return {
        "summary": (f"A {duration}-day {' & '.join(styles[:2]).lower()} journey through {dest} for "
                    f"{travelers} ({ttype.lower()}), blending {', '.join(interests[:3])} with {food.lower()} flavors."),
        "estimated_total": round(total),
        "budget_breakdown": {"accommodation": stay, "food": food_c, "transport": trans,
                             "activities": acts_c, "shopping": shop, "miscellaneous": misc},
        "weather_note": note,
        "days": days,
    }
