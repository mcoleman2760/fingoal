
import React, { useMemo, useState } from "react";

/** ---------- Demo data (swap with real data later) ---------- */
const sample = [
  // month is string; use whatever you use elsewhere ("September", "October", etc.)
  { id: 1,  date: "2025-09-05", merchant: "Dribbble Pro",      category: "Subscription", note: "",          amount: 120.0, month: "September" },
  { id: 2,  date: "2025-09-05", merchant: "Adobe Photoshop",   category: "Subscription", note: "",          amount: 110.0, month: "September" },
  { id: 3,  date: "2025-09-07", merchant: "Trader Joe's",      category: "Groceries",    note: "weekly",    amount: 86.34, month: "September" },
  { id: 4,  date: "2025-09-09", merchant: "MTA",               category: "Transport",    note: "7-day",     amount: 34.0,  month: "September" },
  { id: 5,  date: "2025-10-01", merchant: "Rent",              category: "Housing",      note: "Apt 3F",    amount: 1800,  month: "October"   },
  { id: 6,  date: "2025-10-03", merchant: "Whole Foods",       category: "Groceries",    note: "",          amount: 52.18, month: "October"   },
  { id: 7,  date: "2025-10-04", merchant: "Uber",              category: "Transport",    note: "",          amount: 23.6,  month: "October"   },
  { id: 8,  date: "2025-11-02", merchant: "Netflix",           category: "Subscription", note: "Premium",   amount: 22.99, month: "November"  },
];

const allMonths = ["September", "October", "November"];
const allCategories = ["All", "Subscription", "Groceries", "Transport", "Housing"];

/** ---------- Helpers ---------- */
const currency = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

/** ---------- Component ---------- */
export default function TransactionPage() {
  const [month, setMonth] = useState(allMonths[0]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | amount-high | amount-low

  const { filtered, total } = useMemo(() => {
    let rows = sample.filter((r) => r.month === month);

    if (q.trim()) {
      const t = q.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.merchant.toLowerCase().includes(t) ||
          (r.note && r.note.toLowerCase().includes(t)) ||
          (r.category && r.category.toLowerCase().includes(t))
      );
    }

    if (cat !== "All") rows = rows.filter((r) => r.category === cat);

    switch (sortBy) {
      case "oldest":
        rows.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "amount-high":
        rows.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-low":
        rows.sort((a, b) => a.amount - b.amount);
        break;
      default: // newest
        rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const total = rows.reduce((s, r) => s + r.amount, 0);
    return { filtered: rows, total };
  }, [month, q, cat, sortBy]);

  /** ---------- Styles (inline, no CSS file needed) ---------- */
  const page = { padding: 20, maxWidth: 1100, margin: "0 auto" };

  const header = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  };

  const title = { fontSize: 28, fontWeight: 800, margin: 0 };

  const toolbar = {
    display: "grid",
    gridTemplateColumns: "1fr 220px 180px 180px",
    gap: 8,
    marginBottom: 12,
  };

  const input = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
  };

  const select = { ...input, paddingRight: 28 };

  const pill = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
    color: "#7f1d1d",
    background: "#fef2f2",
    border: "1px solid #fecaca",
  };

  const card = {
    borderRadius: 16,
    background: "white",
    border: "1px solid #f2f2f2",
    boxShadow: "0 1px 3px rgba(0,0,0,.06)",
  };

  const listHeader = {
    padding: "12px 16px",
    fontWeight: 700,
    borderBottom: "1px solid #f1f5f9",
  };

  const row = {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) 140px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: "12px 16px",
    borderTop: "1px solid #f8fafc",
  };

  const merchant = { fontWeight: 700 };
  const note = { color: "#6b7280", fontSize: 13 };
  const amount = { fontWeight: 800, textAlign: "right" };

  return (
    <div style={page}>
      {/* Header */}
      <div style={header}>
        <h1 style={title}>Spending</h1>
        <div style={{ fontSize: 14 }}>
          <span style={{ color: "#6b7280", marginRight: 8 }}>Total this month:</span>
          <span style={pill}>-{currency(total)}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div style={toolbar}>
        <input
          style={input}
          placeholder="Search merchant, note, or category…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select style={select} value={month} onChange={(e) => setMonth(e.target.value)}>
          {allMonths.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select style={select} value={cat} onChange={(e) => setCat(e.target.value)}>
          {allCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select style={select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="amount-high">Amount: High → Low</option>
          <option value="amount-low">Amount: Low → High</option>
        </select>
      </div>

      {/* List */}
      <div style={card}>
        <div style={listHeader}>Transactions</div>
        {filtered.length === 0 ? (
          <div style={{ padding: 16, color: "#9ca3af" }}>No transactions match your filters.</div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} style={row}>
              <div>
                <div style={merchant}>{t.merchant}</div>
                {t.note ? <div style={note}>{t.note}</div> : <div style={note}>{t.category}</div>}
              </div>
              <div style={{ color: "#6b7280" }}>{formatDate(t.date)}</div>
              <div>
                <span
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {t.category}
                </span>
              </div>
              <div style={amount}>-{currency(t.amount)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
