// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { loginUser } from "../auth/authService";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       await loginUser({ email, password }); // backend call
//       navigate("/transactions"); // redirect on success
//     } catch (err) {
//       setError(err.response?.data?.error || "Invalid login credentials");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           style={{ width: "100%", marginBottom: 10, padding: 8 }}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           style={{ width: "100%", marginBottom: 10, padding: 8 }}
//         />
//         <button type="submit" style={{ width: "100%", padding: 10 }}>
//           Log In
//         </button>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//       </form>
//     </div>
//   );
// }

import React, { useState } from "react";
import { loginUser } from "../auth/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await loginUser({ email, password });
      window.location.href = "/transactions";
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    outline: "none",
    marginBottom: 10,
  };

  const btnStyle = {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            padding: 28,
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #eef2ff",
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: 6, color: "#2563eb" }}>Sign in</h1>
          <p style={{ color: "#6b7280", marginTop: 0, marginBottom: 18 }}>
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" style={btnStyle}>
                Sign in
              </button>
            </div>
          </form>

          {error && <p style={{ color: "#dc2626", marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}