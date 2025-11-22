

// import React, { useEffect, useMemo, useState } from "react";
// import { useMonth } from "./state/MonthContext";
// import { getTransactions } from "./api/client";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const CATEGORY_OVERRIDES_KEY = "txCategoryOverrides";

// // Simple formatter: $1,234.56
// const currency = (n) =>
//   Math.abs(n).toLocaleString(undefined, {
//     style: "currency",
//     currency: "USD",
//   });

// const formatDate = (iso) =>
//   new Date(iso).toLocaleDateString(undefined, {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });

// const monthKeyOf = (iso) => {
//   const d = new Date(iso);
//   return (
//     d.toLocaleString(undefined, { month: "short" }) +
//     " " +
//     d.getFullYear()
//   ); // e.g., "Oct 2025"
// };

// // ---------- Auto-categorization rules ----------
// const CATEGORY_RULES = [
//   { pattern: /MTA|NYCT|SUBWAY|METROCARD|CITIBIK/i, category: "Transportation" },
//   { pattern: /UBER|LYFT|TAXI/i, category: "Transportation" },
//   { pattern: /GAS|EXXON|SHELL|BP /i, category: "Transportation" },

//   {
//     pattern: /TRADER JOE|WHOLE FOODS|MART|GROCERY|SUPERMARKET|FOOD EMPORIUM/i,
//     category: "Groceries",
//   },
//   {
//     pattern: /RESTAURANT|BAR|CAFE|STARBUCKS|DUNKIN|COFFEE/i,
//     category: "Dining",
//   },

//   { pattern: /RENT|APARTMENT|MANAGEMENT|REALTY/i, category: "Housing" },
//   {
//     pattern: /CON EDISON|ELECTRIC|UTILITY|WATER BILL|GAS BILL/i,
//     category: "Utilities",
//   },

//   {
//     pattern: /NETFLIX|SPOTIFY|YOUTUBE|OPENAI|CHATGPT|SUBSCR|HULU|DISNEY/i,
//     category: "Subscriptions",
//   },

//   {
//     pattern: /FITNESS|GYM|PLANET FITNESS|CLUB FITNESS/i,
//     category: "Health & Fitness",
//   },
//   { pattern: /PHARMACY|CVS|WALGREENS|RITE AID/i, category: "Health" },

//   { pattern: /AMAZON/i, category: "Shopping" },

//   {
//     pattern: /TUITION|SCHOOL|UNIVERSITY|COLLEGE|CUNY|COURSE/i,
//     category: "Education",
//   },
// ];

// function autoCategory(merchant, existingCategory) {
//   const current = (existingCategory || "").trim();
//   if (current && current !== "Uncategorized") return current;

//   const name = (merchant || "").toUpperCase();
//   for (const rule of CATEGORY_RULES) {
//     if (rule.pattern.test(name)) return rule.category;
//   }
//   return "Uncategorized";
// }

// // LocalStorage helpers for manual overrides
// function loadCategoryOverrides() {
//   try {
//     const raw = localStorage.getItem(CATEGORY_OVERRIDES_KEY);
//     return raw ? JSON.parse(raw) : {};
//   } catch {
//     return {};
//   }
// }

// function saveCategoryOverrides(obj) {
//   try {
//     localStorage.setItem(CATEGORY_OVERRIDES_KEY, JSON.stringify(obj));
//   } catch {
//     // ignore
//   }
// }

// const PIE_COLORS = [
//   "#2563eb",
//   "#16a34a",
//   "#f97316",
//   "#a855f7",
//   "#ef4444",
//   "#0ea5e9",
//   "#22c55e",
//   "#eab308",
// ];

// // Label renderer for the pie: show percentage (e.g., "23%")
// const renderPercentLabel = ({ percent }) =>
//   `${(percent * 100).toFixed(0)}%`;

// export default function TransactionPage() {
//   const monthCtx = useMonth?.() || { month: "", setMonth: () => {}, months: [] };
//   const { month, setMonth, months } = monthCtx;

//   const [allTx, setAllTx] = useState([]);
//   const [q, setQ] = useState("");
//   const [cat, setCat] = useState("All");
//   const [sortBy, setSortBy] = useState("newest");
//   const [localMonth, setLocalMonth] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [errMsg, setErrMsg] = useState("");

//   const [categoryOverrides, setCategoryOverrides] = useState(
//     () => loadCategoryOverrides()
//   );

//   useEffect(() => {
//     saveCategoryOverrides(categoryOverrides);
//   }, [categoryOverrides]);

//   const token = localStorage.getItem("finGoal_token");

//   useEffect(() => {
//     if (!token) {
//       setErrMsg("Please log in to view your transactions.");
//       return;
//     }

//     (async () => {
//       try {
//         setLoading(true);
//         setErrMsg("");

//         const raw = await getTransactions();

//         const normalized = (Array.isArray(raw) ? raw : [])
//           .map((r) => ({
//             id: r._id || r.id,
//             date: r.date,
//             merchant: r.description || r.memo || r.name || "",
//             category: r.category || "Uncategorized",
//             amount: Math.abs(Number(r.amount || 0)),
//             type: Number(r.amount) < 0 ? "outcome" : "income",
//           }))
//           .filter((t) => !!t.date);

//         setAllTx(normalized);

//         const uniqMonths = Array.from(
//           new Set(normalized.map((t) => monthKeyOf(t.date)))
//         ).sort((a, b) => new Date("1 " + b) - new Date("1 " + a));

//         if (!months.length && uniqMonths.length) {
//           setLocalMonth((m) => m || uniqMonths[0]);
//         } else if (months.length && !month && uniqMonths.length) {
//           setMonth?.(uniqMonths[0]);
//         }
//       } catch (e) {
//         if (e?.response?.status === 401) {
//           setErrMsg("Session expired or not logged in. Please log in.");
//           localStorage.removeItem("finGoal_token");
//           localStorage.removeItem("finGoal_name");
//         } else {
//           setErrMsg("Failed to load transactions. Please try again.");
//         }
//         console.error(
//           "getTransactions failed:",
//           e?.response?.status,
//           e?.message
//         );
//       } finally {
//         setLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   const monthsLocal = useMemo(() => {
//     const keys = Array.from(new Set(allTx.map((t) => monthKeyOf(t.date))));
//     return keys.sort((a, b) => new Date("1 " + b) - new Date("1 " + a));
//   }, [allTx]);

//   const effectiveMonths = months.length ? months : monthsLocal;
//   const selectedMonth = months.length
//     ? month || effectiveMonths[0] || ""
//     : localMonth || effectiveMonths[0] || "";
//   const setSelectedMonth = months.length ? setMonth : setLocalMonth;

//   // Apply month filter + auto-category + manual overrides
//   const baseRows = useMemo(() => {
//     if (!selectedMonth) return [];
//     return allTx
//       .filter((t) => monthKeyOf(t.date) === selectedMonth)
//       .map((t) => {
//         const autoCat = autoCategory(t.merchant, t.category);
//         const override = categoryOverrides[t.id];
//         const finalCategory = override || autoCat;
//         return { ...t, category: finalCategory };
//       });
//   }, [allTx, selectedMonth, categoryOverrides]);

//   const allCategories = useMemo(() => {
//     const cats = new Set(
//       baseRows.filter((r) => r.type === "outcome").map((r) => r.category)
//     );
//     return ["All", ...Array.from(cats)];
//   }, [baseRows]);

//   const { filtered, totalOutcome } = useMemo(() => {
//     let rows = baseRows.filter((r) => r.type === "outcome");

//     if (q.trim()) {
//       const t = q.trim().toLowerCase();
//       rows = rows.filter(
//         (r) =>
//           r.merchant.toLowerCase().includes(t) ||
//           r.category.toLowerCase().includes(t)
//       );
//     }
//     if (cat !== "All") rows = rows.filter((r) => r.category === cat);

//     switch (sortBy) {
//       case "oldest":
//         rows.sort((a, b) => new Date(a.date) - new Date(b.date));
//         break;
//       case "amount-high":
//         rows.sort((a, b) => b.amount - a.amount);
//         break;
//       case "amount-low":
//         rows.sort((a, b) => a.amount - b.amount);
//         break;
//       default:
//         rows.sort((a, b) => new Date(b.date) - new Date(a.date));
//     }

//     const totalOutcome = rows.reduce((s, r) => s + r.amount, 0);
//     return { filtered: rows, totalOutcome };
//   }, [baseRows, q, cat, sortBy]);

//   // Pie chart data: totals by category for ALL spending in the month
//   const pieData = useMemo(() => {
//     const map = new Map();
//     for (const r of baseRows) {
//       if (r.type !== "outcome") continue;
//       const current = map.get(r.category) || 0;
//       map.set(r.category, current + r.amount);
//     }
//     return Array.from(map.entries()).map(([name, value]) => ({
//       name,
//       value,
//     }));
//   }, [baseRows]);

//   // Total + ranking from pieData
//   const totalForPie = useMemo(
//     () => pieData.reduce((s, d) => s + d.value, 0),
//     [pieData]
//   );
//   const rankedCategories = useMemo(
//     () => [...pieData].sort((a, b) => b.value - a.value),
//     [pieData]
//   );

//   function handleCategoryChange(txId, newCategory) {
//     setCategoryOverrides((prev) => ({
//       ...prev,
//       [txId]: newCategory,
//     }));
//   }

//   // ---------------- Render ----------------
//   const page = { padding: 20, maxWidth: 1100, margin: "0 auto" };
//   const title = { fontSize: 28, fontWeight: 800, margin: 0 };

//   if (!token) {
//     return (
//       <div style={page}>
//         <h1 style={title}>Spending</h1>
//         <p>
//           Please <a href="/login">log in</a> to view transactions.
//         </p>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div style={page}>
//         <h1 style={title}>Spending</h1>
//         <p>Loading transactions…</p>
//       </div>
//     );
//   }

//   if (errMsg) {
//     return (
//       <div style={page}>
//         <h1 style={title}>Spending</h1>
//         <p style={{ color: "#b91c1c" }}>{errMsg}</p>
//       </div>
//     );
//   }

//   if (!effectiveMonths.length) {
//     return (
//       <div style={page}>
//         <h1 style={title}>Spending</h1>
//         <p style={{ color: "#6b7280" }}>
//           No transactions found. Upload a statement on{" "}
//           <b>Home → Upload Statements</b>.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div style={page}>
//       <h1 style={title}>Spending</h1>

//       {/* Controls */}
//       <div
//         style={{
//           display: "flex",
//           gap: 12,
//           alignItems: "center",
//           margin: "12px 0 20px",
//           flexWrap: "wrap",
//         }}
//       >
//         <label>
//           Month:&nbsp;
//           <select
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(e.target.value)}
//           >
//             {effectiveMonths.map((m) => (
//               <option key={m} value={m}>
//                 {m}
//               </option>
//             ))}
//           </select>
//         </label>

//         <input
//           placeholder="Search merchant or category"
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//           style={{ flex: 1, minWidth: 180 }}
//         />

//         <label>
//           Category:&nbsp;
//           <select value={cat} onChange={(e) => setCat(e.target.value)}>
//             {allCategories.map((c) => (
//               <option key={c} value={c}>
//                 {c}
//               </option>
//             ))}
//           </select>
//         </label>

//         <label>
//           Sort:&nbsp;
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//           >
//             <option value="newest">Newest</option>
//             <option value="oldest">Oldest</option>
//             <option value="amount-high">Amount (high → low)</option>
//             <option value="amount-low">Amount (low → high)</option>
//           </select>
//         </label>
//       </div>

//       {/* Summary + Pie chart + Ranking */}
//       <div
//         style={{
//           display: "flex",
//           gap: 24,
//           alignItems: "stretch",
//           marginBottom: 20,
//           flexWrap: "wrap",
//         }}
//       >
//         {/* LEFT: total + ranking */}
//         <div style={{ minWidth: 260 }}>
//           <div>
//             <b>Total spending:</b> {currency(totalOutcome)}
//           </div>

//           <div
//             style={{
//               marginTop: 10,
//               fontSize: 14,
//               color: "#374151",
//             }}
//           >
//             <div
//               style={{
//                 fontWeight: 700,
//                 marginBottom: 4,
//               }}
//             >
//               Category ranking
//             </div>
//             {rankedCategories.length === 0 ? (
//               <div style={{ fontSize: 13, color: "#6b7280" }}>
//                 No spending yet for this month.
//               </div>
//             ) : (
//               <ol
//                 style={{
//                   paddingLeft: 18,
//                   margin: 0,
//                   listStylePosition: "inside",
//                 }}
//               >
//                 {rankedCategories.map((d, idx) => {
//                   const pct = totalForPie
//                     ? (d.value / totalForPie) * 100
//                     : 0;
//                   return (
//                     <li
//                       key={d.name}
//                       style={{
//                         marginBottom: 2,
//                       }}
//                     >
//                       #{idx + 1} {d.name}: {currency(d.value)} (
//                       {pct.toFixed(1)}%)
//                     </li>
//                   );
//                 })}
//               </ol>
//             )}
//           </div>
//         </div>

//         {/* RIGHT: pie chart */}
//         {pieData.length > 0 && (
//           <div
//             style={{
//               flex: 1,
//               minWidth: 260,
//               height: 260,
//               background: "#fff",
//               borderRadius: 12,
//               border: "1px solid #e5e7eb",
//               padding: 8,
//             }}
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   dataKey="value"
//                   nameKey="name"
//                   outerRadius={90}
//                   label={renderPercentLabel}
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${entry.name}-${index}`}
//                       fill={PIE_COLORS[index % PIE_COLORS.length]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   formatter={(value, name, props) => {
//                     const pct = (props?.percent || 0) * 100;
//                     return `${currency(value)} (${pct.toFixed(1)}%)`;
//                   }}
//                 />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </div>

//       {/* Category suggestions for typing */}
//       <datalist id="category-suggestions">
//         {allCategories
//           .filter((c) => c !== "All")
//           .map((c) => (
//             <option key={c} value={c} />
//           ))}
//       </datalist>

//       {/* List */}
//       {filtered.length === 0 ? (
//         <div style={{ color: "#6b7280" }}>
//           No spending found for <b>{selectedMonth}</b>
//           {q ? <> matching “{q}”</> : null}
//           {cat !== "All" ? <> in category “{cat}”</> : null}.
//         </div>
//       ) : (
//         <div
//           style={{
//             border: "1px solid #e5e7eb",
//             borderRadius: 8,
//             overflow: "hidden",
//             background: "#fff",
//           }}
//         >
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "140px 1fr 220px 120px",
//               fontWeight: 600,
//               padding: "10px 12px",
//               background: "#f3f4f6",
//             }}
//           >
//             <div>Date</div>
//             <div>Merchant</div>
//             <div>Category (editable)</div>
//             <div style={{ textAlign: "right" }}>Amount</div>
//           </div>

//           {filtered.map((r) => (
//             <div
//               key={r.id || r.date + r.merchant + r.amount}
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "140px 1fr 220px 120px",
//                 padding: "10px 12px",
//                 borderTop: "1px solid #f3f4f6",
//                 background: "#fff",
//               }}
//             >
//               <div>{formatDate(r.date)}</div>
//               <div>{r.merchant}</div>
//               <div>
//                 <input
//                   type="text"
//                   value={r.category}
//                   onChange={(e) =>
//                     handleCategoryChange(r.id, e.target.value)
//                   }
//                   list="category-suggestions"
//                   style={{ width: "100%" }}
//                 />
//               </div>
//               <div style={{ textAlign: "right", color: "#b91c1c" }}>
//                 -{currency(r.amount)}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useMonth } from "./state/MonthContext";
import { getTransactions } from "./api/client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CATEGORY_OVERRIDES_KEY = "txCategoryOverrides";

// Simple formatter: $1,234.56
const currency = (n) =>
  Math.abs(n).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const monthKeyOf = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleString(undefined, { month: "short" }) +
    " " +
    d.getFullYear()
  ); // e.g., "Oct 2025"
};

// ---------- Auto-categorization rules ----------
const CATEGORY_RULES = [
  { pattern: /MTA|NYCT|SUBWAY|METROCARD|CITIBIK/i, category: "Transportation" },
  { pattern: /UBER|LYFT|TAXI/i, category: "Transportation" },
  { pattern: /GAS|EXXON|SHELL|BP /i, category: "Transportation" },

  {
    pattern: /TRADER JOE|WHOLE FOODS|MART|GROCERY|SUPERMARKET|FOOD EMPORIUM/i,
    category: "Groceries",
  },
  {
    pattern: /RESTAURANT|BAR|CAFE|STARBUCKS|DUNKIN|COFFEE/i,
    category: "Dining",
  },

  { pattern: /RENT|APARTMENT|MANAGEMENT|REALTY/i, category: "Housing" },
  {
    pattern: /CON EDISON|ELECTRIC|UTILITY|WATER BILL|GAS BILL/i,
    category: "Utilities",
  },

  {
    pattern: /NETFLIX|SPOTIFY|YOUTUBE|OPENAI|CHATGPT|SUBSCR|HULU|DISNEY/i,
    category: "Subscriptions",
  },

  {
    pattern: /FITNESS|GYM|PLANET FITNESS|CLUB FITNESS/i,
    category: "Health & Fitness",
  },
  { pattern: /PHARMACY|CVS|WALGREENS|RITE AID/i, category: "Health" },

  { pattern: /AMAZON/i, category: "Shopping" },

  {
    pattern: /TUITION|SCHOOL|UNIVERSITY|COLLEGE|CUNY|COURSE/i,
    category: "Education",
  },
];

function autoCategory(merchant, existingCategory) {
  const current = (existingCategory || "").trim();
  if (current && current !== "Uncategorized") return current;

  const name = (merchant || "").toUpperCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(name)) return rule.category;
  }
  return "Uncategorized";
}

// LocalStorage helpers for manual overrides
function loadCategoryOverrides() {
  try {
    const raw = localStorage.getItem(CATEGORY_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCategoryOverrides(obj) {
  try {
    localStorage.setItem(CATEGORY_OVERRIDES_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#0ea5e9",
  "#22c55e",
  "#eab308",
];

// Label renderer for the pie: show percentage (e.g., "23%")
const renderPercentLabel = ({ percent }) =>
  `${(percent * 100).toFixed(0)}%`;

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

  // Saved overrides (used for calculations)
  const [categoryOverrides, setCategoryOverrides] = useState(
    () => loadCategoryOverrides()
  );
  // Draft overrides (used for inputs; applied only when hitting "Apply")
  const [pendingOverrides, setPendingOverrides] = useState(
    () => loadCategoryOverrides()
  );

  useEffect(() => {
    // whenever saved overrides change, persist and sync drafts
    saveCategoryOverrides(categoryOverrides);
    setPendingOverrides(categoryOverrides);
  }, [categoryOverrides]);

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

        const raw = await getTransactions();

        const normalized = (Array.isArray(raw) ? raw : [])
          .map((r) => ({
            id: r._id || r.id,
            date: r.date,
            merchant: r.description || r.memo || r.name || "",
            category: r.category || "Uncategorized",
            amount: Math.abs(Number(r.amount || 0)),
            type: Number(r.amount) < 0 ? "outcome" : "income",
          }))
          .filter((t) => !!t.date);

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
        if (e?.response?.status === 401) {
          setErrMsg("Session expired or not logged in. Please log in.");
          localStorage.removeItem("finGoal_token");
          localStorage.removeItem("finGoal_name");
        } else {
          setErrMsg("Failed to load transactions. Please try again.");
        }
        console.error(
          "getTransactions failed:",
          e?.response?.status,
          e?.message
        );
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
    ? month || effectiveMonths[0] || ""
    : localMonth || effectiveMonths[0] || "";
  const setSelectedMonth = months.length ? setMonth : setLocalMonth;

  // Apply month filter + auto-category + SAVED overrides
  const baseRows = useMemo(() => {
    if (!selectedMonth) return [];
    return allTx
      .filter((t) => monthKeyOf(t.date) === selectedMonth)
      .map((t) => {
        const autoCat = autoCategory(t.merchant, t.category);
        const override = categoryOverrides[t.id];
        const finalCategory = override || autoCat;
        return { ...t, category: finalCategory };
      });
  }, [allTx, selectedMonth, categoryOverrides]);

  const allCategories = useMemo(() => {
    const cats = new Set(
      baseRows.filter((r) => r.type === "outcome").map((r) => r.category)
    );
    return ["All", ...Array.from(cats)];
  }, [baseRows]);

  const { filtered, totalOutcome } = useMemo(() => {
    let rows = baseRows.filter((r) => r.type === "outcome");

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

  // Pie chart data: totals by category for ALL spending in the month
  const pieData = useMemo(() => {
    const map = new Map();
    for (const r of baseRows) {
      if (r.type !== "outcome") continue;
      const current = map.get(r.category) || 0;
      map.set(r.category, current + r.amount);
    }
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [baseRows]);

  // Total + ranking from pieData
  const totalForPie = useMemo(
    () => pieData.reduce((s, d) => s + d.value, 0),
    [pieData]
  );
  const rankedCategories = useMemo(
    () => [...pieData].sort((a, b) => b.value - a.value),
    [pieData]
  );

  // Map category -> color (same as pie slices)
  const categoryColorMap = useMemo(() => {
    const m = {};
    pieData.forEach((d, i) => {
      m[d.name] = PIE_COLORS[i % PIE_COLORS.length];
    });
    return m;
  }, [pieData]);

  // change draft, not saved
  function handlePendingCategoryChange(txId, newCategory) {
    setPendingOverrides((prev) => ({
      ...prev,
      [txId]: newCategory,
    }));
  }

  function applyCategoryChanges() {
    setCategoryOverrides(pendingOverrides);
  }

  // ---------------- Render ----------------
  const page = { padding: 20, maxWidth: 1100, margin: "0 auto" };
  const title = { fontSize: 28, fontWeight: 800, margin: 0 };

  if (!token) {
    return (
      <div style={page}>
        <h1 style={title}>Spending</h1>
        <p>
          Please <a href="/login">log in</a> to view transactions.
        </p>
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
          No transactions found. Upload a statement on{" "}
          <b>Home → Upload Statements</b>.
        </p>
      </div>
    );
  }

  return (
    <div style={page}>
      <h1 style={title}>Spending</h1>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          margin: "12px 0 12px",
          flexWrap: "wrap",
        }}
      >
        <label>
          Month:&nbsp;
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {effectiveMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <input
          placeholder="Search merchant or category"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 180 }}
        />

        <label>
          Category:&nbsp;
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort:&nbsp;
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="amount-high">Amount (high → low)</option>
            <option value="amount-low">Amount (low → high)</option>
          </select>
        </label>
      </div>

      {/* Apply button for category edits */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={applyCategoryChanges}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #2563eb",
            background: "#2563eb",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Apply category changes
        </button>
      </div>

      {/* Summary + Pie chart + Ranking */}
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "stretch",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* LEFT: total + ranking */}
        <div style={{ minWidth: 260 }}>
          <div>
            <b>Total spending:</b> {currency(totalOutcome)}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 14,
              color: "#374151",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Category ranking
            </div>
            {rankedCategories.length === 0 ? (
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                No spending yet for this month.
              </div>
            ) : (
              <ol
                style={{
                  paddingLeft: 18,
                  margin: 0,
                  listStylePosition: "inside",
                }}
              >
                {rankedCategories.map((d) => {
                  const pct = totalForPie
                    ? (d.value / totalForPie) * 100
                    : 0;
                  const color =
                    categoryColorMap[d.name] || "#111827"; // fallback gray
                  return (
                    <li
                      key={d.name}
                      style={{
                        marginBottom: 2,
                      }}
                    >
                      <span style={{ color, fontWeight: 600 }}>
                        {d.name}
                      </span>
                      : {currency(d.value)} ({pct.toFixed(1)}%)
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        {/* RIGHT: pie chart */}
        {pieData.length > 0 && (
          <div
            style={{
              flex: 1,
              minWidth: 260,
              height: 260,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: 8,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={renderPercentLabel}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const pct = (props?.percent || 0) * 100;
                    return `${currency(value)} (${pct.toFixed(1)}%)`;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category suggestions for typing */}
      <datalist id="category-suggestions">
        {allCategories
          .filter((c) => c !== "All")
          .map((c) => (
            <option key={c} value={c} />
          ))}
      </datalist>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ color: "#6b7280" }}>
          No spending found for <b>{selectedMonth}</b>
          {q ? <> matching “{q}”</> : null}
          {cat !== "All" ? <> in category “{cat}”</> : null}.
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr 220px 120px",
              fontWeight: 600,
              padding: "10px 12px",
              background: "#f3f4f6",
            }}
          >
            <div>Date</div>
            <div>Merchant</div>
            <div>Category (editable)</div>
            <div style={{ textAlign: "right" }}>Amount</div>
          </div>

          {filtered.map((r) => {
            const draftCategory =
              pendingOverrides[r.id] !== undefined
                ? pendingOverrides[r.id]
                : r.category;
            return (
              <div
                key={r.id || r.date + r.merchant + r.amount}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr 220px 120px",
                  padding: "10px 12px",
                  borderTop: "1px solid #f3f4f6",
                  background: "#fff",
                }}
              >
                <div>{formatDate(r.date)}</div>
                <div>{r.merchant}</div>
                <div>
                  <input
                    type="text"
                    value={draftCategory}
                    onChange={(e) =>
                      handlePendingCategoryChange(r.id, e.target.value)
                    }
                    list="category-suggestions"
                    style={{ width: "100%" }}
                  />
                </div>
                <div style={{ textAlign: "right", color: "#b91c1c" }}>
                  -{currency(r.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
