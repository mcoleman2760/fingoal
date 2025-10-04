// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

// import Home from "./pages/Home";
// import IncomeOutcome from "./pages/IncomeOutcome";
// import Spending from "./pages/Spending";
// import Savings from "./pages/Savings";
// import Challenge from "./pages/Challenge";

// export default function App() {
//   return (
//     <Router>
//       <div>
//         <nav style={{ padding: "10px", background: "#f0f0f0" }}>
//           <Link to="/" style={{ marginRight: 10 }}>Home</Link>
//           <Link to="/income-outcome" style={{ marginRight: 10 }}>Income/Outcome</Link>
//           <Link to="/savings" style={{ marginRight: 10 }}>Savings</Link>
//           <Link to="/spending" style={{ marginRight: 10 }}>Spending</Link>
//           <Link to="/challenge">Challenge</Link>
//         </nav>

//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/income-outcome" element={<IncomeOutcome />} />
//           <Route path="/spending" element={<Spending />} />
//           <Route path="/savings" element={<Savings />} />
//           <Route path="/challenge" element={<Challenge />} />

//           {/* redirect old paths */}
//           <Route path="/home" element={<Navigate to="/" replace />} />
//           <Route path="/finance" element={<Navigate to="/income-outcome" replace />} />

//           {/* fallback */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

// import Home from "./pages/Home";
// import IncomeOutcome from "./pages/IncomeOutcome";
// import Spending from "./pages/Spending";
// import Savings from "./pages/Savings";
// import Challenge from "./pages/Challenge";

// import { AuthProvider, useAuth } from "./auth/AuthContext";
// import ProtectedRoute from "./auth/ProtectedRoute";

// function Nav() {
//   const { user, signOut } = useAuth();
//   return (
//     <nav style={{ padding: "10px", background: "#f0f0f0" }}>
//       <Link to="/" style={{ marginRight: 10 }}>Home</Link>
//       <Link to="/income-outcome" style={{ marginRight: 10 }}>Income/Outcome</Link>
//       <Link to="/savings" style={{ marginRight: 10 }}>Savings</Link>
//       <Link to="/spending" style={{ marginRight: 10 }}>Spending</Link>
//       <Link to="/challenge" style={{ marginRight: 10 }}>Challenge</Link>
//       {user ? <button onClick={signOut} style={{ marginLeft: 10 }}>Sign out ({user.username})</button> : null}
//     </nav>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Nav />
//         <Routes>
//           {/* Public */}
//           <Route path="/" element={<Home />} />
//           <Route path="/finance" element={<Navigate to="/income-outcome" replace />} />

//           {/* Protected */}
//           <Route path="/income-outcome" element={<ProtectedRoute><IncomeOutcome /></ProtectedRoute>} />
//           <Route path="/spending"       element={<ProtectedRoute><Spending /></ProtectedRoute>} />
//           <Route path="/savings"        element={<ProtectedRoute><Savings /></ProtectedRoute>} />
//           <Route path="/challenge"      element={<ProtectedRoute><Challenge /></ProtectedRoute>} />

//           {/* Fallback */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import IncomeOutcome from "./pages/IncomeOutcome";
import Spending from "./pages/Spending";
import Savings from "./pages/Savings";
import Challenge from "./pages/Challenge";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

function Nav() {
  const { user, signOut } = useAuth();
  return (
    <nav style={{ padding: "10px", background: "#f0f0f0" }}>
      <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
      <Link to="/income-outcome" style={{ marginRight: "15px" }}>Income/Outcome</Link>
      <Link to="/savings" style={{ marginRight: "15px" }}>Savings</Link>
      <Link to="/spending" style={{ marginRight: "15px" }}>Spending</Link>
      <Link to="/challenge" style={{ marginRight: "15px" }}>Challenge</Link>
      {user && (
        <button onClick={signOut} style={{ marginLeft: "15px" }}>
          Sign out ({user.username})
        </button>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/income-outcome"
            element={
              <ProtectedRoute>
                <IncomeOutcome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spending"
            element={
              <ProtectedRoute>
                <Spending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/savings"
            element={
              <ProtectedRoute>
                <Savings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenge"
            element={
              <ProtectedRoute>
                <Challenge />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
