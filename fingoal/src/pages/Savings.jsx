import React, { useEffect, useMemo, useState } from "react";
import { getMonths as months, getNetForMonth } from "../data/txStore";

// Format numbers as USD, no cents
const fmt = (n) => {
  const num = Number(n);
  if (isNaN(num)) return "$0";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

/**
 * Compute how much is actually allocated ("saved") to each goal
 * from the user's net for a given month.
 *
 * - Start with total positive net for the month
 * - Walk goals in order
 * - For each goal:
 *    - If manualAllocation is provided, clamp it to [0, target] and also
 *      cannot exceed remainingNet. Subtract from remainingNet.
 *    - If no manualAllocation, auto-allocate from remainingNet up to target.
 *      Subtract from remainingNet.
 * - Return enriched goals with: saved, remaining, pct, msg, net
 */
function computeDisplayGoals(goals, goalMonth) {
  const netForMonth = Math.max(0, Number(getNetForMonth(goalMonth)) || 0);
  let remainingNet = netForMonth;

  return goals.map((g) => {
    const target = Math.max(0, Number(g.target) || 0);
    const available = Math.max(0, remainingNet);

    // manualAllocation can be 0, so we must check against null/undefined
    const manualRaw = g.manualAllocation;
    const hasManual = manualRaw != null;
    const manualRequested = hasManual
      ? Math.max(0, Number(manualRaw) || 0)
      : 0;

    let allocation = 0;

    if (hasManual) {
      // Manual allocation takes priority but:
      // - cannot exceed the goal target
      // - cannot exceed remainingNet
      allocation = Math.min(target, manualRequested, remainingNet);
      remainingNet = Math.max(0, remainingNet - allocation);
    } else {
      // Automatic allocation from what remains in the pool
      allocation = Math.min(target, available);
      remainingNet = Math.max(0, remainingNet - allocation);
    }

    const remaining = Math.max(0, target - allocation);
    const pct =
      target > 0 ? Math.max(0, Math.min(100, Math.round((allocation / target) * 100))) : 0;

    // encouragement text
    const when = g.eventWhen ? ` in ${g.eventWhen}` : "";
    let msg = "";
    if (remaining === 0) {
      msg = `Goal reached! Enjoy ${g.name}. 🎉`;
    } else if (pct >= 66) {
      msg = `${fmt(remaining)} more to go - ${g.name} is close!`;
    } else if (pct >= 33) {
      msg = `${fmt(remaining)} more to go - keep it up for ${g.name}!`;
    } else {
      msg = `${fmt(remaining)} more to go to ${g.name}${when}. You got this! 💪`;
    }

    // saved = allocation (actual amount applied to this goal)
    // net = original monthly net for the selected month
    return {
      ...g,
      saved: allocation,
      remaining,
      pct,
      msg,
      net: netForMonth,
    };
  });
}

export default function Savings() {
  // form state
  const [name, setName] = useState(""); // e.g., "Paris trip"
  const [target, setTarget] = useState(""); // e.g., 3000
  const [goalMonth, setGoalMonth] = useState(months()[0] || "September");
  const [eventWhen, setEventWhen] = useState("December"); // e.g., "December"

  // goals stored in localStorage so they survive refresh (no backend yet)
  const [goals, setGoals] = useState(() => {
    try {
      const raw = localStorage.getItem("goals");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editAmount, setEditAmount] = useState("");

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  function addGoal(e) {
    e.preventDefault();
    const t = Number(target);
    if (!name || !t || t <= 0)
      return alert("Enter a goal name and a positive target amount.");
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

  // Use teammate's computeDisplayGoals with shared monthly net pool
  const enriched = useMemo(
    () => computeDisplayGoals(goals, goalMonth),
    [goals, goalMonth]
  );

  // styles
  const pageStyle = {
    background: "#f9fafb",
    minHeight: "100vh",
    padding: "36px 20px",
  };
  const containerStyle = { maxWidth: 900, margin: "0 auto" };
  const cardStyle = {
    background: "white",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #eef2ff",
  };
  const input = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
    width: "100%",
  };
  const selectStyle = { ...input, paddingRight: 28 };
  const btn = {
    padding: "10px 14px",
    border: "none",
    borderRadius: 10,
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  };
  const deleteBtn = { ...btn, background: "#ef4444" };
  const small = { color: "#6b7280", fontSize: 13 };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: 12 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              color: "#2563eb",
            }}
          >
            Savings Goals
          </h1>
          <p style={{ color: "#6b7280", marginTop: 6 }}>
            Track goals like “Paris trip” and see progress based on your monthly
            net (Income − Outcome).
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Create a Goal</h3>
          <form
            onSubmit={addGoal}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 180px 180px 160px auto",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              style={input}
              placeholder="Goal name (e.g., Paris trip)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              style={input}
              type="number"
              min="1"
              placeholder="Target amount (e.g., 3000)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <select
              style={selectStyle}
              value={goalMonth}
              onChange={(e) => setGoalMonth(e.target.value)}
            >
              {months().map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              style={input}
              placeholder="When (e.g., December)"
              value={eventWhen}
              onChange={(e) => setEventWhen(e.target.value)}
            />
            <button style={btn} type="submit">
              Add Goal
            </button>
          </form>

          <p style={{ ...small, marginTop: 8 }}>
            We calculate progress using net for the selected month, sharing it
            across your goals.
          </p>
        </div>

        <div style={{ marginTop: 14 }}>
          {enriched.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ ...small }}>No goals yet. Add one above!</p>
            </div>
          ) : (
            enriched.map((g) => (
              <div key={g.id} style={{ ...cardStyle, marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                      {g.name}
                    </div>
                    <div style={small}>
                      Month: <b>{g.month}</b> • Target: <b>{fmt(g.target)}</b> •
                      Net so far: <b>{fmt(g.net)}</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {editingGoalId === g.id ? (
                      <>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="Enter amount"
                          style={{ ...input, width: 100 }}
                        />
                        <button
                          style={btn}
                          onClick={() => {
                            const amt = Number(editAmount);
                            if (isNaN(amt) || amt < 0)
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
                          onClick={() => {
                            setEditingGoalId(g.id);
                            setEditAmount(g.manualAllocation ?? g.saved ?? "");
                          }}
                          style={{ ...btn, background: "#f59e0b" }}
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
                      width: `${g.pct}%`,
                      height: "100%",
                      background: "#10b981",
                      transition: "width .3s",
                    }}
                  />
                </div>

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

  // approximate overall progress as average of all goal percentages
  const totalPct = goals.reduce((acc, g) => {
    const net = Math.max(0, getNetForMonth(g.month));
    const target = Math.max(0, Number(g.target) || 0);
    if (target === 0) return acc;
    const pct = Math.max(
      0,
      Math.min(100, Math.round((net / target) * 100))
    );
    return acc + pct;
  }, 0);

  return Math.round(totalPct / goals.length);
}
