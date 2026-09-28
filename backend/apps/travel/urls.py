from django.urls import path
from .views import geocode_view, suggestions, weather, destination_search

urlpatterns = [
    path("geocode/", geocode_view, name="geocode"),
    path("suggestions/", suggestions, name="suggestions"),
    path("destinations/search/", destination_search, name="dest-search"),
    path("weather/", weather, name="weather"),
]
