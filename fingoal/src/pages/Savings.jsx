// import React, { useEffect, useMemo, useState } from "react";
// // import { months, getNetForMonth } from "../data/financeData";
// import { getMonths as months, getNetForMonth } from "../data/txStore";

// const fmt = (n) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// export default function Savings() {
//   // form state
//   const [name, setName] = useState("");                 // e.g., "Paris trip"
//   const [target, setTarget] = useState("");             // e.g., 3000
//   // const [goalMonth, setGoalMonth] = useState(months[0] || "September"); // which month to measure net
//   const [goalMonth, setGoalMonth] = useState((months()[0]) || "September");
//   const [eventWhen, setEventWhen] = useState("December"); // e.g., "December" for encouragement text

//   // goals stored in localStorage so they survive refresh (no backend needed yet)
//   const [goals, setGoals] = useState(() => {
//     try {
//       const raw = localStorage.getItem("goals");
//       return raw ? JSON.parse(raw) : [];
//     } catch {
//       return [];
//     }
//   });

//   useEffect(() => {
//     localStorage.setItem("goals", JSON.stringify(goals));
//   }, [goals]);

//   function addGoal(e) {
//     e.preventDefault();
//     const t = Number(target);
//     if (!name || !t || t <= 0) return alert("Enter a goal name and a positive target amount.");
//     setGoals((g) => [
//       ...g,
//       {
//         id: Date.now(),
//         name,
//         target: t,
//         month: goalMonth,
//         eventWhen, // for encouragement text
//       },
//     ]);
//     setName("");
//     setTarget("");
//   }
//   function removeGoal(id) {
//     setGoals((g) => g.filter((x) => x.id !== id));
//   }

//   const enriched = useMemo(() => {
//     let remainingNet = getNetForMonth(goalMonth);

//     return goals.map((g) => {
//       const net = Math.max(0, remainingNet);

//       const available = Math.max(0, remainingNet);
//       const allocation = Math.min(available, g.target);
//       remainingNet -= allocation;

//       const remaining = Math.max(0, g.target - allocation);
//       const pct = Math.round((allocation / g.target) * 100);

//       let msg = "";
//       if (remaining === 0) {
//         msg = `Goal reached! Enjoy ${g.name}. 🎉`;
//       } else if (pct >= 66) {
//         msg = `${fmt(remaining)} more to go - ${g.name} is close!`;
//       } else if (pct >= 33) {
//         msg = `${fmt(remaining)} more to go - keep it up for ${g.name}!`;
//       } else {
//         msg = `${fmt(remaining)} more to go to ${g.name} in ${g.eventWhen}. You got this! 💪`;
//       }
//       return { ...g, net, saved: allocation, remaining, pct, msg };
//     });
//   }, [goals, goalMonth]);

//   // compute progress for each goal from Income-Outcome net
//   // const enriched = useMemo(() => {
//   //   return goals.map((g) => {
//   //     const net = getNetForMonth(g.month);          // income - outcome for that month
//   //     const saved = Math.max(0, net);               // if net negative, saved = 0 (you can change rule)
//   //     const remaining = Math.max(0, g.target - saved);
//   //     const pct = Math.max(0, Math.min(100, Math.round((saved / g.target) * 100)));
//   //     let msg = "";
//   //     if (remaining === 0) {
//   //       msg = `Goal reached! Enjoy ${g.name}. 🎉`;
//   //     } else if (pct >= 66) {
//   //       msg = `${fmt(remaining)} more to go — ${g.name} is close!`;
//   //     } else if (pct >= 33) {
//   //       msg = `${fmt(remaining)} more to go — keep it up for ${g.name}!`;
//   //     } else {
//   //       msg = `${fmt(remaining)} more to go to ${g.name} in ${g.eventWhen}. You got this! 💪`;
//   //     }
//   //     return { ...g, net, saved, remaining, pct, msg };
//   //   });
//   // }, [goals]);

//   // styles
//   const pageStyle = { background: "#f9fafb", minHeight: "100vh", padding: "36px 20px" };
//   const containerStyle = { maxWidth: 900, margin: "0 auto" };
//   const cardStyle = { background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #eef2ff" };
//   const input = { padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none", width: "100%" };
//   const selectStyle = { ...input, paddingRight: 28 };
//   const btn = { padding: "10px 14px", border: "none", borderRadius: 10, background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" };
//   const deleteBtn = { ...btn, background: "#ef4444" };
//   const small = { color: "#6b7280", fontSize: 13 };

//   return (
//     <div style={pageStyle}>
//       <div style={containerStyle}>
//         <div style={{ marginBottom: 12 }}>
//           <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#2563eb" }}>Savings Goals</h1>
//           <p style={{ color: "#6b7280", marginTop: 6 }}>
//             Track goals like “Paris trip” and see progress based on your monthly net (Income − Outcome).
//           </p>
//         </div>

//         <div style={cardStyle}>
//           <h3 style={{ marginTop: 0 }}>Create a Goal</h3>
//           <form onSubmit={addGoal} style={{ display: "grid", gridTemplateColumns: "1fr 180px 180px 160px auto", gap: 10, alignItems: "center" }}>
//             <input style={input} placeholder="Goal name (e.g., Paris trip)" value={name} onChange={(e) => setName(e.target.value)} />
//             <input style={input} type="number" min="1" placeholder="Target amount (e.g., 3000)" value={target} onChange={(e) => setTarget(e.target.value)} />
//             <select style={selectStyle} value={goalMonth} onChange={(e) => setGoalMonth(e.target.value)}>
//               {months().map((m) => (<option key={m} value={m}>{m}</option>))}
//             </select>
//             <input style={input} placeholder="When (e.g., December)" value={eventWhen} onChange={(e) => setEventWhen(e.target.value)} />
//             <button style={btn} type="submit">Add Goal</button>
//           </form>

//           <p style={{ ...small, marginTop: 8 }}>
//             We calculate progress using net for the selected month.
//           </p>
//         </div>

//         <div style={{ marginTop: 14 }}>
//           {enriched.length === 0 ? (
//             <div style={cardStyle}><p style={{ ...small }}>No goals yet. Add one above!</p></div>
//           ) : (
//             enriched.map((g) => (
//               <div key={g.id} style={{ ...cardStyle, marginBottom: 12 }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
//                   <div>
//                     <div style={{ fontSize: 18, fontWeight: 800 }}>{g.name}</div>
//                     <div style={small}>
//                       Month: <b>{g.month}</b> • Target: <b>{fmt(g.target)}</b> • Net so far: <b>{fmt(g.net)}</b>
//                     </div>
//                   </div>
//                   <button onClick={() => removeGoal(g.id)} style={deleteBtn}>Delete</button>
//                 </div>

//                 <div style={{ height: 10, borderRadius: 999, background: "#f3f4f6", overflow: "hidden", marginTop: 10 }}>
//                   <div style={{ width: `${g.pct}%`, height: "100%", background: "#10b981", transition: "width .3s" }} />
//                 </div>

//                 <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, ...small }}>
//                   <div>Saved (from net): <b>{fmt(g.saved)}</b></div>
//                   <div>Remaining: <b>{fmt(g.remaining)}</b> ({g.pct}%)</div>
//                 </div>

//                 <div style={{ marginTop: 8, fontWeight: 600 }}>{g.msg}</div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // export a helper to get the user's overall progress
// export function getUserProgress() {
//   const goalsRaw = localStorage.getItem("goals");
//   const goals = goalsRaw ? JSON.parse(goalsRaw) : [];
  
//   if (goals.length === 0) return 0;

//   // calculate overall progress as average of all goal percentages
//   const totalPct = goals.reduce((acc, g) => {
//     const net = Math.max(0, getNetForMonth(g.month));
//     const pct = Math.max(0, Math.min(100, Math.round((net / g.target) * 100)));
//     return acc + pct;
//   }, 0);

//   return Math.round(totalPct / goals.length);
// }


// Savings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getMonths as months, getNetForMonth } from "../data/txStore";

// ---------- utils ----------
const fmt = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "$0";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

// Shared allocator so UI math == exported getUserProgress math
function computeDisplayGoals(goals, goalMonth) {
  // start with the total positive net available for the month
  let remainingNet = Math.max(0, Number(getNetForMonth(goalMonth)) || 0);

  // We'll allocate in one pass, consuming remainingNet for both manual and auto allocations.
  // This ensures manual allocations subtract from the pool and cannot cause total > net.
  return goals.map((g) => {
    const target = Math.max(0, Number(g.target) || 0);

    // read manualAllocation if present (could be 0)
    const manualRaw = g.manualAllocation;
    const hasManual = manualRaw != null;

    // clamp requested manual allocation to a non-negative number
    const manualRequested = hasManual ? Math.max(0, Number(manualRaw) || 0) : 0;

    let allocation = 0;

    if (hasManual) {
      // Manual allocation takes priority but cannot exceed the goal target,
      // and cannot allocate more than remainingNet at this moment.
      allocation = Math.min(target, manualRequested, remainingNet);
      // subtract manual allocation from pool so later goals (manual or auto) see reduced remainingNet
      remainingNet = Math.max(0, remainingNet - allocation);
    } else {
      // Automatic allocation: take what's left from remainingNet (capped by target)
      allocation = Math.min(target, Math.max(0, remainingNet));
      remainingNet = Math.max(0, remainingNet - allocation);
    }

    const remaining = Math.max(0, target - allocation);
    const pct = target > 0 ? Math.round((allocation / target) * 100) : 0;

    let msg = "";
    if (remaining === 0) {
      msg = `🎉 Goal "${g.name}" reached!`;
    } else {
      const when = g.eventWhen ? ` in ${g.eventWhen}` : "";
      msg = `${fmt(remaining)} more to go to ${g.name}${when}. You got this! 💪`;
    }

    // saved = allocation (actual amount applied to this goal)
    return { ...g, saved: allocation, remaining, pct, msg };
  });
}

// ---------- component ----------
export default function Savings() {
  // Form state
  const [form, setForm] = useState({
    name: "",
    target: "",
    eventWhen: "",
  });

  // Goals state
  const [goals, setGoals] = useState(() => {
    try {
      const raw = localStorage.getItem("goals");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Month selection (default to most recent month, if available)
  const allMonths = months() || [];
  const [goalMonth, setGoalMonth] = useState(allMonths[0] || "");

  // Inline edit controls
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editAmount, setEditAmount] = useState("");

  // Persist goals
  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  // Derived allocations for the selected month
  const displayGoals = useMemo(() => {
    return computeDisplayGoals(goals, goalMonth);
  }, [goals, goalMonth]);

  // Handlers
  const addGoal = () => {
    const name = form.name.trim();
    const target = Number(form.target);
    if (!name) return alert("Please enter a goal name.");
    if (!Number.isFinite(target) || target <= 0)
      return alert("Please enter a valid target amount.");

    const newGoal = {
      id: crypto.randomUUID(),
      name,
      target,
      eventWhen: form.eventWhen.trim(),
      month: goalMonth,
      createdAt: Date.now(),
      // manualAllocation: undefined
    };

    setGoals((prev) => [newGoal, ...prev]);
    setForm({ name: "", target: "", eventWhen: "" });
  };

  const removeGoal = (id) => {
    setGoals((gs) => gs.filter((g) => g.id !== id));
    if (editingGoalId === id) {
      setEditingGoalId(null);
      setEditAmount("");
    }
  };

  // ---------- styles ----------
  const container = { maxWidth: 720, margin: "0 auto", padding: 16 };
  const row = { display: "flex", gap: 8, alignItems: "center" };
  const input = {
    flex: 1,
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
  };
  const select = { ...input, flex: 0, minWidth: 180 };
  const btn = {
    padding: "8px 12px",
    borderRadius: 8,
    background: "#3b82f6",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
  };
  const deleteBtn = {
    ...btn,
    background: "#ef4444",
  };
  const card = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    background: "white",
  };
  const small = { fontSize: 13, color: "#374151" };

  return (
    <div style={container}>
      <h2 style={{ marginBottom: 12 }}>Savings Goals</h2>

      {/* Month selector */}
      <div style={{ ...row, marginBottom: 12 }}>
        <label style={{ fontSize: 14, color: "#374151" }}>Month</label>
        <select
          style={select}
          value={goalMonth}
          onChange={(e) => setGoalMonth(e.target.value)}
        >
          {allMonths.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div style={{ marginLeft: "auto", fontSize: 14 }}>
          Net for {goalMonth || "—"}:{" "}
          <b>{fmt(getNetForMonth(goalMonth) || 0)}</b>
        </div>
      </div>

      {/* Create goal */}
      <div style={{ ...row, marginBottom: 16 }}>
        <input
          style={input}
          placeholder="Goal name (e.g., Paris Trip)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          style={{ ...input, maxWidth: 160 }}
          placeholder="Target (USD)"
          type="number"
          value={form.target}
          onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
        />
        <input
          style={{ ...input, maxWidth: 220 }}
          placeholder="When (e.g., July 2026)"
          value={form.eventWhen}
          onChange={(e) => setForm((f) => ({ ...f, eventWhen: e.target.value }))}
        />
        <button style={btn} onClick={addGoal}>
          Add
        </button>
      </div>

      {/* Goals list */}
      {displayGoals.length === 0 ? (
        <div style={small}>No goals yet. Add your first goal above.</div>
      ) : (
        displayGoals.map((g) => (
          <div key={g.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{g.name}</div>
                <div style={{ ...small, marginTop: 4 }}>
                  Month: <b>{g.month || goalMonth}</b> • Target:{" "}
                  <b>{fmt(g.target)}</b>
                </div>
                <div style={{ ...small, marginTop: 4 }}>{g.msg}</div>
              </div>

              {/* Edit / Delete */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {editingGoalId === g.id ? (
                  <>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="Enter amount"
                      style={{ ...input, width: 120 }}
                    />
                    <button
                      style={btn}
                      onClick={() => {
                        const amt = Number(editAmount);
                        if (!Number.isFinite(amt) || amt < 0)
                          return alert("Enter a valid amount");
                        setGoals((gs) =>
                          gs.map((goal) =>
                            goal.id === g.id
                              ? { ...goal, manualAllocation: amt }
                              : goal
                          )
                        );
                        setEditingGoalId(null);
                        setEditAmount("");
                      }}
                    >
                      Save
                    </button>
                    <button
                      style={{ ...btn, background: "#9ca3af" }}
                      onClick={() => {
                        setEditingGoalId(null);
                        setEditAmount("");
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      style={{ ...btn, background: "#f59e0b" }}
                      onClick={() => {
                        setEditingGoalId(g.id);
                        setEditAmount(
                          g.manualAllocation ?? g.saved ?? ""
                        );
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeGoal(g.id)}
                      style={deleteBtn}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "#f3f4f6",
                overflow: "hidden",
                marginTop: 10,
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, g.pct))}%`,
                  height: "100%",
                  background: "#10b981",
                  transition: "width .3s",
                }}
              />
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                ...small,
              }}
            >
              <div>
                Saved ({g.manualAllocation != null ? "manual" : "auto"}):{" "}
                <b>{fmt(g.saved)}</b>
              </div>
              <div>
                Remaining: <b>{fmt(g.remaining)}</b> ({g.pct}%)
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ---------- exported progress helper ----------
export function getUserProgress() {
  // Load goals
  let goals = [];
  try {
    const raw = localStorage.getItem("goals");
    goals = raw ? JSON.parse(raw) : [];
  } catch {
    goals = [];
  }
  if (goals.length === 0) return 0;

  // Use most recent month as the default context (mirrors component default)
  const allMonths = months() || [];
  const month = allMonths[0] || "";

  // Reuse the same math as the UI to avoid drift
  const computed = computeDisplayGoals(goals, month);
  const pctList = computed.map((g) => Number(g.pct) || 0);
  const avg =
    pctList.reduce((acc, v) => acc + v, 0) / (pctList.length || 1);

  return Math.round(avg);
}
