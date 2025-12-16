// src/pages/Home.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { importCSVFile, uploadPDF } from "../data/txStore";
import api, { registerUser } from "../api/client";
import "./Home.css";

export default function Home() {
  // AuthContext exposes: user (string name), login(email,pw), logout()
  const { user, login } = useAuth();
  const navigate = useNavigate();

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
  const [busy, setBusy] = useState(false);

  const acceptedHint = useMemo(() => "CSV or PDF", []);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      if (mode === "signin") {
        // Your project redirects to /Login for sign-in UI
        navigate("/Login");
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

  function clearSelected() {
    setFiles([]);
    setUploadStatus(null);
  }

  async function uploadStatements() {
    if (!files.length) return setUploadStatus("Choose at least one file.");
    setBusy(true);
    setUploadStatus(null);

    let imported = 0;
    let skipped = 0;
    const unsupportedFiles = [];

    try {
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
          console.error("Import error:", f.name, err?.message);
          skipped++;
          unsupportedFiles.push(f.name);
        }
      }

      const msg =
        `Imported ${imported} transaction${imported !== 1 ? "s" : ""}.` +
        (skipped
          ? ` Skipped ${skipped} file(s): ${unsupportedFiles.join(", ")}`
          : "");

      setUploadStatus({ type: "success", text: msg });
      setFiles([]);
    } catch (e) {
      setUploadStatus({
        type: "error",
        text: "Upload failed. Check the console and try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  // ---------- signed-in view (UPLOAD PAGE) ----------
  if (user) {
    async function handleReset() {
      if (
        !window.confirm(
          "Are you sure you want to delete ALL transactions and reset to 0?"
        )
      )
        return;

      try {
        const { data } = await api.delete("/transactions");
        alert(`✅ Reset complete — ${data.deleted || 0} transactions deleted.`);
        window.location.reload();
      } catch (e) {
        console.error("Reset error:", e);
        alert("❌ Failed to reset transactions.");
      }
    }

    return (
      <div className="fg-page">
        <div className="fg-shell">
          <div className="fg-card">
            <div className="fg-cardHeader">
              <div className="fg-badge">Upload</div>
              <h2 className="fg-title">Upload Statements</h2>
              <p className="fg-subtitle">
                Add your bank exports to populate transactions automatically.
                <span className="fg-muted"> Accepted: {acceptedHint}</span>
              </p>
            </div>

            <div className="fg-drop">
              <div className="fg-dropLeft">
                <div className="fg-dropIcon" aria-hidden="true">
                  ⬆️
                </div>
                <div>
                  <div className="fg-dropTitle">Choose files to upload</div>
                  <div className="fg-dropHint">
                    Tip: you can select multiple files.
                  </div>
                </div>
              </div>

              <label className="fg-fileBtn">
                <input
                  className="fg-fileInput"
                  type="file"
                  multiple
                  onChange={onFileChange}
                  accept=".csv,.pdf"
                />
                Select files
              </label>
            </div>

            {files.length > 0 && (
              <div className="fg-files">
                <div className="fg-filesTop">
                  <div className="fg-filesTitle">
                    Selected ({files.length})
                  </div>
                  <button className="fg-linkBtn" onClick={clearSelected}>
                    Clear
                  </button>
                </div>

                <ul className="fg-fileList">
                  {files.map((f, i) => (
                    <li className="fg-fileItem" key={`${f.name}-${i}`}>
                      <div className="fg-fileName">{f.name}</div>
                      <div className="fg-fileMeta">
                        {Math.round(f.size / 1024)} KB
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="fg-actions">
              <button
                className="fg-btn fg-btnPrimary"
                onClick={uploadStatements}
                disabled={busy}
              >
                {busy ? "Uploading..." : "Upload"}
              </button>

              <button
                className="fg-btn fg-btnGhost"
                onClick={clearSelected}
                disabled={busy}
              >
                Clear
              </button>

              <button
                className="fg-btn fg-btnDanger"
                onClick={handleReset}
                disabled={busy}
                title="Deletes all transactions in the database"
              >
                Reset All Transactions
              </button>
            </div>

            {uploadStatus?.text && (
              <div
                className={
                  uploadStatus.type === "error"
                    ? "fg-alert fg-alertError"
                    : "fg-alert fg-alertSuccess"
                }
              >
                {uploadStatus.text}
              </div>
            )}

            <div className="fg-footer">
              <a href="/instructions" className="fg-help">
                Problems with uploading?
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- signed-out view ----------
  return (
    <div className="fg-authPage">
      <div className="fg-authCard">
        <h1 className="fg-authTitle">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h1>

        <div className="fg-authTabs">
          <button
            onClick={() => setMode("signin")}
            className={mode === "signin" ? "fg-tab fg-tabActive" : "fg-tab"}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={mode === "signup" ? "fg-tab fg-tabActive" : "fg-tab"}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuthSubmit} className="fg-authForm">
          {/* SIGN UP MODE */}
          {mode === "signup" && (
            <>
              <input
                className="fg-input"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <input
                className="fg-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                className="fg-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          {/* SIGN IN MODE → button only */}
          <button className="fg-btn fg-btnPrimary fg-authBtn" type="submit">
            {mode === "signup" ? "Create Account" : "Sign In Here"}
          </button>

          {err && <div className="fg-authMsg fg-authErr">{err}</div>}
          {ok && <div className="fg-authMsg fg-authOk">{ok}</div>}
        </form>
      </div>
    </div>
  );
}