import React from "react";
import { useAuth } from "../auth/AuthContext";
import "./Intro.css";

export default function Intro() {

      const { user, login, logout } = useAuth();

  return (
    <div className="main" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Welcome back, {user} 👋
        </h1>
      </div>
    </div>
  );
  }
  