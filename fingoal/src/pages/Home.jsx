
// import React, { useState } from "react";
// import { useAuth } from "../auth/AuthContext";

// export default function Home() {
//   const { user, signIn, signOut } = useAuth();
//   const [authMode, setAuthMode] = useState("signin");
//   const [signin, setSignin] = useState({ username: "", password: "" });

//   const [files, setFiles] = useState([]);
//   const [uploadStatus, setUploadStatus] = useState(null);

//   // -----------------------------
//   // Sign In / Sign Up Handlers
//   // -----------------------------
//   function handleSignIn(e) {
//     e.preventDefault();
//     if (!signin.username || !signin.password) {
//       alert("Enter both username and password");
//       return;
//     }
//     signIn({ username: signin.username, token: "fake-token" });
//   }

//   // -----------------------------
//   // File Upload Handlers
//   // -----------------------------
//   function onFileChange(e) {
//     setFiles(Array.from(e.target.files || []));
//     setUploadStatus(null);
//   }

//   function uploadStatements() {
//     if (!files.length) {
//       alert("Choose at least one file");
//       return;
//     }
//     setUploadStatus("Uploaded successfully (stub). Check console.");
//     console.log("Files uploaded:", files);
//   }

//   // -----------------------------
//   // If Signed In → show dashboard + uploads
//   // -----------------------------
//   if (user) {
//     return (
//       <div style={{ padding: 20 }}>
//         <h1>Welcome back, {user.username}!</h1>
//         <p>You are signed in.</p>
//         <button onClick={signOut} style={{ marginBottom: 20 }}>Sign Out</button>

//         {/* Upload Section (only after sign in) */}
//         <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
//           <h2>Upload Statements</h2>
//           <p>Accepted: CSV, PDF, XLSX.</p>
//           <input type="file" multiple onChange={onFileChange} accept=".csv,.pdf,.xlsx,.xls" />
//           <div style={{ marginTop: 10 }}>
//             <button onClick={uploadStatements} style={{ marginRight: 10 }}>Upload</button>
//             <button onClick={() => { setFiles([]); setUploadStatus(null); }}>Clear</button>
//           </div>
//           {files.length > 0 && (
//             <ul>
//               {files.map((f, i) => (
//                 <li key={i}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
//               ))}
//             </ul>
//           )}
//           {uploadStatus && <p>{uploadStatus}</p>}
//         </div>
//       </div>
//     );
//   }

//   // -----------------------------
//   // If Not Signed In → show login form only
//   // -----------------------------
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Home</h1>
//       <p>Welcome to Fingoal — please sign in or sign up.</p>

//       <div style={{ marginBottom: 10 }}>
//         <button onClick={() => setAuthMode("signin")}>Sign In</button>
//         <button onClick={() => setAuthMode("signup")} style={{ marginLeft: 10 }}>Sign Up</button>
//       </div>

//       {authMode === "signin" && (
//         <form onSubmit={handleSignIn}>
//           <input
//             type="text"
//             placeholder="Username"
//             value={signin.username}
//             onChange={(e) => setSignin({ ...signin, username: e.target.value })}
//           />
//           <br />
//           <input
//             type="password"
//             placeholder="Password"
//             value={signin.password}
//             onChange={(e) => setSignin({ ...signin, password: e.target.value })}
//           />
//           <br />
//           <button type="submit">Sign In</button>
//         </form>
//       )}

//       {authMode === "signup" && (
//         <p>[Sign-up form goes here]</p>
//       )}
//     </div>
//   );
// }

// add at top

// src/pages/Home.jsx
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { importCSVFile } from "../data/txStore";

export default function Home() {
  const { user, signIn, signOut } = useAuth();

  // auth UI state
  const [authMode, setAuthMode] = useState("signin");
  const [signin, setSignin] = useState({ username: "", password: "" });

  // upload UI state
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);

  // ---------- auth handlers ----------
  function handleSignIn(e) {
    e.preventDefault();
    if (!signin.username || !signin.password) {
      alert("Enter both username and password");
      return;
    }
    // stub auth; replace with backend later
    signIn({ username: signin.username, token: "fake-token" });
  }

  // ---------- upload handlers ----------
  function onFileChange(e) {
    setFiles(Array.from(e.target.files || []));
    setUploadStatus(null);
  }

  async function uploadStatements() {
    if (!files.length) {
      alert("Choose at least one file");
      return;
    }
    let imported = 0;
    let skipped = 0;

    for (const f of files) {
      if (!/\.csv$/i.test(f.name)) { skipped++; continue; }
      try {
        const count = await importCSVFile(f);
        imported += count;
      } catch (err) {
        console.error("Import error:", f.name, err);
        skipped++;
      }
    }
    setUploadStatus(`Imported ${imported} transactions.${skipped ? ` Skipped ${skipped} non-CSV file(s).` : ""}`);
    setFiles([]);
  }

  // ---------- signed-in view ----------
  if (user) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Welcome back, {user.username}!</h1>
        <button onClick={signOut} style={{ marginBottom: 20 }}>Sign out</button>

        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
          <h2>Upload Statements</h2>
          <p>Upload CSV exports from your bank. (PDF/XLSX coming later via backend.)</p>
          <input type="file" multiple onChange={onFileChange} accept=".csv" />
          <div style={{ marginTop: 10 }}>
            <button onClick={uploadStatements} style={{ marginRight: 10 }}>Upload</button>
            <button onClick={() => { setFiles([]); setUploadStatus(null); }}>Clear</button>
          </div>

          {files.length > 0 && (
            <ul style={{ marginTop: 10 }}>
              {files.map((f, i) => (
                <li key={i}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
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
    <div style={{ padding: 20 }}>
      <h1>Home</h1>
      <p>Welcome to Fingoal — please sign in or sign up.</p>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setAuthMode("signin")}>Sign In</button>
        <button onClick={() => setAuthMode("signup")} style={{ marginLeft: 10 }}>Sign Up</button>
      </div>

      {authMode === "signin" && (
        <form onSubmit={handleSignIn}>
          <input
            type="text"
            placeholder="Username"
            value={signin.username}
            onChange={(e) => setSignin({ ...signin, username: e.target.value })}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={signin.password}
            onChange={(e) => setSignin({ ...signin, password: e.target.value })}
          />
          <br />
          <button type="submit">Sign In</button>
        </form>
      )}

      {authMode === "signup" && (
        <p>[Sign-up form goes here]</p>
      )}
    </div>
  );
}
