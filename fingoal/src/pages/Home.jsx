
// src/pages/Home.jsx
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { importCSVFile } from "../data/txStore";
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
  const [username, setUsername] = useState(""); // ✅ backend expects 'username'
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
    let imported = 0,
      skipped = 0;

    for (const f of files) {
      if (!/\.csv$/i.test(f.name) && !/\.pdf$/i.test(f.name)) {
        skipped++;
        continue;
      }
      try {
        if (/\.csv$/i.test(f.name)) {
          const count = await importCSVFile(f);
          imported += count || 0;
        } else {
          await uploadStatementToAPI(f);
          imported++;
        }
      } catch (err) {
        console.error("Import error:", f.name, err);
        skipped++;
      }
    }

    setUploadStatus(
      `Imported ${imported} transactions.${skipped ? ` Skipped ${skipped} unsupported file(s).` : ""}`
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
    <div style={{ padding: 20 }}>
      <h1>Welcome back, {user}!</h1>
      <button onClick={logout} style={{ marginBottom: 20 }}>
        Sign out
      </button>

      <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, marginBottom: 20 }}>
        <h2>Upload Statements</h2>
        <p>Upload CSV or PDF exports from your bank.</p>
        <input type="file" multiple onChange={onFileChange} accept=".csv,.pdf" />
        <div style={{ marginTop: 10 }}>
          <button onClick={uploadStatements} style={{ marginRight: 10 }}>
            Upload
          </button>
          <button
            onClick={() => {
              setFiles([]);
              setUploadStatus(null);
            }}
            style={{ marginRight: 10 }}
          >
            Clear
          </button>
          {/* ✅ Reset button */}
          <button
            onClick={handleReset}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Reset All Transactions
          </button>
        </div>

        {files.length > 0 && (
          <ul style={{ marginTop: 10 }}>
            {files.map((f, i) => (
              <li key={i}>
                {f.name} ({Math.round(f.size / 1024)} KB)
              </li>
            ))}
          </ul>
        )}
        {uploadStatus && <p style={{ marginTop: 10 }}>{uploadStatus}</p>}
      </div>
    </div>
  );
}

  // ---------- signed-out view ----------
  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h1>Home</h1>
      <p>Welcome to Fingoal — please sign in or sign up.</p>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode("signin")}>Sign In</button>
        <button onClick={() => setMode("signup")} style={{ marginLeft: 10 }}>
          Sign Up
        </button>
      </div>

      <form onSubmit={handleAuthSubmit} style={{ display: "grid", gap: 8 }}>
        {mode === "signup" && (
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
        {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
        {ok && <div style={{ color: "#065f46" }}>{ok}</div>}
      </form>
    </div>
  );
}
