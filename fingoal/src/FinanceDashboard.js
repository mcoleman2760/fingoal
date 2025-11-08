

// FinanceDashboard.jsx
import React, { useMemo } from "react";
import { getSummaryByMonth } from "./data/txStore";
import DailySpendingCalendar from "./DailySpendingCalendar";
import SpendingTrend from "./SpendingTrend";
import { useMonth } from "./state/MonthContext";

const currency = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function FinanceDashboard() {
  const { month, setMonth, months } = useMonth();

  const { totalIncome, totalOutcome, net } = useMemo(
    () =>
      month
        ? getSummaryByMonth(month)
        : { totalIncome: 0, totalOutcome: 0, net: 0 },
    [month]
  );

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Income & Outcome</h1>
        <div>
          <label style={{ marginRight: 8, color: "#6b7280", fontWeight: 600 }}>Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards (keep) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ borderRadius: 16, padding: 16, background: "white", border: "1px solid #f2f2f2" }}>
          <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Total Income</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{currency(totalIncome)}</div>
        </div>
        <div style={{ borderRadius: 16, padding: 16, background: "white", border: "1px solid #f2f2f2" }}>
          <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Total Outcome</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{currency(totalOutcome)}</div>
        </div>
        <div style={{ borderRadius: 16, padding: 16, background: "white", border: "1px solid #f2f2f2" }}>
          <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Net</div>
          <div style={{ marginTop: 6 }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 999,
                fontWeight: 700,
                color: net >= 0 ? "#065f46" : "#7f1d1d",
                background: net >= 0 ? "#ecfdf5" : "#fef2f2",
                border: `1px solid ${net >= 0 ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {net >= 0 ? "+" : "−"}
              {currency(Math.abs(net))}
            </span>
          </div>
        </div>
      </div>

      {/* Calendar only (full width) */}
      <div>
        <DailySpendingCalendar />
      </div>

      {/* Full-width chart UNDER the calendar */}
      <div style={{ marginTop: 20 }}>
        <SpendingTrend />
      </div>
    </div>
  );
}
