import React, { useEffect, useMemo, useState } from "react";
import { useMonth } from "./state/MonthContext";
import { getTransactions } from "./api/client";

const currency = (n) =>
  Math.abs(n).toLocaleString(undefined, { style: "currency", currency: "USD" });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const monthKeyOf = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short" }) + " " + d.getFullYear();
};

export default function TransactionPage() {
  const monthCtx = useMonth?.() || { month: "", setMonth: () => {}, months: [] };
  const { month, setMonth, months } = monthCtx;

  const [allTx, setAllTx] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [localMonth, setLocalMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const token = localStorage.getItem("finGoal_token");

  useEffect(() => {
    if (!token) {
      setErrMsg("Please log in to view your transactions.");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setErrMsg("");
        const raw = await getTransactions(); // must return 200 with data
        const normalized = raw.map((r) => ({
          id: r._id || r.id,
          date: r.date,
          merchant: r.description || "",
          category: r.category || "Uncategorized",
          amount: Math.abs(Number(r.amount || 0)),
          type: Number(r.amount) < 0 ? "outcome" : "income",
        }));
        setAllTx(normalized);

        const uniqMonths = Array.from(
          new Set(normalized.map((t) => monthKeyOf(t.date)))
        ).sort((a, b) => new Date("1 " + b) - new Date("1 " + a));

        if (!months.length && uniqMonths.length) {
          setLocalMonth((m) => m || uniqMonths[0]);
        } else if (months.length && !month && uniqMonths.length) {
          setMonth?.(uniqMonths[0]);
        }
      } catch (e) {
        // Axios error: e.response?.status
        if (e?.response?.status === 401) {
          setErrMsg("Session expired or not logged in. Please log in.");
          localStorage.removeItem("finGoal_token");
          localStorage.removeItem("finGoal_name");
        } else {
          setErrMsg("Failed to load transactions. Please try again.");
        }
        console.error("getTransactions failed:", e?.response?.status, e?.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const monthsLocal = useMemo(() => {
    const keys = Array.from(new Set(allTx.map((t) => monthKeyOf(t.date))));
    return keys.sort((a, b) => new Date("1 " + b) - new Date("1 " + a));
  }, [allTx]);

  const effectiveMonths = months.length ? months : monthsLocal;
  const selectedMonth = months.length
    ? (month || effectiveMonths[0] || "")
    : (localMonth || effectiveMonths[0] || "");
  const setSelectedMonth = months.length ? setMonth : setLocalMonth;

  const baseRows = useMemo(() => {
    if (!selectedMonth) return [];
    return allTx.filter((t) => monthKeyOf(t.date) === selectedMonth);
  }, [allTx, selectedMonth]);

  const allCategories = useMemo(
    () => ["All", ...new Set(baseRows.filter((r) => r.type === "outcome").map((r) => r.category))],
    [baseRows]
  );

  const { filtered, totalOutcome } = useMemo(() => {
    let rows = baseRows.filter((r) => r.type === "outcome");
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      rows = rows.filter(
        (r) => r.merchant.toLowerCase().includes(t) || r.category.toLowerCase().includes(t)
      );
    }
    if (cat !== "All") rows = rows.filter((r) => r.category === cat);

    switch (sortBy) {
      case "oldest": rows.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case "amount-high": rows.sort((a, b) => b.amount - a.amount); break;
      case "amount-low": rows.sort((a, b) => a.amount - b.amount); break;
      default: rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    const totalOutcome = rows.reduce((s, r) => s + r.amount, 0);
    return { filtered: rows, totalOutcome };
  }, [baseRows, q, cat, sortBy]);

  const page = { padding: 20, maxWidth: 1100, margin: "0 auto" };
  const title = { fontSize: 28, fontWeight: 800, margin: 0 };

  if (!token) {
    return (
      <div style={page}>
        <h1 style={title}>Spending</h1>
        <p>Please <a href="/login">log in</a> to view transactions.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={page}>
        <h1 style={title}>Spending</h1>
        <p>Loading transactions…</p>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div style={page}>
        <h1 style={title}>Spending</h1>
        <p style={{ color: "#b91c1c" }}>{errMsg}</p>
      </div>
    );
  }

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

  // … keep your existing JSX list UI below (unchanged) …
  // (You can keep the rest of your component body as-is from your message)
}
