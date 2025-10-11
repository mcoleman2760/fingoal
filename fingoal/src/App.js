import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { MonthProvider } from "./state/MonthContext";

import Home from "./pages/Home";
import IncomeOutcome from "./pages/IncomeOutcome";
import Spending from "./pages/Spending";
import Savings from "./pages/Savings";
import Challenge from "./pages/Challenge";
import "./App.css";

// ------------------ Navbar ------------------
function Nav() {
  const { user, signOut } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className="nav-link" style={{ marginRight: "15px" }}>Home</Link>
        <Link to="/income-outcome" className="nav-link" style={{ marginRight: "15px" }}>Income/Outcome</Link>
        <Link to="/savings" className="nav-link" style={{ marginRight: "15px" }}>Savings</Link>
        <Link to="/spending" className="nav-link" style={{ marginRight: "15px" }}>Spending</Link>
        <Link to="/challenge" className="nav-link" style={{ marginRight: "15px" }}>Challenge</Link>
      </div>
      {user && (
        <button className="nav-button" onClick={signOut}>
          Sign out ({user.username})
        </button>
      )}
    </nav>
  );
}

// ------------------ App ------------------
export default function App() {
  return (
    <AuthProvider>
      <MonthProvider>
        <Router>
          <Nav />
          <Routes>
            {/* Public: Home (Sign in / Upload) */}
            <Route path="/" element={<Home />} />

            {/* Protected pages */}
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

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MonthProvider>
    </AuthProvider>
  );
}
