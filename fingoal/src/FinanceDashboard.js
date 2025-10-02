import React from "react";
import "./App.css";

function FinanceDashboard() {
  return (
    <div className="finance-dashboard">
      {/* Header */}
      <div className="header">
        <button className="back-btn">←</button>
        <h2>Transaction</h2>
        <button className="menu-btn">⋯</button>
      </div>

      {/* Spending Overview */}
      <div className="spending-section">
        <div className="spending-info">
          <p>Spending, September</p>
          <h1>$12,950</h1>
        </div>
        <select className="month-select">
          <option>September</option>
          <option>October</option>
          <option>November</option>
        </select>
      </div>

      {/* Bar Chart */}
      <div className="bar-chart">
        <div className="bar">
          <div className="bar-fill" style={{ height: "60%" }}></div>
          <span>Jun</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ height: "40%" }}></div>
          <span>Jul</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ height: "25%" }}></div>
          <span>Aug</span>
        </div>
        <div className="bar active">
          <div className="bar-fill" style={{ height: "80%" }}></div>
          <span>Sept</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ height: "55%" }}></div>
          <span>Oct</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ height: "65%" }}></div>
          <span>Nov</span>
        </div>
      </div>

      {/* Transactions */}
      <div className="transactions">
        <div className="transactions-header">
          <h3>Transaction</h3>
          <span>→</span>
        </div>

        <div className="transaction-item">
          <div className="transaction-icon">💳</div>
          <div className="transaction-details">
            <p className="title">Dribbble Pro</p>
            <p className="date">5 September</p>
          </div>
          <p className="amount">$120,00</p>
        </div>

        <div className="transaction-item">
          <div className="transaction-icon">💳</div>
          <div className="transaction-details">
            <p className="title">Adobe Photoshop</p>
            <p className="date">5 September</p>
          </div>
          <p className="amount">$110,00</p>
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;
