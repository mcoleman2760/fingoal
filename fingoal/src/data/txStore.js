
import Papa from "papaparse";
import api from "../api/client";
import { clearAllTransactions as apiClear } from "../api/client";

// ---------------- In-memory store ----------------
// We keep both signed and absolute amounts to make summaries easy.
let _cache = [];   // normalized rows
let _primed = false;

const hasToken = () => !!localStorage.getItem("finGoal_token");

// ---------------- Helpers ----------------
function toISO(d) {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  const m = String(d).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const mm = String(m[1]).padStart(2, "0");
    const dd = String(m[2]).padStart(2, "0");
    const yyyy = m[3].length === 2 ? "20" + m[3] : m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  const dt = new Date(d);
  if (!isNaN(dt)) return dt.toISOString().slice(0, 10);
  return null;
}

// >>> IMPORTANT: keep the month-key format your UI expects, e.g. "Oct 2025"
const monthKeyOf = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  // "Oct 2025" in the user’s locale
  return d.toLocaleString(undefined, { month: "short" }) + " " + d.getFullYear();
};

// Normalize one backend row to the shape your UI uses everywhere
const normalize = (r) => {
  const iso = toISO(r.date || r.transactionDate || r.posted || r.postDate);
  const signed = Number(r.amount ?? 0);
  const abs = Math.abs(signed);

  return {
    id: r._id,
    date: iso,                                      // ISO yyyy-mm-dd
    merchant: r.description || r.memo || r.name || r.details || "",
    category: r.category || "Uncategorized",
    amount: abs,                                     // magnitude for charts
    rawAmount: signed,                               // signed for net math
    type: signed < 0 ? "outcome" : "income",
  };
};

// ---------------- Load from backend ----------------
export async function primeTxStore(force = false) {
  if (!hasToken()) { _cache = []; _primed = true; return _cache; }

  if (!_primed || force) {
    try {
      const { data } = await api.get("/transactions");
      const rows = Array.isArray(data) ? data : [];
      _cache = rows
        .map(normalize)
        .filter((t) => t.date && !isNaN(t.rawAmount));
      _primed = true;
    } catch (e) {
      if (e?.response?.status !== 401) console.warn("primeTxStore:", e);
      throw e;
    }
  }
  return _cache;
}

// ---------------- Public: CSV import ----------------
// Parses a wide range of bank CSVs, normalizes rows, POSTs to backend, and refreshes.
export async function importCSVFile(file) {
  const text = await file.text();

  const parse = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    // Don't rely on dynamicTyping for amounts; we sanitize manually.
    dynamicTyping: false,
  });

  if (parse.errors?.length) {
    console.warn("CSV parse errors (showing first 3):", parse.errors.slice(0, 3));
  }

  const rows = parse.data || [];
  if (!rows.length) return 0;

  // Helpers for dirty CSVs
  const cleanStr = (v) => (v == null ? "" : String(v).trim());
  const pick = (obj, keys) => {
    for (const k of keys) {
      if (obj[k] != null && obj[k] !== "") return obj[k];
    }
    return undefined;
  };
  const toNumber = (raw) => {
    if (raw == null || raw === "") return NaN;
    let s = String(raw).trim();

    // (123.45) style negatives
    let negative = false;
    if (/^\(.*\)$/.test(s)) {
      negative = true;
      s = s.slice(1, -1);
    }

    // trailing minus: 123.45-
    if (/-$/.test(s)) {
      negative = true;
      s = s.replace(/-$/, "");
    }

    // Remove $ and commas and spaces
    s = s.replace(/\$/g, "").replace(/,/g, "").replace(/\s/g, "");

    // Some banks export "1.234,56" (EU). If that happens, you may need locale handling.
    const n = Number(s);
    return negative ? -Math.abs(n) : n;
  };

  const toTx = (r) => {
    const dateRaw = pick(r, [
      "Date", "DATE", "date",
      "Posting Date", "Post Date", "PostingDate", "Transaction Date", "Trans Date", "Posted",
    ]);
    const descRaw = pick(r, [
      "Description", "DESCR", "DESC", "Memo", "Details", "Payee", "Merchant", "Name",
    ]);

    // Signed amount in one of many forms, or split Debit/Credit
    let amtRaw = pick(r, ["Amount", "AMOUNT", "amount", "Transaction Amount", "Value"]);
    let amtNum = toNumber(amtRaw);

    if (isNaN(amtNum)) {
      const debit = toNumber(pick(r, ["Debit", "DEBIT", "debit"]));
      const credit = toNumber(pick(r, ["Credit", "CREDIT", "credit"]));
      if (!isNaN(debit) && !isNaN(credit)) {
        // treat debit as negative, credit as positive
        amtNum = (credit || 0) - (debit || 0);
      } else if (!isNaN(debit)) {
        amtNum = -Math.abs(debit);
      } else if (!isNaN(credit)) {
        amtNum = Math.abs(credit);
      }
    }

    const date = toISO(cleanStr(dateRaw));
    const description = cleanStr(descRaw);

    if (!date || !description || isNaN(amtNum)) return null;

    return {
      date,                                     // yyyy-mm-dd
      description,                              // string
      amount: amtNum,                           // signed number
      type: amtNum >= 0 ? "income" : "outcome", // derived
      // Optional: category inference could go here
    };
  };

  const candidates = rows.map(toTx).filter(Boolean);

  console.log("[CSV] parsed rows:", rows.length, "valid tx:", candidates.length);
  if (!candidates.length) return 0;

  // POST to backend. If you later add a bulk import endpoint, replace with one call.
  let saved = 0;
  for (const tx of candidates) {
    try {
      await api.post("/transactions", tx);
      saved++;
    } catch (e) {
      const code = e?.response?.status;
      console.warn("POST /transactions failed", code, tx, e?.message);
      // If unauthorized, the rest will likely fail too:
      if (code === 401) break;
    }
  }

  // Refresh local cache for all pages (Income/Outcome etc.)
  try {
    await primeTxStore(true);
  } catch (_) {}

  return saved;
}


// ---------------- Upload (PDF or other) via backend route ----------------
export async function uploadFromFile(file) {
  const form = new FormData();
  form.append("file", file);
  await api.post("/statements/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  await primeTxStore(true);
}

// ---------------- Sync getters used by pages ----------------
export function getMonths() {
  const keys = Array.from(new Set(_cache.map((t) => monthKeyOf(t.date))));
  // sort desc by real date
  return keys.sort((a, b) => new Date("1 " + b) - new Date("1 " + a));
}

export function getTransactionsByMonth(mk) {
  return _cache.filter((t) => monthKeyOf(t.date) === mk);
}

export function getSummaryByMonth(mk) {
  const rows = getTransactionsByMonth(mk);
  const income = rows.filter((r) => r.type === "income");
  const outcome = rows.filter((r) => r.type === "outcome");

  const totalIncome = income.reduce((s, r) => s + r.amount, 0);          // magnitude
  const totalOutcome = outcome.reduce((s, r) => s + r.amount, 0);        // magnitude
  const net =
    income.reduce((s, r) => s + r.rawAmount, 0) +
    outcome.reduce((s, r) => s + r.rawAmount, 0);                        // signed

  const by = (items) => {
    const m = new Map();
    for (const r of items) m.set(r.category, (m.get(r.category) || 0) + r.amount);
    return [...m.entries()].map(([label, amount]) => ({ label, amount }));
  };

  return {
    totalIncome,
    totalOutcome,
    net,
    incomeBreakdown: by(income),     // <<< restored for FinanceDashboard.map()
    outcomeBreakdown: by(outcome),   // <<< restored
  };
}

export function getNetForMonth(mk) {
  return getSummaryByMonth(mk).net;
}

export async function resetAllTransactions() {
  await apiClear();
  // Clear local cache and mark as primed to prevent old UI artifacts
  // (this module’s version — adjust if you kept the older cache names)
  if (typeof _cache !== "undefined") {
    _cache = [];
    _primed = true;
  }
}