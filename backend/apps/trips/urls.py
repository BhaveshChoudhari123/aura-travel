from django.urls import path
from .views import plan, generate, trip_detail, latest_trip, share_trip, shared_trip, optimize, recommend

urlpatterns = [
    path("trips/plan/", plan, name="plan"),
    path("trips/generate/", generate, name="generate"),
    path("trips/latest/", latest_trip, name="latest"),
    path("trips/<int:pk>/", trip_detail, name="detail"),
    path("trips/<int:pk>/share/", share_trip, name="share"),
    path("trips/<int:pk>/optimize-budget/", optimize, name="optimize"),
    path("recommend-destinations/", recommend, name="recommend"),
    path("shared/<ref>/", shared_trip, name="shared"),
    # back-compat
    path("shared-trips/<ref>/", shared_trip, name="shared-legacy"),
]
