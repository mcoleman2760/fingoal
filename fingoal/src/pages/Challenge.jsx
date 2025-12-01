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
  updateSharedGoalProgress,
} from "../api/client";

import "./Challenge.css";
// import "./SharedGoals.css";

export default function ChallengeAndSharedGoals() {
  const { user } = useAuth();
  const meProgressFallback = getUserProgress();

  // TAB STATE
  const [activeTab, setActiveTab] = useState("challenge");

  // SAVINGS CHALLENGE STATE
  const [serverFriends, setServerFriends] = useState([]);
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [errChallenge, setErrChallenge] = useState("");

  const [newFriend, setNewFriend] = useState("");
  const [avatar, setAvatar] = useState("🐱");
  const [badge, setBadge] = useState("New Challenger");
  const [message, setMessage] = useState("");
  const [xpPopup, setXpPopup] = useState(null);

  // SHARED GOALS STATE
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [errGoals, setErrGoals] = useState("");

  // LOAD FRIENDS + LEADERBOARD
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
      } catch (e) {
        if (mounted) setErrChallenge(e?.message || "Failed to load friends");
      } finally {
        if (mounted) setLoadingChallenge(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // LOAD SHARED GOALS
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErrGoals("");
        setLoadingGoals(true);
        const res = await fetchSharedGoals();
        if (!mounted) return;
        setGoals(res.sharedGoals || []);
      } catch (e) {
        if (mounted) setErrGoals(e?.message || "Failed to load shared goals");
      } finally {
        if (mounted) setLoadingGoals(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ADD FRIEND
  const addFriend = async () => {
    const friendUsername = newFriend.trim();
    if (!friendUsername) return;

    setErrChallenge("");
    setLoadingChallenge(true);

    try {
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
    } catch (e) {
      setErrChallenge(e?.message || "Failed to add friend");
    } finally {
      setLoadingChallenge(false);
    }
  };

  // REMOVE FRIEND
  const removeFriend = async (friendId) => {
    setErrChallenge("");

    try {
      const [{ friends }, { leaderboard }] = await Promise.all([
        apiRemoveFriend(friendId),
        fetchFriendsLeaderboard(),
      ]);
      setServerFriends(friends || []);
      setLeaderboardRows(leaderboard || []);
    } catch (e) {
      setErrChallenge(e?.message || "Failed to remove friend");
    }
  };

  // SHARED GOAL CONTRIBUTION
  const contribute = async (goalId, amount) => {
    setErrGoals("");
    try {
      const updatedGoal = await updateSharedGoalProgress(goalId, amount);
      setGoals((prev) => prev.map((g) => (g._id === goalId ? updatedGoal : g)));
    } catch (e) {
      setErrGoals(e?.message || "Failed to update goal");
    }
  };

  // FORMAT LEADERBOARD
  const displayRows = useMemo(() => {
    return leaderboardRows
      .map((row, i) => ({
        id: row._id,
        name:
          String(row.username) === String(user?.username)
            ? "You"
            : row.username,
        progress:
          row.progress ||
          (String(row.username) === String(user?.username)
            ? meProgressFallback
            : 0),
        xp: row.xp || 0,
        level: row.level || 1,
        avatar: ["🐱", "🐶", "🦊", "🐼", "🐯", "🐧", "🐸"][
          (row.username?.length || i) % 7
        ],
        badge:
          String(row.username) === String(user?.username)
            ? "My Journey"
            : "Goal Crusher",
        message:
          String(row.username) === String(user?.username)
            ? "Let's reach our goals together!"
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

      {/* CHALLENGE TAB */}
      {activeTab === "challenge" && (
        <div className="challenge-container old-theme">
          <h1 className="challenge-header">💰 Savings Challenge</h1>
          <p className="challenge-description">
            Compete with your friends and see who reaches their savings goals
            first!
          </p>

          {xpPopup && <div className="xp-popup">🎉 {xpPopup}</div>}

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
                  {friend.id !== "me" && String(friend.id).length === 24 && (
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
          {loadingGoals ? (
            <div>Loading shared goals…</div>
          ) : goals.length === 0 ? (
            <p>No shared goals yet.</p>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}
