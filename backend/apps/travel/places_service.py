"""Places provider: curated fallback data + optional Overpass lookup (OSM_PLACES=1). Never crashes."""
import requests
from django.conf import settings
from apps.core import cache as _cache

# Curated suggestions per destination: (title, category, description)
CURATED = {
    "goa": [
        ("Baga Beach", "Beaches", "Golden sands, water sports and beach shacks."),
        ("Basilica of Bom Jesus", "Culture", "UNESCO-listed Portuguese-era church."),
        ("Anjuna Flea Market", "Shopping", "Boho crafts, live music and food stalls."),
        ("Dudhsagar Falls", "Nature", "Four-tiered waterfall, best after monsoon."),
        ("Fontainhas Latin Quarter", "Hidden Gems", "Colourful lanes and heritage homes."),
        ("Tito's Lane", "Nightlife", "Clubs and late-night cafes at Baga."),
        ("Fisherman's Wharf dinner", "Food", "Goan fish curry and riverside dining."),
        ("Chapora Fort sunset", "Photography", "Golden-hour views over Vagator."),
    ],
    "pune": [
        ("Shaniwar Wada", "Culture", "Maratha-era palace with evening light show."),
        ("Sinhagad Fort trek", "Adventure", "Sahyadri hill fort with panoramic views."),
        ("FC Road cafes", "Food", "Cafes, bakeries and bookshops."),
        ("Dagadusheth Temple", "Culture", "Iconic Ganesha temple in old city."),
        ("Pune Okayama Garden", "Relaxation", "Serene Japanese-style garden."),
        ("Koregaon Park lanes", "Nightlife", "Breweries and late-night dining."),
        ("Misal pav trail", "Street Food", "Spicy local breakfast crawl."),
    ],
    "mumbai": [
        ("Gateway of India", "Culture", "Iconic arch by the harbour."),
        ("Marine Drive sunset", "Relaxation", "Queen's Necklace evening walk."),
        ("Bandra street art", "Photography", "Murals, cafes and sea face."),
        ("Crawford Market", "Shopping", "Spices, pets and old-world arcades."),
        ("Juhu chaat stalls", "Street Food", "Pav bhaji and gola by the beach."),
        ("Sanjay Gandhi National Park", "Nature", "Forest trails and Kanheri caves."),
    ],
    "delhi": [
        ("Red Fort", "Historical Places", "Mughal citadel and museums."),
        ("Chandni Chowk food walk", "Street Food", "Parathas, jalebis and chaat."),
        ("Humayun's Tomb", "Architecture", "Garden tomb, precursor to Taj."),
        ("Lodhi Art District", "Photography", "Murals and Lodhi Gardens."),
        ("Dilli Haat", "Shopping", "Crafts and regional foods."),
        ("Hauz Khas nightlife", "Nightlife", "Lakeside pubs and cafes."),
    ],
    "jaipur": [
        ("Amber Fort", "Historical Places", "Hilltop palace with Sheesh Mahal."),
        ("Hawa Mahal", "Architecture", "Pink facade with 953 windows."),
        ("Johari Bazaar", "Shopping", "Jewellery, textiles and mojris."),
        ("Chokhi Dhani dinner", "Food", "Rajasthani thali with folk dance."),
        ("Nahargarh sunset", "Photography", "City views from the fort wall."),
    ],
    "manali": [
        ("Solang Valley", "Adventure", "Paragliding, ATVs and snow points."),
        ("Old Manali cafes", "Cafes", "Riverside bakeries and live music."),
        ("Hadimba Temple", "Temples", "Cedar-forest shrine."),
        ("Jogini Falls trek", "Mountains", "Short waterfall trail from Vashisht."),
        ("Mall Road stroll", "Shopping", "Woolens and local eats."),
    ],
    "dubai": [
        ("Burj Khalifa", "Architecture", "Tallest tower, sunset slots best."),
        ("Old souks", "Shopping", "Gold and spice souks across the creek."),
        ("Desert safari", "Adventure", "Dune bashing with BBQ dinner."),
        ("Dubai Marina walk", "Relaxation", "Waterfront promenade and yachts."),
        ("Al Fahidi quarter", "Culture", "Wind towers and museums."),
    ],
    "tokyo": [
        ("Senso-ji Temple", "Culture", "Oldest temple in Asakusa."),
        ("Shibuya Crossing", "Photography", "World's busiest scramble."),
        ("Tsukiji outer market", "Street Food", "Sushi breakfast and snacks."),
        ("Meiji Shrine forest", "Nature", "Calm grove in the city."),
        ("teamLab Planets", "Museums", "Immersive digital art."),
        ("Shinjuku izakayas", "Nightlife", "Lantern-lit pub alleys."),
    ],
    "paris": [
        ("Eiffel Tower", "Architecture", "Sunset ascent, book ahead."),
        ("Louvre Museum", "Museums", "Mona Lisa and Denon wing."),
        ("Montmartre", "Culture", "Artists' hill and Sacre-Coeur."),
        ("Le Marais food streets", "Food", "Falafel, pastries and boutiques."),
        ("Seine evening cruise", "Relaxation", "Bridges and monuments by night."),
    ],
    "bali": [
        ("Uluwatu Temple sunset", "Temples", "Cliff temple with kecak dance."),
        ("Tegalalang rice terraces", "Nature", "Layered green paddies."),
        ("Seminyak beach clubs", "Beaches", "Sunsets and surf."),
        ("Ubud market", "Shopping", "Crafts, sarongs and coffee."),
        ("Nasi campur warungs", "Food", "Local mixed-rice plates."),
    ],
    "london": [
        ("Tower Bridge", "Architecture", "Glass walkway over the Thames."),
        ("Borough Market", "Food", "Historic food hall."),
        ("Camden Market", "Shopping", "Alt fashion and street eats."),
        ("Hyde Park", "Nature", "Boating lake and meadows."),
        ("West End show", "Nightlife", "Evening theatre."),
    ],
}
GENERIC = [
    ("Old Town heritage walk", "Culture", "Guided lanes and stories."),
    ("Central market", "Shopping", "Crafts and souvenirs."),
    ("Riverside park", "Nature", "Green escape for slow mornings."),
    ("Local food trail", "Food", "Curated regional tasting."),
    ("Sunset viewpoint", "Photography", "Golden-hour photos."),
    ("City museum", "Museums", "Stories of the region."),
    ("Night bazaar", "Nightlife", "Stalls and live counters."),
]

class PlacesProvider:
    name = "base"
    def suggestions(self, destination, lat=None, lng=None):
        raise NotImplementedError

class OpenStreetMapPlacesProvider(PlacesProvider):
    name = "openstreetmap"
    def suggestions(self, destination, lat=None, lng=None):
        key = (destination or "").strip().lower()
        for name in CURATED:
            if name in key:
                return self._shape(destination, CURATED[name])
        live = self._overpass(key, lat, lng)
        if live:
            return self._shape(destination, live)
        # blend generic + popular cities
        pool = GENERIC + CURATED["goa"][:3] + CURATED["tokyo"][:2]
        return self._shape(destination, pool)

    def _shape(self, destination, items):
        groups: dict = {}
        for title, cat, desc in items:
            groups.setdefault(cat, []).append({
                "title": title if destination.lower() in title.lower() else f"{title}",
                "category": cat, "description": desc,
                "location": f"{title}, {destination}",
            })
        return [{"category": c, "places": p} for c, p in groups.items()]

    def _overpass(self, key, lat, lng):
        if not getattr(settings, "OSM_PLACES", False) or not lat or not lng:
            return []
        ck = f"osm:{round(lat, 2)}:{round(lng, 2)}"
        hit = _cache.get(ck)
        if hit is not None:
            return hit
        try:
            q = f"[out:json][timeout:6];node(around:3000,{lat},{lng})[tourism~'museum|attraction|viewpoint'];out 12;"
            r = requests.get("https://overpass-api.de/api/interpreter", params={"data": q}, timeout=8)
            items = []
            if r.status_code == 200:
                for el in (r.json().get("elements") or [])[:8]:
                    name = (el.get("tags") or {}).get("name")
                    if name:
                        items.append((name, "Culture", "Point of interest from OpenStreetMap."))
            _cache.set(ck, items, ttl=86400)
            return items
        except Exception:
            return []

_provider = OpenStreetMapPlacesProvider()

def get_suggestions(destination, lat=None, lng=None):
    return _provider.suggestions(destination or "Goa", lat, lng)

def all_destinations():
    return [
        {"name": "Goa", "country": "India", "description": "Beaches, shacks and Portuguese lanes.", "best_for": "Beaches, Nightlife, Food", "budget": "Rs.15,000 – Rs.30,000", "duration": "3–5 days", "rating": 4.8},
        {"name": "Pune", "country": "India", "description": "Forts, cafe streets and monsoon hills.", "best_for": "Culture, Food, Weekend", "budget": "Rs.8,000 – Rs.20,000", "duration": "2–3 days", "rating": 4.6},
        {"name": "Mumbai", "country": "India", "description": "Sea faces, street food and cinema.", "best_for": "Food, Culture, City life", "budget": "Rs.12,000 – Rs.30,000", "duration": "2–4 days", "rating": 4.5},
        {"name": "Delhi", "country": "India", "description": "Monuments, markets and legendary chaat.", "best_for": "History, Food, Shopping", "budget": "Rs.12,000 – Rs.28,000", "duration": "3–4 days", "rating": 4.4},
        {"name": "Jaipur", "country": "India", "description": "Pink palaces, bazaars and thalis.", "best_for": "Architecture, Shopping, Culture", "budget": "Rs.12,000 – Rs.25,000", "duration": "2–3 days", "rating": 4.6},
        {"name": "Manali", "country": "India", "description": "Snow valleys, treks and cafes.", "best_for": "Mountains, Adventure, Cafes", "budget": "Rs.15,000 – Rs.35,000", "duration": "4–6 days", "rating": 4.7},
        {"name": "Bali", "country": "Indonesia", "description": "Temples, rice terraces and surf.", "best_for": "Beaches, Nature, Relaxation", "budget": "Rs.40,000 – Rs.70,000", "duration": "5–7 days", "rating": 4.8},
        {"name": "Dubai", "country": "UAE", "description": "Skyline, souks and desert nights.", "best_for": "Luxury, Shopping, Adventure", "budget": "Rs.60,000+", "duration": "4–5 days", "rating": 4.7},
        {"name": "Tokyo", "country": "Japan", "description": "Neon, temples and ramen alleys.", "best_for": "Culture, Food, City life", "budget": "Rs.80,000+", "duration": "5–7 days", "rating": 4.9},
        {"name": "Paris", "country": "France", "description": "Art, cafes and the Seine.", "best_for": "Art, Food, Romantic", "budget": "Rs.90,000+", "duration": "4–6 days", "rating": 4.8},
    ]
