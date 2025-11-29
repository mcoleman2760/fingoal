// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { MonthProvider } from "./state/MonthContext";

import Home from "./pages/Home";
import IncomeOutcome from "./pages/IncomeOutcome";
import Spending from "./pages/Spending";
import Savings from "./pages/Savings";
import Challenge from "./pages/Challenge";
import Login from "./pages/Login";
import SharedGoals from "./pages/SharedGoals"; // ✅ import SharedGoals page
import Intro from "./pages/Intro"; // ✅ import SharedGoals page


import "./App.css";
import logo from "./fingoalLogo.png";

// --- Top Nav ---
function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <Link to="/home">
        <img src={logo} alt="Fingoal Logo" style={styles.logo} />
      </Link>
      <div className="nav-links">
        <Link to="/home" className="nav-link">
          Home
        </Link>
        <Link to="/upload" className="nav-link">
          Upload 
        </Link>
        <Link to="/income-outcome" className="nav-link">
          Income/Outcome
        </Link>
        <Link to="/savings" className="nav-link">
          Savings
        </Link>
        <Link to="/spending" className="nav-link">
          Spending
        </Link>
        <Link to="/challenge" className="nav-link">
          Challenge
        </Link>

        <Link to="/shared-goals" className="nav-link">
          Shared Goals
        </Link>

        {/* ✅ add Shared Goals link */}
      </div>
      <div>
        {!user ? (
          <Link to="/login" className="nav-link">
            Sign in
          </Link>
        ) : (
          <button className="nav-button" onClick={logout}>
            Sign out ({user.username || user})
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  logo: {
    width: "40px",
    height: "40px",
    objectFit: "contain",
    cursor: "pointer",
    marginRight: "10px",
  },
};

// --- App Root ---
export default function App() {
  return (
    <AuthProvider>
      <MonthProvider>
        <Router>
          <Nav />
          <Routes>
            {/* Public */}
            <Route path="/upload" element={<Home />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Intro />
                </ProtectedRoute>
              }
            />
            {/* Protected */}
            <Route
              path="/income-outcome"
              element={
                <ProtectedRoute>
                  <IncomeOutcome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/spending"
              element={
                <ProtectedRoute>
                  <Spending />
                </ProtectedRoute>
              }
            />
            <Route
              path="/savings"
              element={
                <ProtectedRoute>
                  <Savings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenge"
              element={
                <ProtectedRoute>
                  <Challenge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shared-goals" // ✅ protected route
              element={
                <ProtectedRoute>
                  <SharedGoals />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MonthProvider>
    </AuthProvider>
  );
}

