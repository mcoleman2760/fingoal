// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000",
});

// Automatically attach JWT from localStorage if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finGoal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// -------- Auth calls --------
export async function registerUser({ email, password, name }) {
  return api.post("/api/auth/register", { email, password, name });
}

export async function loginUser(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  localStorage.setItem("finGoal_token", data.token);
  localStorage.setItem("finGoal_name", data.name || "");
  return data;
}

export function logoutUser() {
  localStorage.removeItem("finGoal_token");
  localStorage.removeItem("finGoal_name");
}

// -------- Transactions & uploads --------
export async function getTransactions() {
  const { data } = await api.get("/api/transactions");
  return data;
}

export async function addTransaction(tx) {
  const { data } = await api.post("/api/transactions", tx);
  return data;
}

export async function uploadStatement(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/api/statements/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
