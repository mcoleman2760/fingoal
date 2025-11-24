import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchSharedGoals, updateSharedGoalProgress } from "../api/client"; // make sure these API functions exist
import "./SharedGoals.css";

export default function SharedGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Fetch shared goals from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchSharedGoals();
        if (!mounted) return;
        setGoals(res.sharedGoals || []);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load shared goals");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Update progress for a shared goal
  const contribute = async (goalId, amount) => {
    setErr("");
    try {
      const updatedGoal = await updateSharedGoalProgress(goalId, amount);
      setGoals((prev) => prev.map((g) => (g._id === goalId ? updatedGoal : g)));
    } catch (e) {
      setErr(e?.message || "Failed to update goal progress");
    }
  };

  if (loading) return <div>Loading shared goals…</div>;

  return (
    <div className="shared-goals-container">
      <h1>🌟 Shared Goals</h1>
      {err && <div className="error">{err}</div>}
      {goals.length === 0 && <p>No shared goals yet.</p>}

      <div className="goals-list">
        {goals.map((goal) => (
          <div key={goal._id} className="goal-card">
            <h3>{goal.title}</h3>
            <p>{goal.description}</p>
            <div className="progress-bar-container">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    100,
                    (goal.currentAmount / goal.targetAmount) * 100
                  )}%`,
                }}
              />
            </div>
            <p>
              {goal.currentAmount} / {goal.targetAmount} contributed
            </p>
            <div className="goal-actions">
              <button
                onClick={() => contribute(goal._id, 5)}
                className="btn-contribute"
              >
                +5
              </button>
              <button
                onClick={() => contribute(goal._id, 10)}
                className="btn-contribute"
              >
                +10
              </button>
              <button
                onClick={() => contribute(goal._id, 20)}
                className="btn-contribute"
              >
                +20
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
