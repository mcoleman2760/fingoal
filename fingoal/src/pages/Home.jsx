
// src/pages/Home.jsx
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { importCSVFile } from "../data/txStore";
import { uploadPDF } from "../data/txStore";
// For API upload, import from api/client (txStore doesn't export uploadStatement)
import { uploadStatement as uploadStatementToAPI } from "../api/client";
// import { importCSVFile, uploadFromFile as uploadStatementToAPI } from "../data/txStore";
import { registerUser } from "../api/client"; // reuse the backward-compatible export
import { resetAllTransactions } from "../data/txStore";


export default function Home() {
  // AuthContext exposes: user (string name), login(email,pw), logout()
  const { user, login, logout } = useAuth();

  // auth UI state
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // upload UI state
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      if (mode === "signin") {
        if (!email || !password) return setErr("Please enter email and password.");
        await login(email, password);
        setOk("Signed in!");
      } else {
        if (!email || !password || !username) {
          return setErr("Please enter username, email, and password.");
        }
        // Register via API (sends { username, email, password })
        await registerUser({ username, email, password });

        // Then log in to establish app state
        await login(email, password);
        setOk("Account created and signed in!");
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e.message ||
        "Request failed";
      setErr(msg);
      console.error("Auth error:", e);
    }
  }

  function onFileChange(e) {
    setFiles(Array.from(e.target.files || []));
    setUploadStatus(null);
  }

  async function uploadStatements() {
    if (!files.length) return setUploadStatus("Choose at least one file.");
    let imported = 0, skipped = 0;
    const unsupportedFiles = [];
  
    for (const f of files) {
      if (!/\.csv$/i.test(f.name) && !/\.pdf$/i.test(f.name)) {
        skipped++;
        unsupportedFiles.push(f.name);
        continue;
      }
  
      try {
        if (/\.csv$/i.test(f.name)) {
          imported += await importCSVFile(f);
        } else if (/\.pdf$/i.test(f.name)) {
          const importedCount = await uploadPDF(f);
          if (importedCount === 0) skipped++; // PDF had no transactions
          imported += importedCount;
        }
      } catch (err) {
        console.error("Import error:", f.name, err.message);
        skipped++;
        unsupportedFiles.push(f.name);
      }
    }
  
    setUploadStatus(
      `Imported ${imported} transaction${imported !== 1 ? "s" : ""}.${skipped ? ` Skipped ${skipped} unsupported file(s): ${unsupportedFiles.join(", ")}` : ""}`
    );
  
    setFiles([]);
  }  

// ---------- signed-in view ----------
if (user) {
  async function handleReset() {
    if (!window.confirm("Are you sure you want to delete ALL transactions and reset to 0?")) return;
    try {
      const res = await fetch("http://localhost:5001/api/transactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("finGoal_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to reset transactions");
      const data = await res.json();
      alert(`✅ Reset complete — ${data.deleted || 0} transactions deleted.`);
      window.location.reload(); // refreshes UI (Income/Outcome back to 0)
    } catch (e) {
      console.error("Reset error:", e);
      alert("❌ Failed to reset transactions.");
    }
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "40px 20px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Welcome back, {user} 👋
            </h1>
            <button
              onClick={logout}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 22 }}>Upload Statements</h2>
            <p style={{ color: "#6b7280", marginBottom: 12 }}>
              Upload CSV or PDF exports from your bank.
            </p>

            <input type="file" multiple onChange={onFileChange} accept=".csv,.pdf" />

            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={uploadStatements}
                style={{
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Upload
              </button>

              <button
                onClick={() => {
                  setFiles([]);
                  setUploadStatus(null);
                }}
                style={{
                  background: "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>

              <button
                onClick={handleReset}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Reset All Transactions
              </button>
            </div>

            {files.length > 0 && (
              <ul style={{ marginTop: 16 }}>
                {files.map((f, i) => (
                  <li key={i}>
                    {f.name} ({Math.round(f.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            )}
            {uploadStatus && (
              <p style={{ color: "#065f46", marginTop: 10 }}>{uploadStatus}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- signed-out view ----------
  return (
    <div
      style={{
        background: "#f9fafb",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 30,
          borderRadius: 16,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 16 }}>
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h1>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            onClick={() => setMode("signin")}
            style={{
              marginRight: 10,
              background: mode === "signin" ? "#2563eb" : "#e5e7eb",
              color: mode === "signin" ? "white" : "#111827",
              border: "none",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            style={{
              background: mode === "signup" ? "#2563eb" : "#e5e7eb",
              color: mode === "signup" ? "white" : "#111827",
              border: "none",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuthSubmit} style={{ display: "grid", gap: 10 }}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {mode === "signup" ? "Create Account" : "Sign In"}
          </button>
          {err && <div style={{ color: "#dc2626", fontSize: 14 }}>{err}</div>}
          {ok && <div style={{ color: "#10b981", fontSize: 14 }}>{ok}</div>}
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  outline: "none",
};