"""Trip orchestration: geocode -> weather -> AI -> persist. No auth involved."""
from .models import Trip, ItineraryDay, Activity
from apps.travel.geocoding_service import geocode
from apps.travel.weather_service import get_weather
from apps.ai.ai_service import generate_itinerary

ALLOWED_CATS = {"Food", "Culture", "Nature", "Adventure", "Shopping", "Relaxation", "Nightlife",
                "Beaches", "Historical Places", "Museums", "Photography", "Temples",
                "Must Visit", "Activity", "Transport", "Architecture", "Street Food", "Cafes"}

def plan_trip(payload: dict):
    geo = geocode(payload["destination"])
    weather = get_weather(geo["city"] or payload["destination"], days=payload.get("duration", 3))
    ai_payload = {**payload, "city": geo["city"], "country": geo["country"]}
    ai, mode = generate_itinerary(ai_payload, weather)
    trip = Trip.objects.create(
        destination=geo["city"] or payload["destination"], city=geo["city"], country=geo["country"],
        latitude=geo.get("latitude"), longitude=geo.get("longitude"),
        duration=payload.get("duration", 3), travelers=payload.get("travelers", 2),
        traveler_type=payload.get("traveler_type", "Couple"),
        adults=payload.get("adults", 2), children=payload.get("children", 0),
        budget=payload.get("budget", 25000), budget_tier=payload.get("budget_tier", "Moderate"),
        travel_styles=payload.get("travel_styles", []),
        travel_style=", ".join(payload.get("travel_styles", [])[:2]) or "Balanced",
        interests=payload.get("interests", []), food_preferences=payload.get("food_preferences", ""),
        summary=ai.get("summary", ""), estimated_total_cost=ai.get("estimated_total", 0),
        budget_breakdown=ai.get("budget_breakdown", {}), weather_note=ai.get("weather_note", ""),
        weather_snapshot={"condition": weather.get("condition"), "temperature": weather.get("temperature"),
                          "rain_expected": weather.get("rain_expected"), "source": weather.get("source")},
    )
    for d in ai.get("days", []):
        day = ItineraryDay.objects.create(
            trip=trip, day_number=d.get("day", 1), title=d.get("title", "")[:160],
            summary=d.get("summary", "")[:500], estimated_cost=d.get("estimated_cost", 0),
        )
        for period in ("morning", "afternoon", "evening"):
            for a in d.get(period, [])[:2]:
                Activity.objects.create(
                    day=day, time_period=period,
                    category=a.get("category") if a.get("category") in ALLOWED_CATS else "Activity",
                    title=a.get("title", "Explore")[:160], description=a.get("description", ""),
                    location=a.get("location", ""), recommended_time=a.get("best_time", "") or a.get("recommended_time", ""),
                    estimated_cost=a.get("estimated_cost", 0) or 0, duration=a.get("duration", ""),
                )
    return trip, mode, weather, geo

def optimize_budget(trip: Trip) -> dict:
    """Suggest cheaper swaps: ~30% off food & activities via smart alternatives."""
    bb = trip.budget_breakdown or {}
    food = float(bb.get("food", 0)); acts = float(bb.get("activities", 0)); trans = float(bb.get("transport", 0))
    food_save = round(food * 0.3); acts_save = round(acts * 0.25); trans_save = round(trans * 0.35)
    total_save = food_save + acts_save + trans_save
    return {
        "original": trip.estimated_total_cost,
        "optimized": max(round(trip.estimated_total_cost - total_save), 0),
        "savings": total_save,
        "tips": [
            {"area": "Food", "original": food, "optimized": food - food_save, "savings": food_save,
             "tip": "Pick local thalis, street-food lanes and cafe lunches over fine dining."},
            {"area": "Activities", "original": acts, "optimized": acts - acts_save, "savings": acts_save,
             "tip": "Swap one paid attraction per day for free walks, viewpoints and markets."},
            {"area": "Transport", "original": trans, "optimized": trans - trans_save, "savings": trans_save,
             "tip": "Use metro/buses and shared cabs instead of private rentals."},
        ],
    }
