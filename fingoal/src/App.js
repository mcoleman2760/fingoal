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
import TransactionPage from "./TransactionPage";

import "./App.css";
import logo from "./fingoalLogo.png";

// --- Top Nav ---
function Nav() {
  const { user, signOut } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/"><img src={logo} alt="FingGoal Logo" style={styles.logo} /></Link>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/income-outcome" className="nav-link">Income/Outcome</Link>
        <Link to="/savings" className="nav-link">Savings</Link>
        <Link to="/spending" className="nav-link">Spending</Link>
        <Link to="/challenge" className="nav-link">Challenge</Link>
        {/* Optional: show Transactions link only when logged in */}
        {user && <Link to="/transactions" className="nav-link">Transactions</Link>}
      </div>
      <div>
        {!user ? (
          <Link to="/login" className="nav-link">Log in</Link>
        ) : (
          <button className="nav-button" onClick={signOut}>
            Sign out ({user.username})
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
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

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
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionPage />
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
