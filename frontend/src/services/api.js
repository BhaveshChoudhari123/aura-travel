import { api } from "../api/client";

export const planTrip = (payload) => api.post("/api/trips/plan/", payload).then((r) => r.data);
export const getTrip = (id) => api.get(`/api/trips/${id}/`).then((r) => r.data);
export const getLatestTrip = () => api.get("/api/trips/latest/").then((r) => r.data);
export const deleteTrip = (id) => api.delete(`/api/trips/${id}/`).then((r) => r.data);
export const shareTrip = (id) => api.post(`/api/trips/${id}/share/`).then((r) => r.data);
export const getSharedTrip = (ref) => api.get(`/api/shared/${ref}/`).then((r) => r.data);
export const optimizeBudget = (id) => api.post(`/api/trips/${id}/optimize-budget/`).then((r) => r.data);
export const recommendDestinations = (payload) => api.post("/api/recommend-destinations/", payload).then((r) => r.data);
export const geocode = (destination) => api.post("/api/geocode/", { destination }).then((r) => r.data);
export const getSuggestions = (destination) => api.get("/api/suggestions/", { params: { destination } }).then((r) => r.data);
export const searchDestinations = (q) => api.get("/api/destinations/search/", { params: { q } }).then((r) => r.data);
export const getWeather = (destination, days) => api.get("/api/weather/", { params: { destination, days } }).then((r) => r.data);
