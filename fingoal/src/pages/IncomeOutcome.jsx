import React from "react";
import FinanceDashboard from "../FinanceDashboard"; 

export default function IncomeOutcome() {
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#2563eb" }}>
            Income & Outcome
          </h1>
          <p style={{ color: "#6b7280", marginTop: 6 }}>
            Overview of your monthly income and expenses.
          </p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #eef2ff",
          }}
        >
          {/* FinanceDashboard contains the detailed UI and logic (unchanged) */}
          <FinanceDashboard />
        </div>
      </div>
    </div>
  );
}