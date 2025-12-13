// Challenge.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getUserProgress } from "./Savings";
import {
  fetchFriends,
  addFriend as apiAddFriend,
  removeFriend as apiRemoveFriend,
  fetchFriendsLeaderboard,
  fetchSharedGoals,
  createSharedGoalAPI,
  updateSharedGoalProgress,
  deleteSharedGoal as deleteSharedGoalAPI,
} from "../api/client";
import "./Challenge.css";

export default function ChallengeAndSharedGoals() {
  const { user } = useAuth();
  const meProgressFallback = getUserProgress();

  const [activeTab, setActiveTab] = useState("challenge");

  // --- Savings Challenge ---
  const [serverFriends, setServerFriends] = useState([]);
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [errChallenge, setErrChallenge] = useState("");
  const [newFriend, setNewFriend] = useState("");
  const [avatar, setAvatar] = useState("🐱");
  const [badge, setBadge] = useState("New Challenger");
  const [message, setMessage] = useState("");
  const [xpPopup, setXpPopup] = useState(null);

  // --- Shared Goals ---
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [errGoals, setErrGoals] = useState("");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalMembers, setNewGoalMembers] = useState("");

  // --- Load friends + leaderboard ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErrChallenge("");
        setLoadingChallenge(true);
        const [{ friends }, { leaderboard }] = await Promise.all([
          fetchFriends(),
          fetchFriendsLeaderboard(),
        ]);
        if (!mounted) return;
        setServerFriends(friends || []);
        setLeaderboardRows(leaderboard || []);
      } catch {
        if (mounted) setErrChallenge("Failed to load friends");
      } finally {
        if (mounted) setLoadingChallenge(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // --- Load shared goals (with populated members) ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErrGoals("");
        setLoadingGoals(true);
        const res = await fetchSharedGoals(); // backend populates members
        if (!mounted) return;
        setGoals(res.sharedGoals || []);
      } catch {
        if (mounted) setErrGoals("Failed to load shared goals");
      } finally {
        if (mounted) setLoadingGoals(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // --- Add Friend ---
  const addFriend = async () => {
    const friendUsername = newFriend.trim();
    if (!friendUsername) return;
    try {
      setLoadingChallenge(true);
      const response = await apiAddFriend(friendUsername);
      setServerFriends(response.friends || []);

      const leaderboardResponse = await fetchFriendsLeaderboard();
      setLeaderboardRows(leaderboardResponse.leaderboard || []);
      setNewFriend("");

      const currentUser = leaderboardResponse.leaderboard.find(
        (u) => u.username === user.username
      );
      if (currentUser?.xp % 100 === 20) {
        setXpPopup("+20 XP gained for adding a new friend!");
        setTimeout(() => setXpPopup(null), 3000);
      }
    } catch {
      setErrChallenge("Failed to add friend");
    } finally {
      setLoadingChallenge(false);
    }
  };

  // --- Remove Friend ---
  const removeFriend = async (friendId) => {
    try {
      const [{ friends }, { leaderboard }] = await Promise.all([
        apiRemoveFriend(friendId),
        fetchFriendsLeaderboard(),
      ]);
      setServerFriends(friends || []);
      setLeaderboardRows(leaderboard || []);
    } catch {
      setErrChallenge("Failed to remove friend");
    }
  };

  // --- Contribute to shared goal ---
  const contribute = async (goalId, amount) => {
    try {
      const updated = await updateSharedGoalProgress(goalId, amount);

      setGoals((prev) =>
        prev.map((g) =>
          g._id === updated._id
            ? { ...updated, _contribution: "" } // reset input
            : g
        )
      );
    } catch {
      setErrGoals("Failed to update goal");
    }
  };


  // --- Create shared goal ---
  const createSharedGoal = async () => {
    // Split and clean members input
    
    const members = newGoalMembers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Always include current user first
      members.unshift(user);
    


    // Check we have at least one member
    if (members.length === 0) {
      setErrGoals("You must include at least one member.");
      return;
    }

    try {
      const goal = await createSharedGoalAPI({
        title: newGoalTitle.trim(),
        targetAmount: Number(newGoalTarget),
        members,
      });

      // Add to local state
      setGoals((prev) => [...prev, goal]);
      setNewGoalTitle("");
      setNewGoalTarget("");
      setNewGoalMembers("");
    } catch (err) {
      console.error(err);
      setErrGoals(
        err?.response?.data?.message || "Failed to create shared goal"
      );
    }
  };

  // --- Delete shared goal ---
  const deleteSharedGoal = async (goalId) => {
    try {
      await deleteSharedGoalAPI(goalId);
      setGoals((prev) => prev.filter((g) => g._id !== goalId));
    } catch {
      setErrGoals("Failed to delete goal");
    }
  };

  // --- Leaderboard rows ---
  const displayRows = useMemo(() => {
    const avatars = ["🐱", "🐶", "🦊", "🐼", "🐯", "🐧", "🐸"];
    return leaderboardRows
      .map((row, i) => ({
        id: row._id,
        name: row.username === user?.username ? "You" : row.username,
        progress:
          row.progress ||
          (row.username === user?.username ? meProgressFallback : 0),
        xp: row.xp || 0,
        level: row.level || 1,
        avatar: avatars[i % avatars.length],
        badge: row.username === user?.username ? "My Journey" : "Goal Crusher",
        message:
          row.username === user?.username
            ? "Let’s reach our goals together!"
            : "",
      }))
      .sort((a, b) => b.progress - a.progress);
  }, [leaderboardRows, user?.username, meProgressFallback]);

  return (
    <div className="combined-page">
      {/* TAB BAR */}
      <div className="tab-bar">
        <button
          className={`tab-button ${activeTab === "challenge" ? "active" : ""}`}
          onClick={() => setActiveTab("challenge")}
        >
          💰 Savings Challenge
        </button>
        <button
          className={`tab-button ${activeTab === "goals" ? "active" : ""}`}
          onClick={() => setActiveTab("goals")}
        >
          🌟 Shared Goals
        </button>
      </div>

      {/* SAVINGS CHALLENGE TAB */}
      {activeTab === "challenge" && (
        <div className="challenge-container old-theme">
          <h1 className="challenge-header">💰 Savings Challenge</h1>

          {xpPopup && <div className="xp-popup">{xpPopup}</div>}

          <div className="connect-section">
            <h3>Connect with Friends</h3>
            <div className="connect-fields">
              <input
                type="text"
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
                placeholder="Friend's name (username)"
                className="input-text"
              />
              <select
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="select-avatar"
              >
                {["🐱", "🐶", "🦊", "🐼", "🐯", "🐧", "🐸"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="select-badge"
              >
                {[
                  "New Challenger",
                  "Goal Crusher",
                  "Steady Saver",
                  "Top Saver",
                  "Motivator",
                  "Budget Rookie",
                ].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Motivational message"
                className="input-text"
              />
              <button className="btn-add" onClick={addFriend}>
                ➕ Add Friend
              </button>
            </div>
            {errChallenge && <div className="error-text">{errChallenge}</div>}
          </div>

          {loadingChallenge ? (
            <div>Loading…</div>
          ) : (
            <div className="leaderboard">
              {displayRows.map((friend, index) => (
                <div className="friend-card old-color" key={friend.id}>
                  <div className="friend-rank">#{index + 1}</div>
                  <div className="friend-avatar">{friend.avatar}</div>
                  <div className="friend-info">
                    <div className="friend-name">
                      {friend.name}{" "}
                      <span className="friend-badge">{friend.badge}</span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-fill"
                        style={{ width: `${friend.progress}%` }}
                      />
                    </div>
                    <div className="friend-progress">{friend.progress}%</div>
                    <div className="friend-xp-level">
                      <span className="level-badge">Level {friend.level}</span>
                      <span className="xp-amount">{friend.xp} XP</span>
                    </div>
                    {friend.message && (
                      <div className="friend-message">“{friend.message}”</div>
                    )}
                  </div>
                  {friend.name !== "You" && (
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SHARED GOALS TAB */}
      {activeTab === "goals" && (
        <div className="shared-goals-container">
          <h1>🌟 Shared Goals</h1>

          {errGoals && <div className="error">{errGoals}</div>}

          <div className="new-goal-form">
            <input
              type="text"
              value={newGoalTitle}
              placeholder="Goal title"
              onChange={(e) => setNewGoalTitle(e.target.value)}
            />
            <input
              type="number"
              value={newGoalTarget}
              placeholder="Target amount"
              onChange={(e) => setNewGoalTarget(e.target.value)}
            />
            <input
              type="text"
              value={newGoalMembers}
              placeholder="Members (comma separated usernames)"
              onChange={(e) => setNewGoalMembers(e.target.value)}
            />
            <button onClick={createSharedGoal}>Create Goal</button>
          </div>

          {loadingGoals ? (
            <p>Loading…</p>
          ) : goals.length === 0 ? (
            <p>No shared goals yet.</p>
          ) : (
            <div className="goals-list">
              {goals.map((goal) => {
                // Extract usernames from populated members
                const otherMembers = goal.members
                  ?.filter((m) => m.username !== user.username)
                  .map((m) => m.username);

                return (
                  <div key={goal._id} className="goal-card">
                    <h3>{goal.title}</h3>
                    <p className="goal-members">
                      👥 Members:{" "}
                      {Array.isArray(goal.members)
                        ? goal.members
                            .map((m) =>
                              typeof m === "string" ? m : m.username
                            ) // convert objects to strings
                            .filter((m) => m !== user.username)
                            .join(", ") || "No friends listed"
                        : "No friends listed"}
                    </p>

                    <p>
                      ${goal.currentAmount ?? 0} / ${goal.targetAmount} saved
                    </p>

                    <div className="goal-actions">
                      <input
                        type="number"
                        min="1"
                        placeholder="Amount"
                        value={goal._contribution ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          setGoals((prev) =>
                            prev.map((g) =>
                              g._id === goal._id
                                ? { ...g, _contribution: value }
                                : g
                            )
                          );
                        }}
                        className="contribution-input"
                      />

                      <button
                        onClick={() => {
                          const amount = Number(goal._contribution);
                          if (!amount || amount <= 0) return;

                          contribute(goal._id, amount);
                        }}
                      >
                        Add
                      </button>

                      <button
                        className="remove-btn"
                        onClick={() => deleteSharedGoal(goal._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
