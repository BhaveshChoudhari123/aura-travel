from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .geocoding_service import geocode
from .weather_service import get_weather
from .places_service import get_suggestions, all_destinations

@api_view(["POST", "GET"])
@permission_classes([AllowAny])
def geocode_view(request):
    dest = (request.data or {}).get("destination") if request.method == "POST" else request.GET.get("destination", "")
    if not (dest or "").strip():
        return Response({"message": "Destination is required."}, status=400)
    try:
        return Response(geocode(dest))
    except Exception:
        return Response({"message": "Something went wrong. Please try again."}, status=502)

@api_view(["GET"])
@permission_classes([AllowAny])
def suggestions(request):
    dest = request.GET.get("destination", "")
    if not dest.strip():
        return Response({"message": "Destination is required."}, status=400)
    try:
        geo = geocode(dest)
        groups = get_suggestions(geo["city"] or dest, geo.get("latitude"), geo.get("longitude"))
        return Response({"destination": geo["city"], "geo": geo, "suggestions": groups})
    except Exception:
        return Response({"message": "Something went wrong. Please try again."}, status=502)

@api_view(["GET"])
@permission_classes([AllowAny])
def weather(request):
    dest = request.GET.get("destination", "")
    if not dest.strip():
        return Response({"message": "Destination is required."}, status=400)
    try:
        days = int(request.GET.get("days", 7))
    except (TypeError, ValueError):
        days = 7
    try:
        return Response(get_weather(dest, days))
    except Exception:
        return Response({"message": "Something went wrong. Please try again."}, status=502)

@api_view(["GET"])
@permission_classes([AllowAny])
def destination_search(request):
    q = (request.GET.get("q", "") or "").lower()
    items = all_destinations()
    if q:
        items = [d for d in items if q in d["name"].lower() or q in d["country"].lower() or q in d["best_for"].lower()]
    return Response(items)
