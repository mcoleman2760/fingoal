import React, { useEffect, useMemo, useState } from "react";
// import { months, getNetForMonth } from "../data/financeData";
import { getMonths as months, getNetForMonth } from "../data/txStore";

const fmt = (n) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function Savings() {
  // form state
  const [name, setName] = useState("");                 // e.g., "Paris trip"
  const [target, setTarget] = useState("");             // e.g., 3000
  // const [goalMonth, setGoalMonth] = useState(months[0] || "September"); // which month to measure net
  const [goalMonth, setGoalMonth] = useState((months()[0]) || "September");
  const [eventWhen, setEventWhen] = useState("December"); // e.g., "December" for encouragement text

  // goals stored in localStorage so they survive refresh (no backend needed yet)
  const [goals, setGoals] = useState(() => {
    try {
      const raw = localStorage.getItem("goals");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  function addGoal(e) {
    e.preventDefault();
    const t = Number(target);
    if (!name || !t || t <= 0) return alert("Enter a goal name and a positive target amount.");
    setGoals((g) => [
      ...g,
      {
        id: Date.now(),
        name,
        target: t,
        month: goalMonth,
        eventWhen, // for encouragement text
      },
    ]);
    setName("");
    setTarget("");
  }
  function removeGoal(id) {
    setGoals((g) => g.filter((x) => x.id !== id));
  }

  const enriched = useMemo(() => {
    let remainingNet = getNetForMonth(goalMonth);

    return goals.map((g) => {
      const net = Math.max(0, remainingNet);

      const available = Math.max(0, remainingNet);
      const allocation = Math.min(available, g.target);
      remainingNet -= allocation;

      const remaining = Math.max(0, g.target - allocation);
      const pct = Math.round((allocation / g.target) * 100);

      let msg = "";
      if (remaining === 0) {
        msg = `Goal reached! Enjoy ${g.name}. 🎉`;
      } else if (pct >= 66) {
        msg = `${fmt(remaining)} more to go - ${g.name} is close!`;
      } else if (pct >= 33) {
        msg = `${fmt(remaining)} more to go - keep it up for ${g.name}!`;
      } else {
        msg = `${fmt(remaining)} more to go to ${g.name} in ${g.eventWhen}. You got this! 💪`;
      }
      return { ...g, net, saved: allocation, remaining, pct, msg };
    });
  }, [goals, goalMonth]);

  // compute progress for each goal from Income-Outcome net
  // const enriched = useMemo(() => {
  //   return goals.map((g) => {
  //     const net = getNetForMonth(g.month);          // income - outcome for that month
  //     const saved = Math.max(0, net);               // if net negative, saved = 0 (you can change rule)
  //     const remaining = Math.max(0, g.target - saved);
  //     const pct = Math.max(0, Math.min(100, Math.round((saved / g.target) * 100)));
  //     let msg = "";
  //     if (remaining === 0) {
  //       msg = `Goal reached! Enjoy ${g.name}. 🎉`;
  //     } else if (pct >= 66) {
  //       msg = `${fmt(remaining)} more to go — ${g.name} is close!`;
  //     } else if (pct >= 33) {
  //       msg = `${fmt(remaining)} more to go — keep it up for ${g.name}!`;
  //     } else {
  //       msg = `${fmt(remaining)} more to go to ${g.name} in ${g.eventWhen}. You got this! 💪`;
  //     }
  //     return { ...g, net, saved, remaining, pct, msg };
  //   });
  // }, [goals]);

  // styles
  const pageStyle = { background: "#f9fafb", minHeight: "100vh", padding: "36px 20px" };
  const containerStyle = { maxWidth: 900, margin: "0 auto" };
  const cardStyle = { background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #eef2ff" };
  const input = { padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none", width: "100%" };
  const selectStyle = { ...input, paddingRight: 28 };
  const btn = { padding: "10px 14px", border: "none", borderRadius: 10, background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" };
  const deleteBtn = { ...btn, background: "#ef4444" };
  const small = { color: "#6b7280", fontSize: 13 };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#2563eb" }}>Savings Goals</h1>
          <p style={{ color: "#6b7280", marginTop: 6 }}>
            Track goals like “Paris trip” and see progress based on your monthly net (Income − Outcome).
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Create a Goal</h3>
          <form onSubmit={addGoal} style={{ display: "grid", gridTemplateColumns: "1fr 180px 180px 160px auto", gap: 10, alignItems: "center" }}>
            <input style={input} placeholder="Goal name (e.g., Paris trip)" value={name} onChange={(e) => setName(e.target.value)} />
            <input style={input} type="number" min="1" placeholder="Target amount (e.g., 3000)" value={target} onChange={(e) => setTarget(e.target.value)} />
            <select style={selectStyle} value={goalMonth} onChange={(e) => setGoalMonth(e.target.value)}>
              {months().map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
            <input style={input} placeholder="When (e.g., December)" value={eventWhen} onChange={(e) => setEventWhen(e.target.value)} />
            <button style={btn} type="submit">Add Goal</button>
          </form>

          <p style={{ ...small, marginTop: 8 }}>
            We calculate progress using net for the selected month.
          </p>
        </div>

        <div style={{ marginTop: 14 }}>
          {enriched.length === 0 ? (
            <div style={cardStyle}><p style={{ ...small }}>No goals yet. Add one above!</p></div>
          ) : (
            enriched.map((g) => (
              <div key={g.id} style={{ ...cardStyle, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{g.name}</div>
                    <div style={small}>
                      Month: <b>{g.month}</b> • Target: <b>{fmt(g.target)}</b> • Net so far: <b>{fmt(g.net)}</b>
                    </div>
                  </div>
                  <button onClick={() => removeGoal(g.id)} style={deleteBtn}>Delete</button>
                </div>

                <div style={{ height: 10, borderRadius: 999, background: "#f3f4f6", overflow: "hidden", marginTop: 10 }}>
                  <div style={{ width: `${g.pct}%`, height: "100%", background: "#10b981", transition: "width .3s" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, ...small }}>
                  <div>Saved (from net): <b>{fmt(g.saved)}</b></div>
                  <div>Remaining: <b>{fmt(g.remaining)}</b> ({g.pct}%)</div>
                </div>

                <div style={{ marginTop: 8, fontWeight: 600 }}>{g.msg}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// export a helper to get the user's overall progress
export function getUserProgress() {
  const goalsRaw = localStorage.getItem("goals");
  const goals = goalsRaw ? JSON.parse(goalsRaw) : [];
  
  if (goals.length === 0) return 0;

  // calculate overall progress as average of all goal percentages
  const totalPct = goals.reduce((acc, g) => {
    const net = Math.max(0, getNetForMonth(g.month));
    const pct = Math.max(0, Math.min(100, Math.round((net / g.target) * 100)));
    return acc + pct;
  }, 0);

  return Math.round(totalPct / goals.length);
}

