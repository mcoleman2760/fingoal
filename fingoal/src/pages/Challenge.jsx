import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getUserProgress } from "./Savings";
import "./Challenge.css";

export default function Challenge() {
  const { user } = useAuth();
  const userProgress = getUserProgress();

  const [friends, setFriends] = useState([
    { id: 1, name: "Alex", progress: 85, avatar: "🦊", badge: "Goal Crusher" },
    { id: 2, name: "Jamie", progress: 72, avatar: "🐼", badge: "Steady Saver" },
    { id: 3, name: "Taylor", progress: 65, avatar: "🐧", badge: "Budget Rookie" },
    { id: 4, name: "Jordan", progress: 90, avatar: "🐯", badge: "Top Saver" },
    {
      id: 5,
      name: user?.username || "You",
      progress: userProgress,
      avatar: "👤",
      badge: "My Journey",
      message: "Let's reach our goals together!",
    },
  ]);

  const [newFriend, setNewFriend] = useState("");
  const [avatar, setAvatar] = useState("🐱");
  const [badge, setBadge] = useState("New Challenger");
  const [message, setMessage] = useState("");

  const addFriend = () => {
    if (!newFriend.trim()) return;

    const newEntry = {
      id: friends.length + 1,
      name: newFriend.trim(),
      progress: Math.floor(Math.random() * 100),
      avatar,
      badge,
      message,
    };

    setFriends((prev) => [...prev, newEntry]);
    setNewFriend("");
    setMessage("");
  };

  return (
    <div className="challenge-container old-theme">
      <h1 className="challenge-header">💰 Savings Challenge</h1>
      <p className="challenge-description">
        Compete with your friends and see who reaches their savings goals first!
      </p>

      <div className="connect-section">
        <h3>Connect with Friends</h3>
        <div className="connect-fields">
          <input
            type="text"
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            placeholder="Friend's name"
            className="input-text"
          />
          <select
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="select-avatar"
          >
            <option>🐱</option>
            <option>🐶</option>
            <option>🦊</option>
            <option>🐼</option>
            <option>🐯</option>
            <option>🐧</option>
            <option>🐸</option>
          </select>
          <select
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="select-badge"
          >
            <option>New Challenger</option>
            <option>Goal Crusher</option>
            <option>Steady Saver</option>
            <option>Top Saver</option>
            <option>Motivator</option>
            <option>Budget Rookie</option>
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
      </div>

      <div className="leaderboard">
        {friends
          .sort((a, b) => b.progress - a.progress)
          .map((friend, index) => (
            <div className="friend-card old-color" key={friend.id}>
              <div className="friend-rank">#{index + 1}</div>
              <div className="friend-avatar">{friend.avatar}</div>
              <div className="friend-info">
                <div className="friend-name">
                  {friend.name} <span className="friend-badge">{friend.badge}</span>
                </div>
                <div className="progress-container">
                  <div
                    className="progress-fill"
                    style={{ width: `${friend.progress}%` }}
                  ></div>
                </div>
                <div className="friend-progress">{friend.progress}%</div>
                {friend.message && (
                  <div className="friend-message">“{friend.message}”</div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
