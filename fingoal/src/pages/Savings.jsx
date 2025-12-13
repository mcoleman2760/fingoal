import React, { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { getMonths as months, getNetForMonth } from "../data/txStore";

const fmt = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "$0";
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
  "#6366f1",
];

function getYearToDateNet() {
  let total = 0;
  for (const m of months()) {
    const monthlyNet = Number(getNetForMonth(m)) || 0;
    total += monthlyNet;
  }
  return total;
}

function getAdjustments() {
  try {
    return JSON.parse(localStorage.getItem("adjustments") || "[]");
  } catch {
    return [];
  }
}

function allocateGoalsAndTotals(goals, totalNet, adjustmentsArray) {
  const adjTotal = (adjustmentsArray || []).reduce((sum, a) => {
    const amt = Number(a.amount) || 0;
    return a.type === "income" ? sum + amt : sum - amt;
  }, 0);

  const totalPool = totalNet + adjTotal;
  let remainingPool = Math.max(0, totalPool);

  const enriched = goals.map((g) => {
    const target = Math.max(0, Number(g.target) || 0);

    const manualRaw = g.manualAllocation;
    const hasManual = manualRaw != null;
    const manualRequested = hasManual ? Math.max(0, Number(manualRaw) || 0) : 0;

    let allocation = 0;
    if (hasManual) {
      allocation = Math.min(target, manualRequested, remainingPool);
    } else {
      allocation = Math.min(target, remainingPool);
    }

    remainingPool = Math.max(0, remainingPool - allocation);

    const remaining = Math.max(0, target - allocation);
    const pct =
      target > 0
        ? Math.max(0, Math.min(100, Math.round((allocation / target) * 100)))
        : 0;

    const goalDateStr = formatGoalDate(g.goalDate);
    const daysLeft = daysUntilDate(g.goalDate);

    let timeMsg = "";
    if (daysLeft != null) {
      if (daysLeft < 0) {
        timeMsg = " — goal date passed ⚠️";
      } else if (daysLeft === 0) {
        timeMsg = " — today is the day!";
      } else if (daysLeft === 1) {
        timeMsg = " — 1 day left";
      } else {
        timeMsg = ` — ${daysLeft} days left`;
      }
    }

    const when = goalDateStr ? ` on ${goalDateStr}` : "";

    let msg = `${fmt(remaining)} more to go to ${
      g.name
    }${when}${timeMsg}. You got this! 💪`;
    if (remaining === 0) {
      msg = `Goal reached! Enjoy ${g.name}. 🎉`;
    }


    return {
      ...g,
      saved: allocation,
      remaining,
      pct,
      msg,
      net: remainingPool,
    };
  });

  const totalSaved = enriched.reduce((s, g) => s + (Number(g.saved) || 0), 0);
  const remainingAfterAll = Math.max(0, totalPool - totalSaved);

  return {
    enriched,
    totals: {
      totalNet,
      adjTotal,
      totalPool,
      totalSaved,
      remainingAfterAll,
    },
  };
}

function monthKeyFromDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return (
    d.toLocaleString(undefined, { month: "short" }) + " " + d.getFullYear()
  );
}
function formatGoalDate(iso) {
  if (!iso) return "";

  const [year, month, day] = iso.split("-").map(Number);

  // Create date in LOCAL time (not UTC)
  const d = new Date(year, month - 1, day);

  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntilDate(iso) {
  if (!iso) return null;

  const [y, m, d] = iso.split("-").map(Number);

  // Local midnight (avoids timezone bug)
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = target - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}



export default function Savings() {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [goalMonth, setGoalMonth] = useState(months()[0] || "September");
  const [goalDate, setGoalDate] = useState("");

  const [eventWhen, setEventWhen] = useState("December");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjType, setAdjType] = useState("income");
  const [adjMemo, setAdjMemo] = useState("");

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

  const [adjustments, setAdjustments] = useState(() => getAdjustments());

  useEffect(() => {
    localStorage.setItem("adjustments", JSON.stringify(adjustments));
  }, [adjustments]);

  function addGoal(e) {
    e.preventDefault();

    const t = Number(target);
    if (!name || !t || t <= 0)
      return alert("Enter a goal name and a positive target amount.");

    if (!goalDate) return alert("Please choose a goal date.");

    const derivedMonth = monthKeyFromDate(goalDate);

    setGoals((g) => [
      ...g,
      {
        id: Date.now(),
        name,
        target: t,
        goalDate, // exact date
        month: derivedMonth, // "Oct 2025" → works with getNetForMonth
      },
    ]);

    setName("");
    setTarget("");
    setGoalDate("");
  }

  function removeGoal(id) {
    setGoals((g) => g.filter((x) => x.id !== id));
  }

  function addAdjustment() {
    const amt = Number(adjAmount);
    if (!Number.isFinite(amt) || amt === 0)
      return alert("Enter a non-zero amount");
    setAdjustments((prev) => [
      ...prev,
      {
        id: Date.now(),
        amount: amt,
        type: adjType,
        memo: adjMemo || "",
        date: Date.now(),
      },
    ]);
    setAdjAmount("");
    setAdjMemo("");
  }

  function editAdjustment(id) {
    const a = adjustments.find((x) => x.id === id);
    if (!a) return;
    const newAmt = prompt("Enter new amount:", String(a.amount));
    if (newAmt === null) return;
    const num = Number(newAmt);
    if (!Number.isFinite(num)) return alert("Invalid amount");
    const newMemo = prompt("Edit memo:", a.memo || "") ?? a.memo;
    setAdjustments((prev) =>
      prev.map((x) => (x.id === id ? { ...x, amount: num, memo: newMemo } : x))
    );
  }

  function deleteAdjustment(id) {
    setAdjustments((prev) => prev.filter((x) => x.id !== id));
  }

  const totalNetYTD = useMemo(() => getYearToDateNet(), []);
  const { enriched: enrichedGoals, totals } = useMemo(() => {
    return allocateGoalsAndTotals(goals, totalNetYTD, adjustments);
  }, [goals, totalNetYTD, adjustments]);

  const pageStyle = {
    background: "#f9fafb",
    minHeight: "100vh",
    padding: "36px 20px",
  };
  const containerStyle = { maxWidth: 900, margin: "0 auto" };
  const cardStyle = {
    background: "white",
    marginTop: "10px",
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
    width: "90%",
  };
  const input2 = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
    width: "100%",
   
  };
  const input3 = {
    padding: "10px 12px",

    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
    width: "90%",

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
  const breakdownData = enrichedGoals.map((g) => ({
    name: g.name,
    value: g.saved,
  }));
  const remainingData = enrichedGoals.map((g) => ({
    name: g.name,
    value: g.remaining,
  }));

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
        <div
          style={{
            ...cardStyle,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
            marginTop: 20,
            marginBottom: 20,
            padding: 20,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#6b7280" }}>Total Goals</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
              {goals.length}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#6b7280" }}>Goals Reached</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981" }}>
              {enrichedGoals.filter((g) => g.remaining === 0).length}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              Savings Available
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b" }}>
              {fmt(totals.remainingAfterAll)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              Overall Progress
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#7c3aed" }}>
              {enrichedGoals.length === 0
                ? "0%"
                : Math.round(
                    enrichedGoals.reduce((acc, g) => acc + (g.pct || 0), 0) /
                      enrichedGoals.length
                  ) + "%"}
            </div>
          </div>
        </div>
        <div
          style={{
            ...cardStyle,
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            padding: 20,
          }}
        >
          <div style={{ flex: 1, textAlign: "center" }}>
            <h3>Savings Breakdown</h3>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginTop: -20,
              }}
            >
              <PieChart width={260} height={260}>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div style={{ marginTop: 0, textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#6b7280" }}>Total Saved</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>
                {fmt(totals.totalSaved)}
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              {breakdownData.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: COLORS[idx % COLORS.length],
                    }}
                  />
                  <span style={{ fontSize: 14 }}>
                    {item.name}: <b>{fmt(item.value)}</b>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <h3>Remaining Breakdown</h3>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginTop: -20,
              }}
            >
              <PieChart width={260} height={260}>
                <Pie
                  data={remainingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {remainingData.map((entry, index) => (
                    <Cell
                      key={`cell-rem-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div style={{ marginTop: 0 }}>
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Remaining Total
              </div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>
                {fmt(
                  enrichedGoals.reduce((sum, g) => sum + (g.remaining || 0), 0)
                )}
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              {remainingData.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: COLORS[idx % COLORS.length],
                    }}
                  />
                  <span style={{ fontSize: 14 }}>
                    {item.name}: <b>{fmt(item.value)}</b>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <h3>Year-To-Date Summary</h3>
          <p>
            Total Net for {new Date().getFullYear()}:{" "}
            <b>{fmt(totals.totalNet)}</b>
          </p>
          <p>
            Adjustments included: <b>{fmt(totals.adjTotal)}</b>
          </p>
          <p>
            Total pool (net + adjustments): <b>{fmt(totals.totalPool)}</b>
          </p>
          <p>
            Total allocated to goals: <b>{fmt(totals.totalSaved)}</b>
          </p>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Create a Goal</h3>
          <form
            onSubmit={addGoal}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px 220px auto",
              columnGap: "55px", // ✅ this replaces marginRight

              gap: 25,
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
              style={input2}
              type="number"
              min="1"
              placeholder="Target amount (e.g., 3000)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            {/* Date of goal */}
            <input
              style={input}
              type="date"
              value={goalDate}
              onChange={(e) => setGoalDate(e.target.value)}
            />
            {/* Date of Goal end */}

            <button style={btn} type="submit">
              Add Goal
            </button>
          </form>
          <p style={{ ...small, marginTop: 8 }}>
            We calculate progress using the aggregated pool (YTD net +
            adjustments) shared across your goals.
          </p>
        </div>
        <div style={{ marginTop: 14 }}>
          {enrichedGoals.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ ...small }}>No goals yet. Add one above!</p>
            </div>
          ) : (
            enrichedGoals.map((g) => (
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
                      {g.goalDate && (
                        <>
                          Goal Date: <b>{formatGoalDate(g.goalDate)}</b> •{" "}
                        </>
                      )}
                      Target: <b>{fmt(g.target)}</b>• Net so far (remaining
                      AFTER this goal): <b>{fmt(g.net)}</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={{ ...btn, background: "#f59e0b" }}
                      onClick={() => {
                        const val = prompt(
                          "Enter manual allocation amount (leave empty to clear):",
                          g.manualAllocation ?? ""
                        );
                        if (val === null) return;
                        if (val === "") {
                          setGoals((prev) =>
                            prev.map((x) =>
                              x.id === g.id
                                ? { ...x, manualAllocation: undefined }
                                : x
                            )
                          );
                          return;
                        }
                        const num = Number(val);
                        if (!Number.isFinite(num) || num < 0)
                          return alert("Invalid amount");
                        setGoals((prev) =>
                          prev.map((x) =>
                            x.id === g.id ? { ...x, manualAllocation: num } : x
                          )
                        );
                      }}
                    >
                      Edit
                    </button>

                    <button onClick={() => removeGoal(g.id)} style={deleteBtn}>
                      Delete
                    </button>
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
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <h3>Add Adjustment</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              style={input}
              placeholder="Amount"
              type="number"
              onChange={(e) => setAdjAmount(e.target.value)}
              value={adjAmount}
            />
            <select
              style={selectStyle}
              value={adjType}
              onChange={(e) => setAdjType(e.target.value)}
            >
              <option value="income">Income</option>
              <option value="outcome">Outcome</option>
            </select>
            <input
              style={input}
              placeholder="Memo"
              value={adjMemo}
              onChange={(e) => setAdjMemo(e.target.value)}
            />
            <button style={btn} onClick={addAdjustment}>
              Add
            </button>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <h4 style={{ marginBottom: 10 }}>Adjustments</h4>
          {adjustments.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No adjustments yet.</p>
          ) : (
            adjustments.map((adj) => (
              <div
                key={adj.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <div>
                    <b
                      style={{
                        color: adj.type === "income" ? "#059669" : "#ef4444",
                      }}
                    >
                      {adj.type === "income" ? "+" : "-"}
                    </b>{" "}
                    {fmt(adj.amount)}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>
                    {adj.memo || "No memo"} •{" "}
                    {new Date(adj.date).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={{
                      padding: "6px 10px",
                      background: "#f59e0b",
                      borderRadius: 8,
                      color: "#fff",
                      border: "none",
                    }}
                    onClick={() => editAdjustment(adj.id)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      padding: "6px 10px",
                      background: "#ef4444",
                      borderRadius: 8,
                      color: "#fff",
                      border: "none",
                    }}
                    onClick={() => deleteAdjustment(adj.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function getUserProgress() {
  const goalsRaw = localStorage.getItem("goals");
  const goals = goalsRaw ? JSON.parse(goalsRaw) : [];
  if (goals.length === 0) return 0;
  const totalPct = goals.reduce((acc, g) => {
    const net = Math.max(0, getNetForMonth(g.month));
    const target = Math.max(0, Number(g.target) || 0);
    if (target === 0) return acc;
    const pct = Math.max(0, Math.min(100, Math.round((net / target) * 100)));
    return acc + pct;
  }, 0);
  return Math.round(totalPct / goals.length);
}
