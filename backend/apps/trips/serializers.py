from rest_framework import serializers
from .models import Trip, ItineraryDay, Activity

DURATIONS = [1, 2, 3, 4, 5, 7, 10, 14]
TRAVELER_TYPES = ["Solo", "Couple", "Friends", "Family", "Group"]
BUDGET_TIERS = {"Budget": 10000, "Moderate": 22500, "Comfort": 45000, "Premium": 80000}

class ActivitySerializer(serializers.ModelSerializer):
    best_time = serializers.CharField(source="recommended_time", read_only=True)

    class Meta:
        model = Activity
        fields = ("id", "time_period", "category", "title", "description", "location",
                  "recommended_time", "best_time", "estimated_cost", "duration", "latitude", "longitude")

class DaySerializer(serializers.ModelSerializer):
    morning = serializers.SerializerMethodField()
    afternoon = serializers.SerializerMethodField()
    evening = serializers.SerializerMethodField()
    day = serializers.IntegerField(source="day_number")

    class Meta:
        model = ItineraryDay
        fields = ("id", "day", "title", "summary", "estimated_cost", "morning", "afternoon", "evening")

    def _period(self, obj, period):
        return ActivitySerializer(obj.activities.filter(time_period=period), many=True).data

    def get_morning(self, obj): return self._period(obj, "morning")
    def get_afternoon(self, obj): return self._period(obj, "afternoon")
    def get_evening(self, obj): return self._period(obj, "evening")

class TripSerializer(serializers.ModelSerializer):
    days = DaySerializer(many=True, read_only=True)
    estimated_total = serializers.FloatField(source="estimated_total_cost", read_only=True)

    class Meta:
        model = Trip
        fields = ("id", "destination", "city", "country", "latitude", "longitude", "duration",
                  "travelers", "traveler_type", "adults", "children", "budget", "budget_tier",
                  "travel_styles", "travel_style", "interests", "food_preferences",
                  "summary", "estimated_total_cost", "estimated_total", "budget_breakdown",
                  "weather_note", "weather_snapshot", "share_uuid", "created_at", "days")

class PlanSerializer(serializers.Serializer):
    destination = serializers.CharField(max_length=120)
    duration = serializers.IntegerField(min_value=1, max_value=14, default=3)
    traveler_type = serializers.ChoiceField(choices=TRAVELER_TYPES, default="Couple")
    adults = serializers.IntegerField(min_value=1, max_value=30, default=2)
    children = serializers.IntegerField(min_value=0, max_value=20, default=0)
    budget_tier = serializers.CharField(max_length=20, required=False, default="Moderate")
    budget = serializers.FloatField(min_value=1000, required=False)
    travel_styles = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    food_preferences = serializers.CharField(required=False, allow_blank=True, default="Local Cuisine")

    def validate(self, attrs):
        if not attrs.get("budget"):
            attrs["budget"] = float(BUDGET_TIERS.get(attrs.get("budget_tier", "Moderate"), 22500))
        attrs["travelers"] = attrs["adults"] + attrs["children"]
        if not attrs.get("travel_styles"):
            attrs["travel_styles"] = ["Relaxed"]
        return attrs
