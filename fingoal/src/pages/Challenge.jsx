// imports
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getUserProgress } from "./Savings";
import {
  fetchFriends,
  addFriend as apiAddFriend,
  removeFriend as apiRemoveFriend,
  fetchFriendsLeaderboard,
} from "../api/client";
import "./Challenge.css";

// ... keep AVATARS / BADGES constants if you like

export default function Challenge() {
  const { user } = useAuth();
  const meProgressFallback = getUserProgress(); // fallback if backend returns 0

  const [serverFriends, setServerFriends] = useState([]);
  const [leaderboardRows, setLeaderboardRows] = useState([]); // from backend
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form state unchanged...
  const [newFriend, setNewFriend] = useState("");
  const [avatar, setAvatar] = useState("🐱");
  const [badge, setBadge] = useState("New Challenger");
  const [message, setMessage] = useState("");
  const [xpPopup, setXpPopup] = useState(null); // null or message

  // load friends + leaderboard
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const [{ friends }, { leaderboard }] = await Promise.all([
          fetchFriends(),
          fetchFriendsLeaderboard(),
        ]);
        if (!mounted) return;
        setServerFriends(friends || []);
        setLeaderboardRows(leaderboard || []);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load friends");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const addFriend = async () => {
    const friendUsername = newFriend.trim();
    if (!friendUsername) return;
    setErr("");
    setMessage("");
    setLoading(true);

    try {
      const response = await apiAddFriend(friendUsername);
      setServerFriends(response.friends || []);

      const leaderboardResponse = await fetchFriendsLeaderboard();
      setLeaderboardRows(leaderboardResponse.leaderboard || []);
      setNewFriend("");

      // Detect XP gain
      const currentUser = leaderboardResponse.leaderboard.find(
        (u) => u.username === user.username
      );
      if (currentUser?.xp % 100 === 20) {
        setXpPopup("+20 XP gained for adding a new friend!");
        // Auto-hide after 3 seconds
        setTimeout(() => setXpPopup(null), 3000);
      }
    } catch (e) {
      setErr(e?.message || "Failed to add friend");
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId) => {
    setErr("");
    try {
      const [{ friends }, { leaderboard }] = await Promise.all([
        apiRemoveFriend(friendId),
        fetchFriendsLeaderboard(),
      ]);
      setServerFriends(friends || []);
      setLeaderboardRows(leaderboard || []);
    } catch (e) {
      setErr(e?.message || "Failed to remove friend");
    }
  };

  // Turn leaderboardRows into display cards (keep your styling)
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

  // ...render stays same, but use displayRows and removeFriend
  return (
    <div className="challenge-container old-theme">
      <h1 className="challenge-header">💰 Savings Challenge</h1>
      <p className="challenge-description">
        Compete with your friends and see who reaches their savings goals first!
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
        {err && (
          <div style={{ color: "#b91c1c", marginTop: ".5rem" }}>{err}</div>
        )}
      </div>

      {loading ? (
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
                  style={{
                    marginLeft: 8,
                    padding: "6px 10px",
                    borderRadius: 8,
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
