"""Prompt builder for itinerary generation. Keeps AI logic out of views."""
from typing import Any

CATEGORIES = "Food, Culture, Nature, Adventure, Shopping, Relaxation, Nightlife, Beaches, Historical Places, Museums, Photography, Temples"

def build_prompt(p: dict[str, Any], weather: dict | None = None) -> tuple[str, str]:
    system = (
        "You are Aura Travel, an expert travel planner. Respond with VALID JSON only — no markdown, no commentary. "
        "Schema: {\"summary\": str, \"estimated_total\": number, "
        "\"budget_breakdown\": {\"accommodation\": n, \"food\": n, \"transport\": n, \"activities\": n, \"shopping\": n, \"miscellaneous\": n}, "
        "\"weather_note\": str, "
        "\"days\": [{\"day\": n, \"title\": str, \"summary\": str, \"estimated_cost\": n, "
        "\"morning\": [{\"title\": str, \"description\": str, \"location\": str, \"duration\": str, \"estimated_cost\": n, \"category\": str, \"best_time\": str}], "
        "\"afternoon\": [...], \"evening\": [...]}]}. "
        f"Allowed categories: {CATEGORIES}. "
        "Rules: max 2 activities per period; realistic pacing with travel gaps; one food experience daily; "
        "never repeat an attraction; no empty days; total must stay near the user's budget; "
        "match traveler type, styles, interests and food preference."
    )
    wx = ""
    if weather:
        wx = (f"\nWeather: {weather.get('condition')}, {weather.get('temperature')}C. "
              f"Rain expected: {weather.get('rain_expected')}. "
              "If rain is expected, prefer indoor activities (museums, cafes, markets, cooking) "
              "and explain the adjustment in weather_note.")
    user = (
        f"Destination: {p.get('destination')} ({p.get('city', '')}, {p.get('country', '')})\n"
        f"Duration: {p.get('duration')} days\nTravelers: {p.get('travelers')} ({p.get('traveler_type', 'Couple')})\n"
        f"Budget total: {p.get('budget')} (tier {p.get('budget_tier', 'Moderate')})\n"
        f"Travel styles: {', '.join(p.get('travel_styles', []))}\n"
        f"Interests: {', '.join(p.get('interests', []))}\n"
        f"Food preference: {p.get('food_preferences', 'No Preference')}\n{wx}"
    )
    return system, user
