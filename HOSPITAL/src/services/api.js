import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Health Check
export const healthCheck = () => API.get("/health");

// Get all wards configuration
export const getWards = () => API.get("/api/wards");

// Get initial clinical data
export const getInitialData = () => API.get("/api/initial-data");

// WebSocket connection for real-time updates
export const connectWebSocket = (onMessage, onError) => {
  const ws = new WebSocket(`ws://localhost:8000/ws`);
  
  ws.onopen = () => {
    console.log("✅ WebSocket Connected");
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("WebSocket message parse error:", err);
    }
  };
  
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (onError) onError(error);
  };
  
  ws.onclose = () => {
    console.log("WebSocket Disconnected");
  };
  
  return ws;
};

export default API;