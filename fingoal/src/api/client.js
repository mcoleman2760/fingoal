// src/api/client.js
import axios from "axios";

// -----------------------------------------------------------------------------
// API base URL
// -----------------------------------------------------------------------------
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001/api";

console.log("🔎 Using API base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 60000,
});

// -----------------------------------------------------------------------------
// Request interceptor: attach JWT token
// -----------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finGoal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -----------------------------------------------------------------------------
// Response interceptor: log errors and handle 401
// -----------------------------------------------------------------------------
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ Axios error:", err.message);
    if (err.response)
      console.error("Status:", err.response.status, "Data:", err.response.data);
    else if (err.request) console.error("No response received from server.");
    else console.error("Request setup error:", err);

    if (err?.response?.status === 401) {
      console.warn("🔒 Session expired. Logging out...");
      localStorage.removeItem("finGoal_token");
      localStorage.removeItem("finGoal_name");
    }

    return Promise.reject(err);
  }
);

// ---------- Auth ----------
export async function registerUser({ email, password, name, username }) {
  const uname = username || name;
  const { data } = await api.post("/auth/register", {
    username: uname,
    email,
    password,
  });
  if (data?.token) localStorage.setItem("finGoal_token", data.token);
  if (data?.user?.username)
    localStorage.setItem("finGoal_name", data.user.username);
  return data;
}

export async function loginUser(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data?.token) localStorage.setItem("finGoal_token", data.token);
  if (data?.user?.username)
    localStorage.setItem("finGoal_name", data.user.username);
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

export async function clearAllTransactions() {
  const { data } = await api.delete("/transactions");
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

// ---------- Friends ----------
export async function fetchFriends() {
  const { data } = await api.get("/friends");
  return data;
}

export async function fetchFriendsLeaderboard(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(`/friends/leaderboard${qs ? `?${qs}` : ""}`);
  return data;
}

export async function addFriend(friendUsername) {
  const { data } = await api.post("/friends", { friendUsername });
  return data;
}

export async function removeFriend(friendId) {
  const { data } = await api.delete(`/friends/${friendId}`);
  return data;
}

// ---------- Saving rate helpers ----------
export async function fetchMySavingRate() {
  const { data } = await api.get("/statements");
  return data?.savingRate ?? 0;
}

export async function fetchFriendSavingRate(userId) {
  const { data } = await api.get(`/users/${userId}/summary`);
  return data?.savingRate ?? 0;
}

// ---------- Shared goals ----------
// ---------- Shared goals ----------
// ---------- Shared Goals ----------
export async function fetchSharedGoals() {
  const { data } = await api.get("/shared-goals");
  return data; // expects { sharedGoals: [...] }
}

export async function createSharedGoalAPI(goalData) {
  const { data } = await api.post("/shared-goals", goalData);
  return data;
}
export async function updateSharedGoalProgress(goalId, amount) {
  const { data } = await api.put(`/shared-goals/${goalId}`, { amount });
  return data; // should return the updated goal document
}


export async function deleteSharedGoal(goalId) {
  const { data } = await api.delete(`/shared-goals/${goalId}`);
  return data;
}







export default api;
