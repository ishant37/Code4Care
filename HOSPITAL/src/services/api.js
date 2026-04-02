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

// ==================== FHIR & EHR Integration ====================
// Authenticate with Hospital EHR
export const authenticateEHR = () => API.get("/api/ehr/authenticate");

// Sync Patient Data from EHR
export const syncEHRData = (wardId = null) => {
  const params = wardId ? { ward_id: wardId } : {};
  return API.get("/api/ehr/sync", { params });
};

// Get Lab Results in FHIR Format
export const getLabObservationsFHIR = (wardId = null) => {
  const params = wardId ? { ward_id: wardId } : {};
  return API.get("/api/fhir/lab-observations", { params });
};

// Get Infection Logs in FHIR Format
export const getInfectionConditionsFHIR = (wardId = null) => {
  const params = wardId ? { ward_id: wardId } : {};
  return API.get("/api/fhir/infection-conditions", { params });
};

// Complete EHR Sync with FHIR Transformation
export const syncAndTransformFHIR = (wardId = null) => {
  const params = wardId ? { ward_id: wardId } : {};
  return API.post("/api/ehr/sync-and-transform", {}, { params });
};

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