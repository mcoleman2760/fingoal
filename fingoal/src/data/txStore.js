// // src/data/txStore.js
// import Papa from "papaparse";

// // --- add these helpers near the top of txStore.js ---

// function parseAmount(raw) {
//     // Handles: "34.83", "-34.83", "(34.83)", "$34.83", "1,234.56"
//     if (raw == null) return 0;
//     const s = String(raw).trim();
//     const negParen = /^\(.*\)$/.test(s); // (34.83) means negative
//     const clean = s.replace(/[,$()\s]/g, "");
//     const n = Number(clean || 0);
//     return negParen ? -Math.abs(n) : n;
//   }
  
  
//   // Decide income/outcome using explicit columns and description keywords.
//   // If nothing is clear, DEFAULT to "outcome" (spending).
//   function inferType(row, amountNum, descLower) {
//     // columns that might exist in bank CSVs:
//     const t = (row.Type || row["Transaction Type"] || row["CR/DR"] || row["Debit/Credit"] || row["Dr/Cr"] || "").toString().toLowerCase();
  
//     if (t.includes("credit") || t === "cr" || t === "c") return "income";
//     if (t.includes("debit") || t === "dr" || t === "d") return "outcome";
  
//     // Some banks use sign: keep as hint (not all do)
//     if (amountNum < 0) return "income";
//     if (amountNum > 0) {
//       // positive could be either; use keywords
//       if (/(payroll|salary|direct\s*deposit|deposit|paycheck|w-2|stipend|refund|rebate|reimbursement)/.test(descLower)) {
//         return "income";
//       }
//       return "outcome"; // DEFAULT
//     }
//     return "outcome";
//   }
  

// // ---- storage helpers ----
// const LS_KEY = "txStore_v1";

// function load() {
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     return raw ? JSON.parse(raw) : { transactions: [] };
//   } catch {
//     return { transactions: [] };
//   }
// // at top of file
// const STORAGE_KEY = "txStore_v1";

// function save(data) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
//   // Let the app know the store changed (new months may exist)
//   window.dispatchEvent(new Event("txstore:changed"));
// }

// }
// function save(data) {
//   localStorage.setItem(LS_KEY, JSON.stringify(data));
// }

// // ---- categorizer ----
// // returns: { type: "income"|"outcome", category: "..." , label?: "..." }
// function categorize(merchant, amount) {
//   const m = (merchant || "").toLowerCase();

//   // income
//   if (/payroll|salary|direct\s*deposit|paycheck|w-2|stipend/.test(m) || amount > 0 && /deposit/.test(m)) {
//     return { type: "income", category: "Paycheck", label: "Paycheck" };
//   }

//   // subscriptions
//   if (/openai|netflix|spotify|adobe|dribbble|icloud|prime|subscription|subs/.test(m)) {
//     return { type: "outcome", category: "Subscriptions" };
//   }
//   // transport
//   if (/mta|nyct|metro|subway|uber|lyft|paygo|transit/.test(m)) {
//     return { type: "outcome", category: "Transport" };
//   }
//   // groceries / drugstore
//   if (/trader|whole\s*foods|food\s*emporium|h\s*mart|duane\s*reade|cvs|walgreens|market|grocery/.test(m)) {
//     return { type: "outcome", category: "Groceries" };
//   }
//   // dining
//   if (/taqueria|cafe|restaurant|bar\b|chicken|pizza|starbucks|dunkin|chipotle|kitchen|diner/.test(m)) {
//     return { type: "outcome", category: "Dining Out" };
//   }
//   // shopping / amazon
//   if (/amazon|amzn|target|walmart|best\s*buy|apple\s*store/.test(m)) {
//     return { type: "outcome", category: "Shopping" };
//   }
//   // fitness
//   if (/gym|fitness|yoga|peloton/.test(m)) {
//     return { type: "outcome", category: "Fitness" };
//   }
//   // travel
//   if (/delta|air\s*lines|hotel|airbnb|booking|expedia/.test(m)) {
//     return { type: "outcome", category: "Travel" };
//   }
//   // housing (very rough)
//   if (/rent|landlord|management|apt/.test(m)) {
//     return { type: "outcome", category: "Housing" };
//   }

//   // fallback by sign
//   if (amount >= 0) return { type: "income", category: "Other Income" };
//   return { type: "outcome", category: "Other" };
// }

// // ---- parser ----
// // Expecting CSV with headers like: Date, Description (or Merchant), Amount
// // Amount can be signed; if your bank uses separate Credit/Debit columns,
// // compute amount = credit - debit before calling this.
// export async function importCSVFile(file) {
//     const text = await file.text();
//     const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
//     if (parsed.errors?.length) throw new Error(parsed.errors[0].message);
  
//     const rows = parsed.data;
//     const data = load();
//     const newTx = [];
  
//     rows.forEach((r) => {
//       const dateStr =
//         r.Date ||
//         r["Posting Date"] ||
//         r["Transaction Date"] ||
//         r["Date of Transaction"] ||
//         r["date"];
  
//       const desc =
//         r.Description ||
//         r["Merchant Name or Transaction Description"] ||
//         r.Merchant ||
//         r["name"] ||
//         "";
  
//       // Compute a SIGNED amount:
//       //  - If separate Credit/Debit columns exist, amountSigned = credit - debit
//       //  - Else use Amount column (supports minus or parentheses)
//       let amountSigned;
//       if ((r.Credit || r.Debit) && (r.Credit !== "" || r.Debit !== "")) {
//         const credit = parseAmount(r.Credit);
//         const debit  = parseAmount(r.Debit);
//         amountSigned = credit - debit; // credits positive, debits negative
//       } else {
//         amountSigned = parseAmount(r.Amount ?? r["Amount ($)"] ?? r["amount"]);
//       }
  
//       if (!dateStr || isNaN(amountSigned)) return;
  
//       const d = new Date(dateStr);
//       const month = d.toLocaleString(undefined, { month: "long" });
  
//       // SIMPLE RULE: sign decides the type
//       const type = amountSigned >= 0 ? "income" : "outcome";
  
//       // Category: keep your existing categorize() if you have it,
//       // but it should ONLY choose a name; type is already decided by sign.
//       // If you don't have categorize(), default to generic buckets:
//       const category = type === "income" ? "Income" : "Spending";
  
//       newTx.push({
//         id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
//         date: d.toISOString(),
//         month,
//         merchant: desc,
//         amount: Math.abs(amountSigned), // store as positive for display math
//         type,                           // 'income' or 'outcome'
//         category,
//         statementName: file.name,
//       });
//     });
  
//     data.transactions = [...data.transactions, ...newTx];
//     save(data);
//     return newTx.length;
//   }
  

// // ---- queries ----
// export function getAllTransactions() {
//   return load().transactions;
// }
// export function getMonths() {
//   const set = new Set(getAllTransactions().map((t) => t.month));
//   return [...set].sort((a, b) => new Date(`${a} 1, 2025`) - new Date(`${b} 1, 2025`));
// }
// export function getTransactionsByMonth(month) {
//   return getAllTransactions().filter((t) => t.month === month);
// }

// export function getNetForMonth(month) {
//     return getSummaryByMonth(month).net;
//   }
  
// export function getSummaryByMonth(month) {
//   const tx = getTransactionsByMonth(month);
//   const income = {};
//   const outcome = {};
//   let totalIncome = 0, totalOutcome = 0;

//   tx.forEach((t) => {
//     if (t.type === "income") {
//       income[t.category] = (income[t.category] || 0) + t.amount;
//       totalIncome += t.amount;
//     } else {
//       outcome[t.category] = (outcome[t.category] || 0) + t.amount;
//       totalOutcome += t.amount;
//     }
//   });

//   return {
//     totalIncome,
//     totalOutcome,
//     net: totalIncome - totalOutcome,
//     incomeBreakdown: Object.entries(income).map(([label, amount]) => ({ label, amount })),
//     outcomeBreakdown: Object.entries(outcome).map(([label, amount]) => ({ label, amount })),
//   };
// }

// src/data/txStore.js
// Bridge: keep the same API the UI used before, but source data from backend.
// Pages can keep calling getMonths(), getSummaryByMonth(), getNetForMonth(), etc.

import { getTransactions as apiGetTransactions, uploadStatement as apiUpload } from "../api/client";

let _cache = [];                // normalized transactions
let _primed = false;

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
export async function primeTxStore(force = false) {
  if (!_primed || force) {
    const raw = await apiGetTransactions();       // [{_id, date, description, amount, category}]
    _cache = raw.map(normalize);
    _primed = true;
  }
  return _cache;
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
