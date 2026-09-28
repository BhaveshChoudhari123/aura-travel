"""Geocoding provider architecture. Default: Open-Meteo (free, no key). Fallback: curated coords."""
import requests
from apps.core import cache as _cache

FALLBACK = {
    "goa": {"city": "Goa", "country": "India", "region": "West Coast", "latitude": 15.2993, "longitude": 74.1240, "timezone": "Asia/Kolkata"},
    "pune": {"city": "Pune", "country": "India", "region": "Maharashtra", "latitude": 18.5204, "longitude": 73.8567, "timezone": "Asia/Kolkata"},
    "mumbai": {"city": "Mumbai", "country": "India", "region": "Maharashtra", "latitude": 19.0760, "longitude": 72.8777, "timezone": "Asia/Kolkata"},
    "delhi": {"city": "Delhi", "country": "India", "region": "North India", "latitude": 28.6139, "longitude": 77.2090, "timezone": "Asia/Kolkata"},
    "jaipur": {"city": "Jaipur", "country": "India", "region": "Rajasthan", "latitude": 26.9124, "longitude": 75.7873, "timezone": "Asia/Kolkata"},
    "manali": {"city": "Manali", "country": "India", "region": "Himachal Pradesh", "latitude": 32.2396, "longitude": 77.1887, "timezone": "Asia/Kolkata"},
    "bali": {"city": "Bali", "country": "Indonesia", "region": "Lesser Sunda", "latitude": -8.3405, "longitude": 115.0920, "timezone": "Asia/Makassar"},
    "dubai": {"city": "Dubai", "country": "UAE", "region": "Emirate of Dubai", "latitude": 25.2048, "longitude": 55.2708, "timezone": "Asia/Dubai"},
    "tokyo": {"city": "Tokyo", "country": "Japan", "region": "Kanto", "latitude": 35.6762, "longitude": 139.6503, "timezone": "Asia/Tokyo"},
    "paris": {"city": "Paris", "country": "France", "region": "Ile-de-France", "latitude": 48.8566, "longitude": 2.3522, "timezone": "Europe/Paris"},
    "london": {"city": "London", "country": "UK", "region": "England", "latitude": 51.5074, "longitude": -0.1278, "timezone": "Europe/London"},
    "bangalore": {"city": "Bangalore", "country": "India", "region": "Karnataka", "latitude": 12.9716, "longitude": 77.5946, "timezone": "Asia/Kolkata"},
}

class GeocodingProvider:
    name = "base"
    def geocode(self, destination: str) -> dict:
        raise NotImplementedError

class OpenMeteoGeocodingProvider(GeocodingProvider):
    name = "open-meteo"
    def geocode(self, destination: str) -> dict:
        q = destination.strip().lower()
        # Exact matches for well-known destinations always win over fuzzy API results
        # (e.g. Open-Meteo returns "Genoa, Italy" for "Goa").
        if q in FALLBACK:
            return {**FALLBACK[q], "source": "curated"}
        key = f"geo:{q}"
        hit = _cache.get(key)
        if hit:
            return hit
        try:
            r = requests.get(
                "https://geocoding-api.open-meteo.com/v1/search",
                params={"name": destination, "count": 1, "language": "en", "format": "json"},
                timeout=8,
            )
            if r.status_code == 200:
                res = (r.json().get("results") or [])
                if res:
                    top = res[0]
                    out = {
                        "city": top.get("name", destination), "country": top.get("country", ""),
                        "region": top.get("admin1", ""), "latitude": top.get("latitude"),
                        "longitude": top.get("longitude"), "timezone": top.get("timezone", "auto"),
                        "source": "open-meteo",
                    }
                    _cache.set(key, out, ttl=86400)
                    return out
        except Exception:
            pass
        return self._fallback(destination)

    def _fallback(self, destination: str) -> dict:
        key = destination.strip().lower()
        for name, info in FALLBACK.items():
            if name in key or key in name:
                return {**info, "source": "fallback"}
        return {"city": destination.strip().title(), "country": "", "region": "",
                "latitude": 18.5204, "longitude": 73.8567, "timezone": "auto", "source": "fallback"}

_provider = OpenMeteoGeocodingProvider()

def geocode(destination: str) -> dict:
    return _provider.geocode(destination or "")
