import uuid
from django.db import models

class Trip(models.Model):
    destination = models.CharField(max_length=120, db_index=True)
    city = models.CharField(max_length=120, blank=True, default="")
    country = models.CharField(max_length=120, blank=True, default="")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    duration = models.PositiveIntegerField(default=3)
    travelers = models.PositiveIntegerField(default=2)
    traveler_type = models.CharField(max_length=20, default="Couple")
    adults = models.PositiveIntegerField(default=2)
    children = models.PositiveIntegerField(default=0)
    budget = models.FloatField(default=25000)
    budget_tier = models.CharField(max_length=20, default="Moderate")
    travel_styles = models.JSONField(default=list, blank=True)
    travel_style = models.CharField(max_length=40, default="Balanced")
    interests = models.JSONField(default=list, blank=True)
    food_preferences = models.CharField(max_length=200, blank=True, default="")
    accommodation = models.CharField(max_length=60, blank=True, default="")
    transportation = models.CharField(max_length=60, blank=True, default="")
    summary = models.TextField(blank=True, default="")
    estimated_total_cost = models.FloatField(default=0)
    budget_breakdown = models.JSONField(default=dict, blank=True)
    weather_note = models.TextField(blank=True, default="")
    weather_snapshot = models.JSONField(default=dict, blank=True)
    share_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.destination} ({self.duration}d)"

class ItineraryDay(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="days")
    day_number = models.PositiveIntegerField()
    title = models.CharField(max_length=160, default="")
    summary = models.CharField(max_length=500, blank=True, default="")
    estimated_cost = models.FloatField(default=0)

    class Meta:
        ordering = ["day_number"]
        unique_together = ("trip", "day_number")

class Activity(models.Model):
    PERIODS = (("morning", "Morning"), ("afternoon", "Afternoon"), ("evening", "Evening"))
    day = models.ForeignKey(ItineraryDay, on_delete=models.CASCADE, related_name="activities")
    time_period = models.CharField(max_length=10, choices=PERIODS, default="morning")
    category = models.CharField(max_length=30, default="Activity")
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True, default="")
    location = models.CharField(max_length=200, blank=True, default="")
    recommended_time = models.CharField(max_length=60, blank=True, default="")
    estimated_cost = models.FloatField(default=0)
    duration = models.CharField(max_length=60, blank=True, default="")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ["id"]
