// // src/api/client.js
// import axios from "axios";

// // -----------------------------------------------------------------------------
// // API base URL
// // For now, hardcode it to make sure we're really talking to localhost:5001/api.
// // Later, you can switch back to using REACT_APP_API_URL if you want.
// // -----------------------------------------------------------------------------
// const API_BASE_URL = "http://localhost:5001/api";

// console.log("🔎 Using API base URL:", API_BASE_URL);

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   // You're using JWT in localStorage, not cookies:
//   withCredentials: false,
//   timeout: 10000,
// });

// // -----------------------------------------------------------------------------
// // Request interceptor: attach JWT token (if present)
// // -----------------------------------------------------------------------------
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("finGoal_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // -----------------------------------------------------------------------------
// // Response interceptor: log errors and handle 401
// // -----------------------------------------------------------------------------
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     console.error("❌ Axios error:", err.message);

//     if (err.response) {
//       console.error("Status:", err.response.status);
//       console.error("Data:", err.response.data);
//     } else if (err.request) {
//       console.error(
//         "No response received from server. Possible CORS or network issue."
//       );
//     } else {
//       console.error("Request setup error:", err);
//     }

//     // Global 401 handler
//     if (err?.response?.status === 401) {
//       console.warn("🔒 Session expired. Logging out...");
//       localStorage.removeItem("finGoal_token");
//       localStorage.removeItem("finGoal_name");
//       // Optionally redirect:
//       // window.location.href = "/login";
//     }
//     return Promise.reject(err);
//   }
// );

// /* --------------------------------------------------------------------------------
//  * Backward-compatible named exports
//  * These match what the rest of your codebase expects to import from './api/client'
//  * -------------------------------------------------------------------------------- */

// // ---------- Auth ----------
// export async function registerUser({ email, password, name, username }) {
//   // Backend expects "username". Allow callers that pass "name".
//   const uname = username || name;
//   const { data } = await api.post("/auth/register", {
//     username: uname,
//     email,
//     password,
//   });

//   if (data?.token) localStorage.setItem("finGoal_token", data.token);
//   if (data?.user?.username)
//     localStorage.setItem("finGoal_name", data.user.username);

//   return data;
// }

// export async function loginUser(email, password) {
//   const { data } = await api.post("/auth/login", { email, password });

//   if (data?.token) localStorage.setItem("finGoal_token", data.token);
//   if (data?.user?.username)
//     localStorage.setItem("finGoal_name", data.user.username);

//   return data;
// }

// export function logoutUser() {
//   localStorage.removeItem("finGoal_token");
//   localStorage.removeItem("finGoal_name");
// }

// // ---------- Transactions ----------
// export async function getTransactions() {
//   const { data } = await api.get("/transactions");
//   return data;
// }

// export async function addTransaction(tx) {
//   const { data } = await api.post("/transactions", tx);
//   return data;
// }

// export async function clearAllTransactions() {
//   const { data } = await api.delete("/transactions");
//   return data; // { deleted: N }
// }

// // ---------- Upload Statements ----------
// export async function uploadStatement(file) {
//   const form = new FormData();
//   form.append("file", file);

//   const { data } = await api.post("/statements/upload", form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return data;
// }

// // ---------- Friends ----------
// export async function fetchFriends() {
//   const { data } = await api.get("/friends"); // GET /api/friends
//   return data; // { friends: [...] }
// }

// export async function fetchFriendsLeaderboard(params = {}) {
//   const qs = new URLSearchParams(params).toString();
//   const { data } = await api.get(
//     `/friends/leaderboard${qs ? `?${qs}` : ""}`
//   );
//   return data; // { leaderboard: [...] }
// }

// export async function addFriend(friendUsername) {
//   const { data } = await api.post("/friends", {
//     friendUsername,
//   }); // POST /api/friends
//   return data; // { friends: [...] }
// }

// export async function removeFriend(friendId) {
//   const { data } = await api.delete(`/friends/${friendId}`); // DELETE /api/friends/:friendId
//   return data; // { friends: [...] }
// }

// // ---------- Saving rate helpers (if you use them) ----------
// export async function fetchMySavingRate() {
//   const { data } = await api.get("/statements"); // expects { savingRate: number, ... }
//   return data?.savingRate ?? 0;
// }

// export async function fetchFriendSavingRate(userId) {
//   const { data } = await api.get(`/users/${userId}/summary`);
//   return data?.savingRate ?? 0;
// }

// export default api;

// // Shared goals
// // api/client.js

// // Fetch all shared goals for the current user
// export async function fetchSharedGoals() {
//   const res = await fetch("/api/shared-goals");
//   if (!res.ok) throw new Error("Failed to fetch shared goals");
//   return res.json(); // returns { goals: [...] }
// }

// // Update progress/contribution for a shared goal
// export async function updateSharedGoalProgress(goalId, amount) {
//   const res = await fetch("/api/shared-goals", {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ goalId, amount }),
//   });
//   if (!res.ok) throw new Error("Failed to update shared goal");
//   return res.json(); // returns updated goal
// }

// src/api/client.js
import axios from "axios";

// -----------------------------------------------------------------------------
// API base URL
// - In development: defaults to http://localhost:5001/api
// - In production (Vercel): use REACT_APP_API_BASE_URL env var
// -----------------------------------------------------------------------------
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001/api";

console.log("🔎 Using API base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  // You're using JWT in localStorage, not cookies:
  withCredentials: false,
  timeout: 10000,
});

// -----------------------------------------------------------------------------
// Request interceptor: attach JWT token (if present)
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

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else if (err.request) {
      console.error(
        "No response received from server. Possible CORS or network issue."
      );
    } else {
      console.error("Request setup error:", err);
    }

    // Global 401 handler
    if (err?.response?.status === 401) {
      console.warn("🔒 Session expired. Logging out...");
      localStorage.removeItem("finGoal_token");
      localStorage.removeItem("finGoal_name");
      // Optionally redirect:
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* --------------------------------------------------------------------------------
 * Backward-compatible named exports
 * These match what the rest of your codebase expects to import from './api/client'
 * -------------------------------------------------------------------------------- */

// ---------- Auth ----------
export async function registerUser({ email, password, name, username }) {
  // Backend expects "username". Allow callers that pass "name".
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
  return data; // { deleted: N }
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
  const { data } = await api.get("/friends"); // GET /api/friends
  return data; // { friends: [...] }
}

export async function fetchFriendsLeaderboard(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const { data } = await api.get(
    `/friends/leaderboard${qs ? `?${qs}` : ""}`
  );
  return data; // { leaderboard: [...] }
}

export async function addFriend(friendUsername) {
  const { data } = await api.post("/friends", {
    friendUsername,
  }); // POST /api/friends
  return data; // { friends: [...] }
}

export async function removeFriend(friendId) {
  const { data } = await api.delete(`/friends/${friendId}`); // DELETE /api/friends/:friendId
  return data; // { friends: [...] }
}

// ---------- Saving rate helpers ----------
export async function fetchMySavingRate() {
  const { data } = await api.get("/statements"); // expects { savingRate: number, ... }
  return data?.savingRate ?? 0;
}

export async function fetchFriendSavingRate(userId) {
  const { data } = await api.get(`/users/${userId}/summary`);
  return data?.savingRate ?? 0;
}

// ---------- Shared goals ----------
export async function fetchSharedGoals() {
  const { data } = await api.get("/shared-goals"); // GET /api/shared-goals
  return data; // { goals: [...] }
}

export async function updateSharedGoalProgress(goalId, amount) {
  const { data } = await api.put("/shared-goals", { goalId, amount }); // PUT /api/shared-goals
  return data; // updated goal
}

export default api;
