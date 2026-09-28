const KEY = "tn_recent_trips";
const LAST = "tn_last_trip";

export const getRecentTrips = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

export const addRecentTrip = (trip) => {
  try {
    const list = getRecentTrips().filter((t) => t.id !== trip.id);
    list.unshift({ id: trip.id, destination: trip.destination, duration: trip.duration, budget: trip.budget, travelers: trip.travelers, created_at: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
    localStorage.setItem(LAST, String(trip.id));
  } catch { /* ignore */ }
};

export const removeRecentTrip = (id) => {
  try { localStorage.setItem(KEY, JSON.stringify(getRecentTrips().filter((t) => t.id !== id))); } catch { /* ignore */ }
};

export const duplicateTripPayload = (trip) => ({
  destination: trip.destination, duration: trip.duration, traveler_type: trip.traveler_type,
  adults: trip.adults ?? trip.travelers ?? 2, children: trip.children ?? 0,
  budget_tier: trip.budget_tier, budget: trip.budget,
  travel_styles: trip.travel_styles, interests: trip.interests, food_preferences: trip.food_preferences,
});

export const getLastTripId = () => localStorage.getItem(LAST);
