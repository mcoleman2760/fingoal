import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Intro.css";

export default function Intro() {
  const { user } = useAuth();

  return (
    <div className="introPage">
      <div className="introContainer">
        {/* Hero */}
        <div className="heroCard">
          <div className="heroLeft">
            <div className="heroBadge">FinGoal Dashboard</div>
            <h1 className="heroTitle">
              Welcome back, <span className="heroName">{user}</span> 👋
            </h1>
            <p className="heroSub">
              Upload transactions, track spending, and move your savings goals forward.
            </p>

            <div className="heroActions">
              <Link className="btnPrimary" to="/upload">
                Upload statement
              </Link>
              <Link className="btnGhost" to="/savings">
                View goals
              </Link>
            </div>
          </div>

          <div className="heroRight">
            <div className="miniStat">
              <div className="miniLabel">Today’s focus</div>
              <div className="miniValue">Stay consistent</div>
              <div className="miniHint">Small wins add up.</div>
            </div>
            <div className="miniStat">
              <div className="miniLabel">Tip</div>
              <div className="miniValue">Upload CSV</div>
              <div className="miniHint">Fastest + most accurate.</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="sectionTitle">Quick actions</h2>
        <div className="grid3">
          <Link to="/upload" className="actionCard">
            <div className="actionIcon">⬆️</div>
            <div className="actionTitle">Upload</div>
            <div className="actionText">Add new transactions (CSV/PDF).</div>
          </Link>

          <Link to="/incomeOutcome" className="actionCard">
            <div className="actionIcon">💸</div>
            <div className="actionTitle">Income / Outcome</div>
            <div className="actionText">See monthly net and trends.</div>
          </Link>

          <Link to="/spending" className="actionCard">
            <div className="actionIcon">📊</div>
            <div className="actionTitle">Spending</div>
            <div className="actionText">Understand where money goes.</div>
          </Link>
        </div>

        {/* Secondary cards */}
        <h2 className="sectionTitle">Keep going</h2>
        <div className="grid2">
          <div className="infoCard">
            <div className="infoTitle">Savings goals</div>
            <div className="infoText">
              Set a goal like “Trip to Paris” and track progress automatically.
            </div>
            <Link className="linkArrow" to="/savings">
              Go to Savings →
            </Link>
          </div>

          <div className="infoCard">
            <div className="infoTitle">Friends</div>
            <div className="infoText">
              Share goals and keep each other motivated with friendly competition.
            </div>
            <Link className="linkArrow" to="/friends">
              Go to Friends →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}