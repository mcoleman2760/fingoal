import React, { createContext, useContext, useMemo, useState } from "react";
import { getMonths } from "../data/txStore";

const MonthCtx = createContext(null);

export function MonthProvider({ children }) {
  const months = getMonths();
  const [month, setMonth] = useState(months[0] || "");

  const value = useMemo(() => ({ month, setMonth, months }), [month, months.length]);
  return <MonthCtx.Provider value={value}>{children}</MonthCtx.Provider>;
}

export function useMonth() {
  const ctx = useContext(MonthCtx);
  if (!ctx) throw new Error("useMonth must be used within <MonthProvider>");
  return ctx;
}
