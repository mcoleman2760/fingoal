import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TransactionPage from "./TransactionPage";
import FinanceDashboard from "./FinanceDashboard";

function App() {
  return (
    <Router>
      <div>
        {/* Navigation (for testing, you can remove later) */}
        <nav style={{ padding: "10px", background: "#f0f0f0" }}>
          <Link to="/home" style={{ marginRight: "10px" }}>
            Home
          </Link>
          <Link to="/finance">Income/Outcome</Link>

          <Link to="/finance" style={{ marginLeft: "10px" }}>
            Savings
          </Link>
          <Link to="/finance" style={{ marginLeft: "10px" }}>
            Spending
          </Link>
          <Link to="/finance" style={{ marginLeft: "10px" }}>
            Challenge
          </Link>
        </nav>

        {/* Define routes */}
        <Routes>
          <Route path="/home" element={<TransactionPage />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/" element={<TransactionPage />} /> {/* default */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
