import {
  getTransactions as apiGetTransactions,
  uploadStatement as apiUpload,
} from "../api/client";

let _cache = [];                // normalized transactions
let _primed = false;

const hasToken = () => !!localStorage.getItem("finGoal_token");

// ----- helpers -----
const monthKeyOf = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short" }) + " " + d.getFullYear(); // e.g. "Oct 2025"
};

const normalize = (r) => ({
  id: r._id,
  date: r.date,
  merchant: r.description || "",
  category: r.category || "Uncategorized",
  // in DB: amount > 0 income, amount < 0 expense
  amount: Math.abs(Number(r.amount || 0)), // positive magnitude for UI
  rawAmount: Number(r.amount || 0),        // signed value for logic
  type: Number(r.amount) < 0 ? "outcome" : "income",
});

// ----- load once -----
// export async function primeTxStore(force = false) {
//   if (!_primed || force) {
//     const raw = await apiGetTransactions();       // [{_id, date, description, amount, category}]
//     _cache = raw.map(normalize);
//     _primed = true;
//   }
//   return _cache;
// }

export async function primeTxStore() {
  if (!hasToken()) return;              // <- IMPORTANT: skip for guests
  try {
    const rows = await apiGetTransactions();
    // ... your existing normalization / set state here ...
    return rows;
  } catch (e) {
    // Swallow 401 so the dev overlay doesn’t keep flashing
    if (e?.response?.status !== 401) console.warn("primeTxStore:", e);
  }
}

/**
 * Upload statement - also guard unauthenticated access.
 */
export async function uploadFromFile(file) {
  if (!hasToken()) throw new Error("Not signed in");
  try {
    const data = await apiUpload(file);
    // … merge into store …
    return data;
  } catch (e) {
    if (e?.response?.status === 401) {
      // optional: clear broken token
      localStorage.removeItem("finGoal_token");
      localStorage.removeItem("finGoal_name");
    }
    throw e;
  }
}

// ----- sync getters (use after primeTxStore has run) -----
export function getMonths() {
  const keys = Array.from(new Set(_cache.map(t => monthKeyOf(t.date))));
  return keys.sort((a, b) => new Date("1 " + b) - new Date("1 " + a)); // desc
}

export function getTransactionsByMonth(mk) {
  return _cache.filter(t => monthKeyOf(t.date) === mk);
}

export function getSummaryByMonth(mk) {
  const rows = getTransactionsByMonth(mk);
  const income = rows.filter(r => r.type === "income");
  const outcome = rows.filter(r => r.type === "outcome");

  const totalIncome = income.reduce((s, r) => s + r.amount, 0);
  const totalOutcome = outcome.reduce((s, r) => s + r.amount, 0); // note: amount is magnitude
  const net = income.reduce((s, r) => s + r.rawAmount, 0) + outcome.reduce((s, r) => s + r.rawAmount, 0);

  const by = (items) => {
    const m = new Map();
    for (const r of items) m.set(r.category, (m.get(r.category) || 0) + r.amount);
    return [...m.entries()].map(([label, amount]) => ({ label, amount }));
  };

  return {
    totalIncome,
    totalOutcome,
    net,
    incomeBreakdown: by(income),
    outcomeBreakdown: by(outcome),
  };
}

export function getNetForMonth(mk) {
  return getSummaryByMonth(mk).net;
}

// Optional: keep the same API your Home CSV uploader used.
// If you wired a backend upload route, call it, then re-prime.
export async function importCSVFile(file) {
  const res = await apiUpload(file);       // expects { inserted: N }
  await primeTxStore(true);                // refresh cache
  return res.inserted || 0;
}