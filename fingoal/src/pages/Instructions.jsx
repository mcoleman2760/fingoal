import React from "react";
import { useAuth } from "../auth/AuthContext";
//import "./Instructions.css";

export default function Instructions() {

      const { user, login, logout } = useAuth();

  return (
    <div className="main" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, marginTop: 2}}>FAQ </h1>
        <p>
          1. What does “Upload Transactions” mean? <br />
          <br />
          This feature lets you upload your spending or saving transactions
          (like deposits, withdrawals, or purchases). The app uses these to
          automatically update your progress, XP, and shared goals. <br />{" "}
          <br /> 2. What file types can I upload? <br /><br /> You can upload: <br />
          • CSV files (recommended) <br />
          • PDF Plain <br />
          If your bank exports CSV files, they will work perfectly. <br />{" "}
          <br />
          3. What information has to be in the file? <br /> <br /> 
          Your transactions file should include: Date, Merchant, Category, & Amount
          (positive for income/savings, negative for spending)  <br />If there are
          extra columns, the app simply ignores them.
        </p>

        <a href="/upload">Back</a>
      </div>
    </div>
  );
  }
  