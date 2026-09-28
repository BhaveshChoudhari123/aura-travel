from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Trip
from .serializers import TripSerializer, PlanSerializer
from .services import plan_trip, optimize_budget
from apps.travel.places_service import all_destinations

def _respond(trip, mode, weather, geo):
    data = TripSerializer(trip).data
    data["mode"] = mode
    data["weather"] = weather
    data["geo"] = geo
    return Response(data, status=201)

def _build(validated: dict):
    try:
        trip, mode, weather, geo = plan_trip(dict(validated))
    except Exception:
        return Response({"message": "Something went wrong. Please try again."}, status=502)
    return _respond(trip, mode, weather, geo)

@api_view(["POST"])
@permission_classes([AllowAny])
def plan(request):
    s = PlanSerializer(data=request.data)
    if not s.is_valid():
        return Response({"errors": s.errors}, status=400)
    if not s.validated_data.get("destination", "").strip():
        return Response({"errors": {"destination": ["Destination is required."]}}, status=400)
    return _build(s.validated_data)

@api_view(["POST"])
@permission_classes([AllowAny])
def generate(request):
    """Back-compat alias accepting the older payload shape."""
    body = dict(request.data or {})
    if "travel_styles" not in body and body.get("travel_style"):
        body["travel_styles"] = [body["travel_style"]]
    if "budget" not in body and body.get("budget_tier") is None:
        pass
    s = PlanSerializer(data=body)
    if not s.is_valid():
        return Response({"errors": s.errors}, status=400)
    return _build(s.validated_data)

@api_view(["GET", "DELETE"])
@permission_classes([AllowAny])
def trip_detail(request, pk):
    trip = get_object_or_404(Trip.objects.prefetch_related("days__activities"), pk=pk)
    if request.method == "DELETE":
        trip.delete()
        return Response({"message": "Trip deleted."})
    return Response(TripSerializer(trip).data)

@api_view(["GET"])
@permission_classes([AllowAny])
def latest_trip(request):
    trip = Trip.objects.prefetch_related("days__activities").first()
    if not trip:
        return Response({"message": "No trips yet."}, status=404)
    return Response(TripSerializer(trip).data)

@api_view(["POST"])
@permission_classes([AllowAny])
def share_trip(request, pk):
    trip = get_object_or_404(Trip, pk=pk)
    url = f"{settings.FRONTEND_URL.rstrip('/')}/shared/{trip.id}"
    return Response({"share_url": url, "share_id": trip.id, "share_uuid": str(trip.share_uuid)})

@api_view(["GET"])
@permission_classes([AllowAny])
def shared_trip(request, ref):
    if str(ref).isdigit():
        trip = get_object_or_404(Trip.objects.prefetch_related("days__activities"), pk=int(ref))
    else:
        trip = get_object_or_404(Trip.objects.prefetch_related("days__activities"), share_uuid=ref)
    return Response(TripSerializer(trip).data)

def _mid_duration(text):
    import re
    nums = [int(n) for n in re.findall(r"\d+", text or "")]
    return sum(nums) / len(nums) if nums else 4

@api_view(["POST"])
@permission_classes([AllowAny])
def optimize(request, pk):
    trip = get_object_or_404(Trip, pk=pk)
    return Response(optimize_budget(trip))

@api_view(["POST"])
@permission_classes([AllowAny])
def recommend(request):
    body = request.data or {}
    try:
        budget = float(body.get("budget", 20000))
    except (TypeError, ValueError):
        budget = 20000
    try:
        duration = int(body.get("duration", 4))
    except (TypeError, ValueError):
        duration = 4
    styles = [str(s).lower() for s in body.get("travel_styles", [])]
    interests = [str(s).lower() for s in body.get("interests", [])]
    scored = []
    for d in all_destinations():
        score, why = 0, []
        text = f"{d['name']} {d['description']} {d['best_for']}".lower()
        for s in styles:
            if s in text:
                score += 2; why.append(f"Matches your '{s}' style")
        for i in interests:
            if i in text:
                score += 2; why.append(f"Great for {i}")
        if abs(duration - _mid_duration(d["duration"])) <= 2:
            score += 1; why.append(f"Ideal for ~{d['duration']}")
        scored.append((score, d, why))
    scored.sort(key=lambda x: -x[0])
    return Response([
        {**d, "why": why[:3] or ["A well-loved all-rounder for this trip length"],
         "estimated_budget": d["budget"], "ideal_duration": d["duration"]}
        for _, d, why in scored[:5]
    ])
