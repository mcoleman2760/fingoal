import React, { useEffect, useMemo, useState } from "react";
import { useMonth } from "./state/MonthContext";            // keep using shared month if available
import { getTransactions } from "./api/client";             // <-- NEW: backend API

const currency = (n) =>
  Math.abs(n).toLocaleString(undefined, { style: "currency", currency: "USD" });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// e.g., "Oct 2025"
const monthKeyOf = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short" }) + " " + d.getFullYear();
};

export default function TransactionPage() {
  // Shared month context (may be empty if not populated elsewhere)
  const monthCtx = useMonth?.() || { month: "", setMonth: () => {}, months: [] };
  const { month, setMonth, months } = monthCtx;

  // Local state fed by backend
  const [allTx, setAllTx] = useState([]);            // normalized txs for UI
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // If MonthContext isn't populated, we maintain a local month pick
  const [localMonth, setLocalMonth] = useState("");

  // Fetch from backend once
  useEffect(() => {
    (async () => {
      try {
        const raw = await getTransactions(); // [{ _id, date, description, amount, category }...]
        // Normalize to the shape your UI expects
        const normalized = raw.map((r) => ({
          id: r._id,
          date: r.date,
          merchant: r.description || "",
          category: r.category || "Uncategorized",
          amount: Math.abs(Number(r.amount || 0)),      // UI expects positive for spending display
          type: Number(r.amount) < 0 ? "outcome" : "income",
        }));
        setAllTx(normalized);

        // Initialize month selection if needed
        const uniqMonths = Array.from(
          new Set(normalized.map((t) => monthKeyOf(t.date)))
        ).sort((a, b) => {
          // sort desc by date
          const parse = (mk) => new Date("1 " + mk).getTime();
          return parse(b) - parse(a);
        });

        if (!months.length && uniqMonths.length) {
          // Use local month system
          setLocalMonth((m) => m || uniqMonths[0]);
        } else if (months.length && !month && uniqMonths.length) {
          // If context exists but month not set yet
          setMonth?.(uniqMonths[0]);
        }
      } catch (e) {
        console.error("Failed to load transactions:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine which month list to show: context or local fallback
  const monthsLocal = useMemo(() => {
    const keys = Array.from(new Set(allTx.map((t) => monthKeyOf(t.date))));
    return keys.sort((a, b) => {
      const parse = (mk) => new Date("1 " + mk).getTime();
      return parse(b) - parse(a);
    });
  }, [allTx]);

  const effectiveMonths = months.length ? months : monthsLocal;
  const selectedMonth = months.length ? (month || effectiveMonths[0] || "") : (localMonth || effectiveMonths[0] || "");
  const setSelectedMonth = months.length ? setMonth : setLocalMonth;

  // Base rows filtered by selected month
  const baseRows = useMemo(() => {
    if (!selectedMonth) return [];
    return allTx.filter((t) => monthKeyOf(t.date) === selectedMonth);
  }, [allTx, selectedMonth]);

  // Categories from outcomes in the selected month
  const allCategories = useMemo(
    () => ["All", ...new Set(baseRows.filter((r) => r.type === "outcome").map((r) => r.category))],
    [baseRows]
  );

  // Apply search/category/sort
  const { filtered, totalOutcome } = useMemo(() => {
    let rows = baseRows.filter((r) => r.type === "outcome"); // show spending only
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.merchant.toLowerCase().includes(t) ||
          r.category.toLowerCase().includes(t)
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
      default:
        rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const totalOutcome = rows.reduce((s, r) => s + r.amount, 0);
    return { filtered: rows, totalOutcome };
  }, [baseRows, q, cat, sortBy]);

  // ---------- Styles (unchanged) ----------
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

  // ---------- Empty states ----------
  if (!effectiveMonths.length) {
    return (
      <div style={page}>
        <h1 style={title}>Spending</h1>
        <p style={{ color: "#6b7280" }}>
          No transactions found. Upload a statement on <b>Home → Upload Statements</b>.
        </p>
      </div>
    );
  }

  return (
    <div style={page}>
      {/* Header */}
      <div style={header}>
        <h1 style={title}>Spending</h1>
        <div style={{ fontSize: 14 }}>
          <span style={{ color: "#6b7280", marginRight: 8 }}>
            Total spending this month:
          </span>
          <span style={pill}>-{currency(totalOutcome)}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div style={toolbar}>
        <input
          style={input}
          placeholder="Search merchant or category…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          style={select}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {effectiveMonths.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select style={select} value={cat} onChange={(e) => setCat(e.target.value)}>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
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
          <div style={{ padding: 16, color: "#9ca3af" }}>
            No transactions match your filters.
          </div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} style={row}>
              <div>
                <div style={merchant}>{t.merchant}</div>
                <div style={note}>{t.category}</div>
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
