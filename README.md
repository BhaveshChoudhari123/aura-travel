# Aura Travel — Your AI-powered travel companion.

No login. No signup. No paid API required. Open the app and plan a trip directly.

## Flow

Landing → Enter Destination (live geocoding preview + suggestions) → Duration → Travelers → Budget → Travel styles → Interests → Food → Create My AI Trip → timeline + weather + map + budget → share / download / recent trips.

## Free APIs (all optional, all with fallbacks)

| Feature | Provider | Key needed |
|---|---|---|
| Weather + forecast | Open-Meteo | No |
| Geocoding | Open-Meteo Geocoding | No |
| Maps | OpenStreetMap + Leaflet | No |
| Places | Curated data (+ optional Overpass via `OSM_PLACES=1`) | No |
| Itinerary AI | OpenAI `gpt-4o-mini` if `OPENAI_API_KEY` set, else local demo generator | Optional |

Fallback chain: Open-Meteo → demo weather · Open-Meteo geocoding → curated coords · OSM places → curated places · OpenAI → demo itinerary. The app never crashes on API failure.

## Backend provider architecture

```
apps/travel/geocoding_service.py   OpenMeteoGeocodingProvider (+ fallback)
apps/travel/weather_service.py     OpenMeteoWeatherProvider (+ demo)
apps/travel/places_service.py      OpenStreetMapPlacesProvider (+ curated)
apps/ai/ai_service.py              OpenAIProvider / DemoAIProvider
apps/ai/prompt_builder.py          structured-JSON prompt + weather-aware rules
apps/ai/demo_generator.py          realistic local itineraries (weather-aware)
apps/trips/services.py             orchestration: geocode → weather → AI → persist
apps/core/cache.py                 TTL cache for free-API responses
```

## Run

Backend:
```
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Frontend:
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 (API at http://localhost:8000).

## Env (`backend/.env.example` → `backend/.env`)

`OPENAI_API_KEY=` (empty = demo mode) · `OSM_PLACES=0` · `DATABASE_URL=sqlite` (use a `postgres://` URL for PostgreSQL) · `FRONTEND_URL=http://localhost:5173`

## APIs (all public, no auth)

```
POST /api/geocode/  {destination} → city/country/lat/lng/timezone/region
GET  /api/suggestions/?destination=
POST /api/trips/plan/  → trip + days + weather + geo + mode
POST /api/trips/generate/  (legacy alias)
GET  /api/trips/latest/  ·  GET/DELETE /api/trips/<id>/
POST /api/trips/<id>/share/  → /shared/<id> URL
GET  /api/shared/<id-or-uuid>/
POST /api/trips/<id>/optimize-budget/
POST /api/recommend-destinations/  {budget, duration, travel_styles, interests}
GET  /api/destinations/search/?q=
GET  /api/weather/?destination=&days=
```

## Tests

`cd backend && python manage.py test`
