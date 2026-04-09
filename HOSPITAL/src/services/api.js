import axios from "axios";

const API = axios.create({ baseURL: "" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("hiss_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const loginUser = (username, password) =>
  API.post("/api/auth/login", { username, password });

export const getMe = () => API.get("/api/auth/me");

export const healthCheck = () => API.get("/health");

export const getWards = () => API.get("/api/wards");

export const getInitialData = () => API.get("/api/initial-data");

export const getWardStats = () => API.get("/api/ward-stats");

export const connectWebSocket = (onMessage, onError) => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

  ws.onopen = () => console.log("✅ WebSocket Connected");
  ws.onmessage = (event) => {
    try { onMessage(JSON.parse(event.data)); } catch (err) { console.error("WS parse error:", err); }
  };
  ws.onerror = (error) => { console.error("WebSocket error:", error); if (onError) onError(error); };
  ws.onclose = () => console.log("WebSocket Disconnected");

  return ws;
};

export default API;
