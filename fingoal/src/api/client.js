// // src/api/client.js
// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
//   withCredentials: true,
//   timeout: 10000,
// });

// // Attach JWT token if available
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("finGoal_token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });


// // Handle 401 errors globally (unauthorized)
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err?.response?.status === 401) {
//       console.warn("🔒 Session expired. Logging out...");
//       localStorage.removeItem("finGoal_token");
//       localStorage.removeItem("finGoal_name");
//       // Optional: redirect user to login
//       window.location.href = "/login";
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;

// // ---------- Auth ----------
// export async function registerUser({ email, password, name }) {
//   return api.post("/auth/register", { email, password, name });
// }

// export async function loginUser(email, password) {
//   const { data } = await api.post("/auth/login", { email, password });
//   localStorage.setItem("finGoal_token", data.token);
//   localStorage.setItem("finGoal_name", data.name || "");
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

// // ---------- Upload Statements ----------
// export async function uploadStatement(file) {
//   const form = new FormData();
//   form.append("file", file);
//   const { data } = await api.post("/statements/upload", form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return data;
// }

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

export async function clearAllTransactions() {
  const { data } = await api.delete("/transactions");
  return data; // { deleted: N }
}

export default api;
