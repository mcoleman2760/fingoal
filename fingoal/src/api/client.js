// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
  withCredentials: true,
  timeout: 10000,
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finGoal_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


// Handle 401 errors globally (unauthorized)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn("🔒 Session expired. Logging out...");
      localStorage.removeItem("finGoal_token");
      localStorage.removeItem("finGoal_name");
      // Optional: redirect user to login
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ---------- Auth ----------
export async function registerUser({ email, password, name }) {
  return api.post("/auth/register", { email, password, name });
}

export async function loginUser(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("finGoal_token", data.token);
  localStorage.setItem("finGoal_name", data.name || "");
  return data;
}

export function logoutUser() {
  localStorage.removeItem("finGoal_token");
  localStorage.removeItem("finGoal_name");
}

// ---------- Transactions ----------
export async function getTransactions() {
  const { data } = await api.get("/transactions");
  return data;
}

export async function addTransaction(tx) {
  const { data } = await api.post("/transactions", tx);
  return data;
}

// ---------- Upload Statements ----------
export async function uploadStatement(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/statements/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}