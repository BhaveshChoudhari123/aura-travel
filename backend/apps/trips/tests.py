from django.test import TestCase
from rest_framework.test import APIClient

class PlannerTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_plan_view_delete(self):
        g = self.client.post("/api/trips/plan/", {
            "destination": "Goa", "duration": 2, "traveler_type": "Couple",
            "adults": 2, "children": 0, "budget_tier": "Moderate",
            "travel_styles": ["Relaxed"], "interests": ["Beaches"], "food_preferences": "Seafood",
        }, format="json")
        self.assertEqual(g.status_code, 201, g.content[:500])
        self.assertEqual(len(g.data["days"]), 2)
        self.assertIn("weather", g.data)
        tid = g.data["id"]
        d = self.client.get(f"/api/trips/{tid}/")
        self.assertEqual(d.status_code, 200)
        o = self.client.post(f"/api/trips/{tid}/optimize-budget/")
        self.assertEqual(o.status_code, 200)
        self.assertIn("savings", o.data)
        rm = self.client.delete(f"/api/trips/{tid}/")
        self.assertEqual(rm.status_code, 200)

    def test_geo_suggest_weather_recommend(self):
        self.assertEqual(self.client.post("/api/geocode/", {"destination": "Tokyo"}, format="json").status_code, 200)
        self.assertEqual(self.client.get("/api/suggestions/?destination=Goa").status_code, 200)
        self.assertEqual(self.client.get("/api/weather/?destination=Goa&days=3").status_code, 200)
        r = self.client.post("/api/recommend-destinations/", {"budget": 20000, "duration": 4, "interests": ["Nature"]}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.data), 3)

    def test_invalid_destination(self):
        r = self.client.post("/api/trips/plan/", {"destination": "  ", "duration": 2}, format="json")
        self.assertEqual(r.status_code, 400)
