import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMonths } from "../data/txStore";

const MonthCtx = createContext(null);

export function MonthProvider({ children }) {
  // Always read current months from store on each render
  const monthsNow = getMonths(); // e.g., [] initially, then ["October", ...] after upload

  const [month, setMonth] = useState(monthsNow[0] || "");

  // If store months change (e.g., after upload) and current month is invalid/empty,
  // auto-select the first available month.
  useEffect(() => {
    if (!month || !monthsNow.includes(month)) {
      if (monthsNow.length > 0) setMonth(monthsNow[0]);
    }
  }, [monthsNow.join("|")]); // join ensures the effect runs if the list changes

  // Re-render provider when months list or selected month change
  const value = useMemo(() => ({ month, setMonth, months: monthsNow }), [month, monthsNow.join("|")]);

  // Listen for "txstore:changed" and force a re-render
  useEffect(() => {
    const onChanged = () => {
      // touching state to force re-render; the next render will re-read getMonths()
      setMonth((m) => m); 
    };
    window.addEventListener("txstore:changed", onChanged);
    return () => window.removeEventListener("txstore:changed", onChanged);
  }, []);

  return <MonthCtx.Provider value={value}>{children}</MonthCtx.Provider>;
}

export function useMonth() {
  const ctx = useContext(MonthCtx);
  if (!ctx) throw new Error("useMonth must be used within <MonthProvider>");
  return ctx;
}
