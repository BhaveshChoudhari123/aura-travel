import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

// No authentication in Aura Travel — direct access for everyone.
export const api = axios.create({ baseURL });

export const fmtErr = (e, fallback = "Something went wrong. Please try again.") => {
  const d = e?.response?.data;
  if (!d) return e?.message || fallback;
  if (d.message) return d.message;
  if (d.errors) {
    const first = Object.values(d.errors).flat()[0];
    return Array.isArray(first) ? first[0] : String(first);
  }
  if (typeof d === "string") return d;
  return fallback;
};
