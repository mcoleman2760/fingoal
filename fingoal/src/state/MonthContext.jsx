// src/state/MonthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { primeTxStore, getMonths } from "../data/txStore";

const MonthContext = createContext(null);

export function MonthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [month, setMonth] = useState("");
  const [months, setMonths] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        await primeTxStore();             // fetch transactions from backend once
        const m = getMonths();            // build month list from cache
        setMonths(m);
        if (m.length) setMonth(m[0]);     // default to most recent
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const value = useMemo(() => ({ month, setMonth, months, ready }), [month, months, ready]);
  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
}

export function useMonth() {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error("useMonth must be used within <MonthProvider>");
  return ctx;
}
