
// import React, { useMemo, useState } from "react";
// import { getMonths, getSummaryByMonth } from "./data/txStore";

// const currency = (n) =>
//   n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// export default function FinanceDashboard() {
//   const months = getMonths();
//   const [month, setMonth] = useState(months[0] || "September");

//   const { totalIncome, totalOutcome, net, incomeBreakdown, outcomeBreakdown } = useMemo(
//     () => getSummaryByMonth(month),
//     [month]
//   );

//   const maxIncome = Math.max(1, ...incomeBreakdown.map((x) => x.amount));
//   const maxOutcome = Math.max(1, ...outcomeBreakdown.map((x) => x.amount));

//   // … (styles same as before)

//   return (
//     <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
//         <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Income & Outcome</h1>
//         <div>
//           <label style={{ marginRight: 8, color: "#6b7280", fontWeight: 600 }}>Month</label>
//           <select value={month} onChange={(e) => setMonth(e.target.value)}>
//             {months.map((m) => <option key={m} value={m}>{m}</option>)}
//           </select>
//         </div>
//       </div>

//       {/* summary cards (use totalIncome/totalOutcome/net) */}
//       {/* … keep your UI, just swap data with these variables … */}

//       {/* Income panel */}
//       <div /* panel styles */>
//         <div /* label styles */>Income</div>
//         {incomeBreakdown.length === 0 && <div style={{ color: "#9ca3af", marginTop: 10 }}>No income recorded.</div>}
//         {incomeBreakdown.map((it) => {
//           const pct = `${Math.round((it.amount / maxIncome) * 100)}%`;
//           return (
//             <div key={it.label} /* row styles */>
//               <div>
//                 <div style={{ fontWeight: 700 }}>{it.label}</div>
//                 <div /* barWrap */>
//                   <div style={{ width: pct, height: 8, background: "#10b981" }} />
//                 </div>
//               </div>
//               <div style={{ fontWeight: 800 }}>{currency(it.amount)}</div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Outcome panel — use outcomeBreakdown/maxOutcome */}
//       {/* … */}
//     </div>
//   );
// }

import React, { useMemo } from "react";
import { getSummaryByMonth } from "./data/txStore";
import { useMonth } from "./state/MonthContext";

const currency = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function FinanceDashboard() {
  const { month, setMonth, months } = useMonth();

  const { totalIncome, totalOutcome, net, incomeBreakdown, outcomeBreakdown } = useMemo(
    () => (month ? getSummaryByMonth(month) : { totalIncome:0, totalOutcome:0, net:0, incomeBreakdown:[], outcomeBreakdown:[] }),
    [month]
  );

  const maxIncome = Math.max(1, ...incomeBreakdown.map((x) => x.amount));
  const maxOutcome = Math.max(1, ...outcomeBreakdown.map((x) => x.amount));

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Income & Outcome</h1>
        <div>
          <label style={{ marginRight: 8, color: "#6b7280", fontWeight: 600 }}>Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <div style={{ borderRadius: 16, padding: 16, background: "white", border: "1px solid #f2f2f2" }}>
          <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Total Income</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{currency(totalIncome)}</div>
        </div>
        <div style={{ borderRadius: 16, padding: 16, background: "white", border: "1px solid #f2f2f2" }}>
          <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Total Outcome</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{currency(totalOutcome)}</div>
        </div>
        <div style={{ borderRadius: 16, padding: 16, background: "white", border: "1px solid #f2f2f2" }}>
          <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Net</div>
          <div style={{ marginTop: 6 }}>
            <span style={{
              display: "inline-block", padding: "6px 10px", borderRadius: 999, fontWeight: 700,
              color: net >= 0 ? "#065f46" : "#7f1d1d",
              background: net >= 0 ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${net >= 0 ? "#a7f3d0" : "#fecaca"}`
            }}>
              {net >= 0 ? "+" : "−"}{currency(Math.abs(net))}
            </span>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Income breakdown */}
        <div style={{ borderRadius: 16, padding: 16, background: "white", border: "1px solid #f2f2f2" }}>
          <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Income</div>
          {incomeBreakdown.length === 0 && <div style={{ color: "#9ca3af", marginTop: 10 }}>No income recorded.</div>}
          {incomeBreakdown.map((it) => {
            const pct = `${Math.round((it.amount / maxIncome) * 100)}%`;
            return (
              <div key={it.label} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", marginTop: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.label}</div>
                  <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: pct, height: "100%", background: "#10b981" }} />
                  </div>
                </div>
                <div style={{ fontWeight: 800 }}>{currency(it.amount)}</div>
              </div>
            );
          })}
        </div>

        {/* Outcome breakdown */}
        <div style={{ borderRadius: 16, padding: 16, background: "white", border: "1px solid #f2f2f2" }}>
          <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Outcome</div>
          {outcomeBreakdown.length === 0 && <div style={{ color: "#9ca3af", marginTop: 10 }}>No expenses recorded.</div>}
          {outcomeBreakdown.map((it) => {
            const pct = `${Math.round((it.amount / maxOutcome) * 100)}%`;
            return (
              <div key={it.label} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", marginTop: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{it.label}</div>
                  <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: pct, height: "100%", background: "#8b5cf6" }} />
                  </div>
                </div>
                <div style={{ fontWeight: 800 }}>{currency(it.amount)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
