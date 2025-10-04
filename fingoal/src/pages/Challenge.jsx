import React from "react";
import { AuthProvide, useAuth } from "../auth/AuthContext"; // adjust the path
import { getUserProgress } from "./Savings"; // import the helper

import "./Challenge.css";

export default function Challenge() {
  const { user } = useAuth(); // get the logged-in user

  // build friends array inside the component

    const userProgress = getUserProgress();

  const friends = [
    { id: 1, name: "Alex", progress: 85 },
    { id: 2, name: "Jamie", progress: 72 },
    { id: 3, name: "Taylor", progress: 65 },
    { id: 4, name: "Jordan", progress: 90 },
    { id: 5, name: user?.username || "You", progress: userProgress }, // fallback if user not loaded yet
  ];

  return (
    <div className="challenge-page">
      <h2 className="challenge-title">Savings Challenge</h2>
      <p className="challenge-subtitle">
        Compete with friends to reach your goals!
      </p>

      <div className="leaderboard">
        {friends
          .sort((a, b) => b.progress - a.progress)
          .map((friend, index) => (
            <div className="friend-card" key={friend.id}>
              <span className="rank">#{index + 1}</span>
              <span className="name">{friend.name}</span>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${friend.progress}%` }}
                ></div>
              </div>
              <span className="percent">{friend.progress}%</span>
            </div>
          ))}
      </div>
    </div>
  );
}
