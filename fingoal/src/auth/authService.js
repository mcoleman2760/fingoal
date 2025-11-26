// src/auth/authService.js
import api from "../api/client";

// Register a new user
export const registerUser = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  if (data?.token) localStorage.setItem("finGoal_token", data.token);
  if (data?.user?.username) localStorage.setItem("finGoal_name", data.user.username);
  return data;
};

// Login user
export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  if (data?.token) localStorage.setItem("finGoal_token", data.token);
  if (data?.user?.username) localStorage.setItem("finGoal_name", data.user.username);
  return data;
};

// (optional) Get profile if backend exposes it
export const getProfile = async () => {
  const { data } = await api.get("/auth/profile");
  return data;
};

// Logout helper
export const logoutUser = () => {
  localStorage.removeItem("finGoal_token");
  localStorage.removeItem("finGoal_name");
};
