
import React, { useMemo, useState } from "react";

// ------- Demo data (replace with your real data source) -------
const demoData = {
  September: {
    income: [
      { label: "Paycheck", amount: 4200 },
      { label: "Freelance", amount: 900 },
      { label: "Dividend", amount: 120 },
    ],
    outcome: [
      { label: "Rent", amount: 1800 },
      { label: "Groceries", amount: 460 },
      { label: "Dining Out", amount: 220 },
      { label: "Transport", amount: 140 },
      { label: "Subscriptions", amount: 65 },
      { label: "Other", amount: 120 },
    ],
  },
  October: {
    income: [
      { label: "Paycheck", amount: 4200 },
      { label: "Freelance", amount: 400 },
    ],
    outcome: [
      { label: "Rent", amount: 1800 },
      { label: "Groceries", amount: 520 },
      { label: "Dining Out", amount: 180 },
      { label: "Transport", amount: 150 },
      { label: "Subscriptions", amount: 65 },
    ],
  },
  November: {
    income: [
      { label: "Paycheck", amount: 4200 },
      { label: "Freelance", amount: 0 },
    ],
    outcome: [
      { label: "Rent", amount: 1800 },
      { label: "Groceries", amount: 480 },
      { label: "Dining Out", amount: 210 },
      { label: "Transport", amount: 130 },
      { label: "Subscriptions", amount: 65 },
    ],
  },
};
// -------------------------------------------------------------

const currency = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function FinanceDashboard() {
  const months = Object.keys(demoData);
  const [month, setMonth] = useState(months[0] || "September");

  const { income, outcome, totalIncome, totalOutcome, net } = useMemo(() => {
    const m = demoData[month] || { income: [], outcome: [] };
    const totalIncome = m.income.reduce((s, x) => s + x.amount, 0);
    const totalOutcome = m.outcome.reduce((s, x) => s + x.amount, 0);
    const net = totalIncome - totalOutcome;
    return { ...m, totalIncome, totalOutcome, net };
  }, [month]);

  // For progress bars
  const maxIncome = Math.max(1, ...income.map((x) => x.amount));
  const maxOutcome = Math.max(1, ...outcome.map((x) => x.amount));

  // -------------------- Styles (no external CSS) --------------------
  const page = { padding: 20, maxWidth: 1100, margin: "0 auto" };

  const headerRow = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  };

  const title = { fontSize: 28, fontWeight: 800, margin: 0 };

  const select = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
  };

  const cards = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 16,
  };

  const card = {
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,.08)",
    border: "1px solid #f2f2f2",
  };

  const label = { color: "#6b7280", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 };
  const big = { fontSize: 28, fontWeight: 800, marginTop: 6 };

  const netPill = (v) => ({
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
    color: v >= 0 ? "#065f46" : "#7f1d1d",
    background: v >= 0 ? "#ecfdf5" : "#fef2f2",
    border: `1px solid ${v >= 0 ? "#a7f3d0" : "#fecaca"}`,
  });

  const twoCols = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  };

  const panel = {
    borderRadius: 16,
    padding: 16,
    background: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,.08)",
    border: "1px solid #f2f2f2",
  };

  const row = { display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 10, marginTop: 10 };
  const barWrap = { height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" };
  const bar = (w, color) => ({ width: w, height: "100%", background: color });

  // ------------------------------------------------------------------

  return (
    <div style={page}>
      {/* Header */}
      <div style={headerRow}>
        <h1 style={title}>Income & Outcome</h1>
        <div>
          <label style={{ marginRight: 8, color: "#6b7280", fontWeight: 600 }}>Month</label>
          <select style={select} value={month} onChange={(e) => setMonth(e.target.value)}>
            {Object.keys(demoData).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top summary cards */}
      <div style={cards}>
        <div style={card}>
          <div style={label}>Total Income</div>
          <div style={big}>{currency(totalIncome)}</div>
          <div style={{ color: "#6b7280", marginTop: 4 }}>{income.length} sources</div>
        </div>

        <div style={card}>
          <div style={label}>Total Outcome</div>
          <div style={big}>{currency(totalOutcome)}</div>
          <div style={{ color: "#6b7280", marginTop: 4 }}>{outcome.length} categories</div>
        </div>

        <div style={card}>
          <div style={label}>Net</div>
          <div style={{ marginTop: 6 }}>
            <span style={netPill(net)}>{net >= 0 ? "+" : "−"}{currency(Math.abs(net))}</span>
          </div>
          <div style={{ color: "#6b7280", marginTop: 8 }}>
            {net >= 0 ? "Great — you’re saving this month." : "Heads up — you’re negative this month."}
          </div>
        </div>
      </div>

      {/* Two columns: Income vs Outcome */}
      <div style={twoCols}>
        {/* Income */}
        <div style={panel}>
          <div style={{ ...label, fontSize: 13 }}>Income</div>
          {income.length === 0 && <div style={{ color: "#9ca3af", marginTop: 10 }}>No income recorded.</div>}
          {income.map((it) => {
            const pct = `${Math.round((it.amount / maxIncome) * 100)}%`;
            return (
              <div key={it.label} style={row}>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.label}</div>
                  <div style={barWrap}>
                    <div style={bar(pct, "#10b981")} />
                  </div>
                </div>
                <div style={{ fontWeight: 800 }}>{currency(it.amount)}</div>
              </div>
            );
          })}
        </div>

        {/* Outcome */}
        <div style={panel}>
          <div style={{ ...label, fontSize: 13 }}>Outcome</div>
          {outcome.length === 0 && <div style={{ color: "#9ca3af", marginTop: 10 }}>No expenses recorded.</div>}
          {outcome.map((it) => {
            const pct = `${Math.round((it.amount / maxOutcome) * 100)}%`;
            return (
              <div key={it.label} style={row}>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.label}</div>
                  <div style={barWrap}>
                    <div style={bar(pct, "#8b5cf6")} />
                  </div>
                </div>
                <div style={{ fontWeight: 800 }}>{currency(it.amount)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
