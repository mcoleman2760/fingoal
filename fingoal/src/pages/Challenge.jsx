
// // src/pages/Challenge.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useAuth } from "../auth/AuthContext";
// import {
//   fetchFriends,
//   addFriend as apiAddFriend,
//   removeFriend as apiRemoveFriend,
//   fetchMySavingRate,        // ✅ use backend summary
//   // fetchFriendsLeaderboard // (optional if you wire it later)
// } from "../api/client";
// import "./Challenge.css";

// const AVATARS = ["🐱", "🐶", "🦊", "🐼", "🐯", "🐧", "🐸"];
// const BADGES = [
//   "New Challenger",
//   "Goal Crusher",
//   "Steady Saver",
//   "Top Saver",
//   "Motivator",
//   "Budget Rookie",
// ];

// export default function Challenge() {
//   const { user } = useAuth();

//   // Server data
//   const [serverFriends, setServerFriends] = useState([]);
//   const [myProgress, setMyProgress] = useState(0);

//   // UI state
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   // Form state (presentation only for now)
//   const [newFriend, setNewFriend] = useState("");
//   const [avatar, setAvatar] = useState(AVATARS[0]);
//   const [badge, setBadge] = useState(BADGES[0]);
//   const [message, setMessage] = useState("");

//   // ---------- Load my REAL saving rate from backend ----------
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const rate = await fetchMySavingRate(); // GET /api/statements -> { savingRate }
//         if (alive) setMyProgress(Number(rate) || 0);
//       } catch (e) {
//         if (alive) setMyProgress(0);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   // ---------- Load my friends list ----------
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setErr("");
//       setLoading(true);
//       try {
//         const { friends } = await fetchFriends(); // GET /api/friends
//         if (mounted) setServerFriends(friends || []);
//       } catch (e) {
//         if (mounted) setErr(e?.message || "Failed to load friends");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ---------- Mutations ----------
//   const addFriend = async () => {
//     const friendUsername = newFriend.trim();
//     if (!friendUsername) return;
//     setErr("");
//     try {
//       const { friends } = await apiAddFriend(friendUsername);
//       setServerFriends(friends || []);
//       setNewFriend("");
//       setMessage("");
//     } catch (e) {
//       setErr(e?.message || "Failed to add friend");
//     }
//   };

//   const removeFriend = async (friendId) => {
//     setErr("");
//     try {
//       const { friends } = await apiRemoveFriend(friendId);
//       setServerFriends(friends || []);
//     } catch (e) {
//       setErr(e?.message || "Failed to remove friend");
//     }
//   };

//   // ---------- Build leaderboard (friends are demo %, "You" uses real rate) ----------
//   const leaderboard = useMemo(() => {
//     const rows =
//       (serverFriends || []).map((f, i) => ({
//         id: f._id,
//         name: f.username,
//         progress: Math.floor(55 + Math.random() * 40), // demo progress for friends
//         avatar: AVATARS[(f.username?.length || i) % AVATARS.length],
//         badge: BADGES[(i + 1) % BADGES.length],
//         message: "",
//       })) || [];

//     // Always include "You" row with REAL server rate
//     rows.push({
//       id: "me",
//       name: user?.username || "You",
//       progress: Math.max(0, Math.min(100, Math.round(Number(myProgress) || 0))), // clamp 0..100
//       avatar: "👤",
//       badge: "My Journey",
//       message: "Let's reach our goals together!",
//     });

//     return rows.sort((a, b) => b.progress - a.progress);
//   }, [serverFriends, user?.username, myProgress]);

//   // ---------- UI ----------
//   return (
//     <div className="challenge-container old-theme">
//       <h1 className="challenge-header">💰 Savings Challenge</h1>
//       <p className="challenge-description">
//         Compete with your friends and see who reaches their savings goals first!
//       </p>

//       <div className="connect-section">
//         <h3>Connect with Friends</h3>
//         <div className="connect-fields">
//           <input
//             type="text"
//             value={newFriend}
//             onChange={(e) => setNewFriend(e.target.value)}
//             placeholder="Friend's name (username)"
//             className="input-text"
//           />
//           <select
//             value={avatar}
//             onChange={(e) => setAvatar(e.target.value)}
//             className="select-avatar"
//           >
//             {AVATARS.map((a) => (
//               <option key={a}>{a}</option>
//             ))}
//           </select>
//           <select
//             value={badge}
//             onChange={(e) => setBadge(e.target.value)}
//             className="select-badge"
//           >
//             {BADGES.map((b) => (
//               <option key={b}>{b}</option>
//             ))}
//           </select>
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Motivational message"
//             className="input-text"
//           />
//           <button className="btn-add" onClick={addFriend}>
//             ➕ Add Friend
//           </button>
//         </div>
//         {err && <div style={{ color: "#b91c1c", marginTop: ".5rem" }}>{err}</div>}
//       </div>

//       {loading ? (
//         <div>Loading…</div>
//       ) : (
//         <div className="leaderboard">
//           {leaderboard.map((friend, index) => (
//             <div className="friend-card old-color" key={friend.id}>
//               <div className="friend-rank">#{index + 1}</div>
//               <div className="friend-avatar">{friend.avatar}</div>
//               <div className="friend-info">
//                 <div className="friend-name">
//                   {friend.name} <span className="friend-badge">{friend.badge}</span>
//                 </div>
//                 <div className="progress-container">
//                   <div
//                     className="progress-fill"
//                     style={{ width: `${friend.progress}%` }}
//                   />
//                 </div>
//                 <div className="friend-progress">{friend.progress}%</div>
//                 {friend.message && (
//                   <div className="friend-message">“{friend.message}”</div>
//                 )}
//               </div>

//               {/* Show remove only for real friends (ObjectId-looking ids) */}
//               {friend.id !== "me" && String(friend.id).length === 24 && (
//                 <button
//                   onClick={() => removeFriend(friend.id)}
//                   style={{
//                     marginLeft: 8,
//                     padding: "6px 10px",
//                     borderRadius: 8,
//                     border: "1px solid #93c5fd",
//                     background: "white",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Remove
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


// imports
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getUserProgress } from "./Savings";
import {
  fetchFriends,
  addFriend as apiAddFriend,
  removeFriend as apiRemoveFriend,
  fetchFriendsLeaderboard,
} from "../api/client";
import "./Challenge.css";

// ... keep AVATARS / BADGES constants if you like

export default function Challenge() {
  const { user } = useAuth();
  const meProgressFallback = getUserProgress(); // fallback if backend returns 0

  const [serverFriends, setServerFriends] = useState([]);
  const [leaderboardRows, setLeaderboardRows] = useState([]); // from backend
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form state unchanged...
  const [newFriend, setNewFriend] = useState("");
  const [avatar, setAvatar] = useState("🐱");
  const [badge, setBadge] = useState("New Challenger");
  const [message, setMessage] = useState("");

  // load friends + leaderboard
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const [{ friends }, { leaderboard }] = await Promise.all([
          fetchFriends(),
          fetchFriendsLeaderboard(),
        ]);
        if (!mounted) return;
        setServerFriends(friends || []);
        setLeaderboardRows(leaderboard || []);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load friends");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const addFriend = async () => {
    const friendUsername = newFriend.trim();
    if (!friendUsername) return;
    setErr("");
    try {
      const [{ friends }, { leaderboard }] = await Promise.all([
        apiAddFriend(friendUsername),
        // call leaderboard again after mutation
        fetchFriendsLeaderboard(),
      ]);
      setServerFriends(friends || []);
      setLeaderboardRows(leaderboard || []);
      setNewFriend("");
      setMessage("");
    } catch (e) {
      setErr(e?.message || "Failed to add friend");
    }
  };

  const removeFriend = async (friendId) => {
    setErr("");
    try {
      const [{ friends }, { leaderboard }] = await Promise.all([
        apiRemoveFriend(friendId),
        fetchFriendsLeaderboard(),
      ]);
      setServerFriends(friends || []);
      setLeaderboardRows(leaderboard || []);
    } catch (e) {
      setErr(e?.message || "Failed to remove friend");
    }
  };

  // Turn leaderboardRows into display cards (keep your styling)
  const displayRows = useMemo(() => {
    // separate me and friends for label purposes
    return leaderboardRows
      .map((row, i) => ({
        id: row._id,
        name: String(row.username) === String(user?.username) ? "You" : row.username,
        progress: row.progress || (String(row.username) === String(user?.username) ? meProgressFallback : 0),
        avatar: ["🐱","🐶","🦊","🐼","🐯","🐧","🐸"][(row.username?.length || i) % 7],
        badge: String(row.username) === String(user?.username) ? "My Journey" : "Goal Crusher",
        message: String(row.username) === String(user?.username) ? "Let's reach our goals together!" : "",
      }))
      .sort((a, b) => b.progress - a.progress);
  }, [leaderboardRows, user?.username, meProgressFallback]);

  // ...render stays same, but use displayRows and removeFriend
  return (
    <div className="challenge-container old-theme">
      <h1 className="challenge-header">💰 Savings Challenge</h1>
      <p className="challenge-description">
        Compete with your friends and see who reaches their savings goals first!
      </p>

      <div className="connect-section">
        <h3>Connect with Friends</h3>
        <div className="connect-fields">
          <input
            type="text"
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            placeholder="Friend's name (username)"
            className="input-text"
          />
          <select value={avatar} onChange={(e) => setAvatar(e.target.value)} className="select-avatar">
            {["🐱","🐶","🦊","🐼","🐯","🐧","🐸"].map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={badge} onChange={(e) => setBadge(e.target.value)} className="select-badge">
            {["New Challenger","Goal Crusher","Steady Saver","Top Saver","Motivator","Budget Rookie"].map(b => <option key={b}>{b}</option>)}
          </select>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Motivational message"
            className="input-text"
          />
          <button className="btn-add" onClick={addFriend}>➕ Add Friend</button>
        </div>
        {err && <div style={{ color: "#b91c1c", marginTop: ".5rem" }}>{err}</div>}
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="leaderboard">
          {displayRows.map((friend, index) => (
            <div className="friend-card old-color" key={friend.id}>
              <div className="friend-rank">#{index + 1}</div>
              <div className="friend-avatar">{friend.avatar}</div>
              <div className="friend-info">
                <div className="friend-name">
                  {friend.name} <span className="friend-badge">{friend.badge}</span>
                </div>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: `${friend.progress}%` }} />
                </div>
                <div className="friend-progress">{friend.progress}%</div>
                {friend.message && <div className="friend-message">“{friend.message}”</div>}
              </div>
              {friend.id !== "me" && String(friend.id).length === 24 && (
                <button
                  onClick={() => removeFriend(friend.id)}
                  style={{ marginLeft: 8, padding: "6px 10px", borderRadius: 8 }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
