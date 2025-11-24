
// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
  // You only need withCredentials if you are using http-only cookies.
  // You're using JWT in localStorage, so this can remain false.
  withCredentials: false,
  timeout: 10000,
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finGoal_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler (optional)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn("🔒 Session expired. Logging out...");
      localStorage.removeItem("finGoal_token");
      localStorage.removeItem("finGoal_name");
      // If you have a login route in your SPA, you can redirect:
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* --------------------------------------------------------------------------------
 * Backward-compatible named exports
 * These match what the rest of your codebase expects to import from './api/client'
 * (AuthContext.jsx, TransactionPage.js, txStore.js, etc.)
 * -------------------------------------------------------------------------------- */

// ---------- Auth ----------
export async function registerUser({ email, password, name, username }) {
  // Your backend expects "username". Allow callers that still pass "name".
  const uname = username || name;
  const { data } = await api.post("/auth/register", { username: uname, email, password });
  if (data?.token) localStorage.setItem("finGoal_token", data.token);
  if (data?.user?.username) localStorage.setItem("finGoal_name", data.user.username);
  return data;
}

export async function loginUser(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data?.token) localStorage.setItem("finGoal_token", data.token);
  if (data?.user?.username) localStorage.setItem("finGoal_name", data.user.username);
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

// ---------- Friends ----------
export async function fetchFriends() {
  const { data } = await api.get("/friends");        // GET /api/friends
  return data;                                       // { friends: [...] }
}

export async function fetchFriendsLeaderboard(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(`/friends/leaderboard${qs ? `?${qs}` : ""}`);
  return data; // { leaderboard: [...] }
}

export async function addFriend(friendUsername) {
  const { data } = await api.post("/friends", {      // POST /api/friends
    friendUsername,
  });
  return data;                                       // { friends: [...] }
}

export async function removeFriend(friendId) {
  const { data } = await api.delete(`/friends/${friendId}`); // DELETE /api/friends/:friendId
  return data;                                       // { friends: [...] }
}


export async function clearAllTransactions() {
  const { data } = await api.delete("/transactions");
  return data; // { deleted: N }
}

// client.js (add these)
export async function fetchMySavingRate() {
  const { data } = await api.get("/statements"); // uses your JWT via interceptor
  return data?.savingRate ?? 0;
}

export async function fetchFriendSavingRate(userId) {
  // If you implemented a /api/users/:id/summary endpoint, call it here.
  // If not, keep using your server-side leaderboard or whatever you set up.
  const { data } = await api.get(`/users/${userId}/summary`);
  return data?.savingRate ?? 0;
}


export default api;

// Shared goals
// api/client.js

// Fetch all shared goals for the current user
export async function fetchSharedGoals() {
  const res = await fetch("/api/shared-goals");
  if (!res.ok) throw new Error("Failed to fetch shared goals");
  return res.json(); // returns { goals: [...] }
}

// Update progress/contribution for a shared goal
export async function updateSharedGoalProgress(goalId, amount) {
  const res = await fetch("/api/shared-goals", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goalId, amount }),
  });
  if (!res.ok) throw new Error("Failed to update shared goal");
  return res.json(); // returns updated goal
}
