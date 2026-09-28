"""Weather provider architecture. Default: Open-Meteo (free, no key). Fallback: demo weather."""
import hashlib
import requests
from apps.core import cache as _cache
from .geocoding_service import geocode

def _condition(code: int) -> str:
    if code == 0: return "Clear"
    if code in (1,): return "Mostly Clear"
    if code in (2, 3): return "Partly Cloudy"
    if code in (45, 48): return "Foggy"
    if code in (51, 53, 55, 56, 57): return "Drizzle"
    if code in (61, 63, 65, 66, 67, 80, 81, 82): return "Rain"
    if code in (71, 73, 75, 77, 85, 86): return "Snow"
    if code in (95, 96, 99): return "Thunderstorm"
    return "Pleasant"

_RAINY = {"Rain", "Drizzle", "Thunderstorm", "Showers"}

class WeatherProvider:
    name = "base"
    def get(self, destination, days=7) -> dict:
        raise NotImplementedError

class OpenMeteoWeatherProvider(WeatherProvider):
    name = "open-meteo"
    def get(self, destination, days=7) -> dict:
        days = max(1, min(int(days or 3), 14))
        key = f"wx:{destination.strip().lower()}:{days}"
        hit = _cache.get(key)
        if hit:
            return hit
        geo = geocode(destination)
        try:
            r = requests.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": geo["latitude"], "longitude": geo["longitude"],
                    "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                    "timezone": "auto", "forecast_days": days,
                },
                timeout=10,
            )
            if r.status_code == 200:
                j = r.json()
                cur = j.get("current", {})
                cond = _condition(int(cur.get("weather_code", 2)))
                daily = j.get("daily", {})
                forecast = []
                times = daily.get("time", [])
                for i, d in enumerate(times):
                    c = _condition(int((daily.get("weather_code") or [2])[i]))
                    forecast.append({
                        "day": f"Day {i + 1}", "date": d,
                        "max": round((daily.get("temperature_2m_max") or [0])[i]),
                        "min": round((daily.get("temperature_2m_min") or [0])[i]),
                        "condition": c,
                        "rain_probability": int((daily.get("precipitation_probability_max") or [0])[i] or 0),
                    })
                out = {
                    "destination": geo["city"], "temperature": round(cur.get("temperature_2m", 0)),
                    "condition": cond, "humidity": cur.get("relative_humidity_2m", 0),
                    "wind_kph": round((cur.get("wind_speed_10m", 0) or 0) * 3.6, 1),
                    "rain_probability": max([f["rain_probability"] for f in forecast] or [0]),
                    "rain_expected": any(f["condition"] in _RAINY or f["rain_probability"] >= 50 for f in forecast),
                    "forecast": forecast, "source": "open-meteo",
                }
                _cache.set(key, out, ttl=1800)
                return out
        except Exception:
            pass
        return demo_weather(destination, days)

def demo_weather(destination: str, days: int = 3) -> dict:
    h = int(hashlib.md5(destination.lower().encode()).hexdigest()[:4], 16)
    conds = ["Sunny", "Partly Cloudy", "Clear", "Light Rain", "Pleasant"]
    forecast = []
    for i in range(max(1, min(days, 14))):
        c = conds[(h + i * 2) % len(conds)]
        forecast.append({"day": f"Day {i + 1}", "date": "", "max": 24 + ((h + i) % 9),
                         "min": 17 + ((h + i) % 6), "condition": c,
                         "rain_probability": 60 if "Rain" in c else (h + i * 7) % 25})
    return {
        "destination": destination.strip().title(), "temperature": 24 + (h % 8),
        "condition": forecast[0]["condition"], "humidity": 45 + (h % 35),
        "wind_kph": 8 + (h % 12), "rain_probability": forecast[0]["rain_probability"],
        "rain_expected": any(f["rain_probability"] >= 50 for f in forecast),
        "forecast": forecast, "source": "demo",
    }

_provider = OpenMeteoWeatherProvider()

def get_weather(destination: str, days: int = 7) -> dict:
    return _provider.get(destination or "Goa", days)
