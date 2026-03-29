import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getData = () => API.get("/data");   // adjust endpoint
export const predict = (payload) => API.post("/predict", payload);