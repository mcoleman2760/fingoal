// src/auth/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import { loginUser, registerUser, logoutUser } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem("finGoal_name") || null);

  async function login(email, password) {
    const data = await loginUser(email, password);
    setUser(data.name);
  }

  // 👇 add this wrapper so components that call signIn keep working
  async function signIn({ email, password, username }) {
    // if a form passes username, treat it as email for compatibility
    const em = email || username;
    return login(em, password);
  }

  async function register(info) {
    await registerUser(info);
  }

  function logout() {
    logoutUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, login, signIn, register, logout }}  // 👈 expose signIn
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
