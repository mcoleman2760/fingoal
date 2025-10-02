import React from "react";
import "./App.css";

function TransactionPage() {
  const transactions = [
    { name: "Dribbble Pro", date: "5 September", amount: "$120.00" },
    { name: "Adobe Photoshop", date: "5 September", amount: "$110.00" },
  ];

  return (
    <div className="transaction-page">
      {/* Header */}
      <div className="top-bar">
        <button className="nav-btn">←</button>
        <h3>Transaction</h3>
        <button className="nav-btn">⋯</button>
      </div>

      {/* Spending Overview */}
      <div className="spending-overview">
        <div className="overview-header">
          <div>
            <p className="subtext">Spending, September</p>
            <h2 className="amount-big">$12,950</h2>
          </div>
          <select className="month-select">
            <option>September</option>
            <option>August</option>
            <option>October</option>
          </select>
        </div>

        {/* Chart (simple bars with CSS) */}
        <div className="chart">
          <div className="bar" style={{ height: "60%" }}>
            <span>Jun</span>
          </div>
          <div className="bar" style={{ height: "40%" }}>
            <span>Jul</span>
          </div>
          <div className="bar" style={{ height: "25%" }}>
            <span>Aug</span>
          </div>
          <div className="bar active" style={{ height: "80%" }}>
            <span>Sept</span>
          </div>
          <div className="bar" style={{ height: "55%" }}>
            <span>Oct</span>
          </div>
          <div className="bar" style={{ height: "60%" }}>
            <span>Nov</span>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="transaction-list">
        <div className="list-header">
          <h3>Transaction</h3>
          <span className="arrow">→</span>
        </div>

        {transactions.map((t, i) => (
          <div key={i} className="transaction-item">
            <div className="left">
              <span className="circle">💳</span>
              <div>
                <p className="name">{t.name}</p>
                <p className="date">{t.date}</p>
              </div>
            </div>
            <div className="right">{t.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransactionPage;
