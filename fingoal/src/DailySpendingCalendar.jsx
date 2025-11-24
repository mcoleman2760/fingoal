

// DailySpendingCalendar.jsx
import React, { useMemo } from "react";
import { getDailySeries } from "./data/txStore";   // if this file is in /pages, use ../data/txStore
import { useMonth } from "./state/MonthContext";

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function DailySpendingCalendar() {
  const { month } = useMonth();

  const {
    days,
    year,
    monthIndex,
    incomeTotals,
    outcomeTotals,
  } = useMemo(() => getDailySeries(month), [month]);

  const monthLabel = useMemo(
    () =>
      new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [year, monthIndex]
  );

  // grid scaffolding
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay(); // 0..6

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);  // leading blanks
  for (let d = 1; d <= days; d++) cells.push(d);            // actual days
  const remainder = cells.length % 7;                        // trailing blanks
  if (remainder !== 0) for (let i = 0; i < 7 - remainder; i++) cells.push(null);

  // shared styles
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(96px, 1fr))",
    gap: 10,
  };

  // outer square “box” (size locked by aspect ratio)
  const boxStyle = {
    position: "relative",
    aspectRatio: "1 / 1",           // ← forces perfect square
    border: "1px solid #eef2ff",
    borderRadius: 14,
    background: "#ffffff",
    overflow: "hidden",
  };

  // inner content pinned inside the square
  const contentStyle = {
    position: "absolute",
    inset: 10,                       // inner padding
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={{ borderRadius: 16, background: "white", border: "1px solid #f2f2f2", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#111827" }}>Daily Income & Spending</h2>
        <div style={{ color: "#6b7280", fontWeight: 700 }}>{monthLabel}</div>
      </div>

      {/* Weekday headers */}
      <div style={{ ...gridStyle, marginBottom: 8 }}>
        {weekdayLabels.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: 14, fontWeight: 900, color: "#6b7280" }}>
            {w}
          </div>
        ))}
      </div>

      {/* Calendar squares (all identical size) */}
      <div style={gridStyle}>
        {cells.map((d, i) => {
          if (d === null) {
            return <div key={`b-${i}`} style={boxStyle} />;
          }

          const inc = incomeTotals[d - 1] || 0;
          const out = outcomeTotals[d - 1] || 0;

          return (
            <div key={d} style={boxStyle}>
              <div style={contentStyle}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>{d}</div>

                {/* amounts (only when present) */}
                <div style={{ marginTop: 10, display: "grid", rowGap: 6 }}>
                  {inc > 0 && (
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: "#065f46",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        letterSpacing: "0.2px",
                      }}
                    >
                      +{money(inc)}
                    </div>
                  )}
                  {out > 0 && (
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: "#7f1d1d",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        letterSpacing: "0.2px",
                      }}
                    >
                      -{money(out)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
        Only days with transactions show amounts. Income is green; spending is red.
      </div>
    </div>
  );
}
