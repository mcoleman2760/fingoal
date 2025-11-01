// import User from "../models/User.js";
// import Transaction from "../models/Transaction.js"; // <-- adjust path if needed
// import mongoose from "mongoose";

// const normalize = (s) => String(s || "").trim();

// export const getFriends = async (req, res) => {
//   try {
//     const me = await User.findById(req.user.id)
//       .populate("friends", "username email")
//       .select("friends");
//     res.json({ friends: me?.friends ?? [] });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Failed to fetch friends" });
//   }
// };

// export const addFriend = async (req, res) => {
//   try {
//     const myId = req.user.id;
//     const friendUsername = normalize(req.body.friendUsername);
//     if (!friendUsername) return res.status(400).json({ message: "Missing friendUsername" });

//     const me = await User.findById(myId).select("_id username");
//     const other = await User.findOne({ username: friendUsername }).select("_id username");
//     if (!other) return res.status(404).json({ message: "User not found" });
//     if (String(other._id) === String(me._id)) {
//       return res.status(400).json({ message: "You cannot add yourself" });
//     }

//     // mutual add, idempotent
//     await User.updateOne({ _id: me._id },    { $addToSet: { friends: other._id } });
//     await User.updateOne({ _id: other._id }, { $addToSet: { friends: me._id } });

//     const updated = await User.findById(me._id)
//       .populate("friends", "username email")
//       .select("friends");
//     res.json({ friends: updated.friends });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Failed to add friend" });
//   }
// };

// export const removeFriend = async (req, res) => {
//   try {
//     const myId = req.user.id;
//     const friendId = req.params.friendId;

//     await User.updateOne({ _id: myId }, { $pull: { friends: friendId } });
//     await User.updateOne({ _id: friendId }, { $pull: { friends: myId } });

//     const updated = await User.findById(myId)
//       .populate("friends", "username email")
//       .select("friends");
//     res.json({ friends: updated.friends });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Failed to remove friend" });
//   }
// };

// export const getFriendsLeaderboard = async (req, res) => {
//   try {
//     const me = await User.findById(req.user.id).select("_id username friends");
//     if (!me) return res.status(404).json({ message: "User not found" });

//     const everyoneIds = [me._id, ...me.friends];
// const idStrs = everyoneIds.map((x) => String(x));

// // optional month filter (keep yours if you added it)
// let dateMatch = {};
// const { year, month } = req.query;
// if (year && month) {
//   const y = Number(year);
//   const m = Number(month) - 1;
//   const start = new Date(Date.UTC(y, m, 1));
//   const end = new Date(Date.UTC(y, m + 1, 1));
//   dateMatch = { createdAt: { $gte: start, $lt: end } };
// }

// // Normalize owner field and compare BY STRING to tolerate string/ObjectId mismatch
// const sums = await Transaction.aggregate([
//   { $addFields: { _u: { $ifNull: ["$user", { $ifNull: ["$owner", "$userId"] }] } } },
//   {
//     $match: {
//       ...dateMatch,
//       $expr: { $in: [{ $toString: "$_u" }, idStrs] },
//     },
//   },
//   {
//     $group: {
//       _id: "$_u",
//       income: {
//         $sum: {
//           $cond: [
//             { $or: [{ $gt: ["$amount", 0] }, { $eq: ["$type", "income"] }] },
//             "$amount",
//             0,
//           ],
//         },
//       },
//       outcome: {
//         $sum: {
//           $cond: [
//             { $or: [{ $lt: ["$amount", 0] }, { $eq: ["$type", "expense"] }] },
//             { $abs: "$amount" },
//             0,
//           ],
//         },
//       },
//     },
//   },
// ]);

//     const byId = new Map(
//       (sums || []).map((r) => [String(r._id), { income: r.income || 0, outcome: r.outcome || 0 }])
//     );

//     const users = await User.find({ _id: { $in: everyoneIds } }).select("_id username");
//     const clamp = (v) => Math.max(0, Math.min(100, v));

//     const leaderboard = users.map((u) => {
//       const s = byId.get(String(u._id)) || { income: 0, outcome: 0 };
//       const pct = s.income > 0 ? Math.round(((s.income - s.outcome) / s.income) * 100) : 0;
//       return {
//         _id: u._id,
//         username: u.username,
//         income: s.income,
//         outcome: s.outcome,
//         progress: clamp(pct),
//       };
//     });

//     res.json({ leaderboard });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Failed to compute leaderboard" });
//   }
// };

// controllers/friendController.js
// fingoal-backend/controllers/friendController.js
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const norm = (s) => String(s || "").trim();

/**
 * GET /api/friends
 */
export const getFriends = async (req, res) => {
  try {
    const me = await User.findById(req.user.id)
      .populate("friends", "username email")
      .select("friends");
    res.json({ friends: me?.friends ?? [] });
  } catch (e) {
    console.error("friends.getFriends error:", e);
    res.status(500).json({ message: "Failed to fetch friends" });
  }
};

/**
 * POST /api/friends   body: { friendUsername }
 * Mutual, idempotent add
 */
export const addFriend = async (req, res) => {
  try {
    const myId = req.user.id;
    const friendUsername = norm(req.body.friendUsername);
    if (!friendUsername) {
      return res.status(400).json({ message: "Missing friendUsername" });
    }

    const me = await User.findById(myId).select("_id username");
    const other = await User.findOne({ username: friendUsername }).select("_id username");
    if (!other) return res.status(404).json({ message: "User not found" });
    if (String(other._id) === String(me._id)) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    await User.updateOne({ _id: me._id },    { $addToSet: { friends: other._id } });
    await User.updateOne({ _id: other._id }, { $addToSet: { friends: me._id } });

    const updated = await User.findById(me._id)
      .populate("friends", "username email")
      .select("friends");
    res.json({ friends: updated?.friends ?? [] });
  } catch (e) {
    console.error("friends.addFriend error:", e);
    res.status(500).json({ message: "Failed to add friend" });
  }
};

/**
 * DELETE /api/friends/:friendId
 * Mutual remove
 */
export const removeFriend = async (req, res) => {
  try {
    const myId = req.user.id;
    const friendId = req.params.friendId;

    await User.updateOne({ _id: myId }, { $pull: { friends: friendId } });
    await User.updateOne({ _id: friendId }, { $pull: { friends: myId } });

    const updated = await User.findById(myId)
      .populate("friends", "username email")
      .select("friends");
    res.json({ friends: updated?.friends ?? [] });
  } catch (e) {
    console.error("friends.removeFriend error:", e);
    res.status(500).json({ message: "Failed to remove friend" });
  }
};

/**
 * GET /api/friends/leaderboard
 * Aggregates income/outcome for me + my friends
 */
export const getFriendsLeaderboard = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select("_id username friends");
    if (!me) return res.status(404).json({ message: "User not found" });

    const everyoneIds = [me._id, ...me.friends];
    const idStrs = everyoneIds.map((x) => String(x));

    // Optional month filter
    let dateMatch = {};
    const { year, month } = req.query;
    if (year && month) {
      const y = Number(year);
      const m = Number(month) - 1;
      const start = new Date(Date.UTC(y, m, 1));
      const end = new Date(Date.UTC(y, m + 1, 1));
      dateMatch = { createdAt: { $gte: start, $lt: end } };
    }

    // Normalize user field & match by string to tolerate ObjectId/string mixes
    const sums = await Transaction.aggregate([
      { $addFields: { _u: { $ifNull: ["$user", { $ifNull: ["$owner", "$userId"] }] } } },
      {
        $match: {
          ...dateMatch,
          $expr: { $in: [{ $toString: "$_u" }, idStrs] },
        },
      },
      {
        $group: {
          _id: "$_u",
          income: {
            $sum: {
              $cond: [
                { $or: [{ $gt: ["$amount", 0] }, { $eq: ["$type", "income"] }] },
                "$amount",
                0,
              ],
            },
          },
          outcome: {
            $sum: {
              $cond: [
                { $or: [{ $lt: ["$amount", 0] }, { $eq: ["$type", "expense"] }] },
                { $abs: "$amount" },
                0,
              ],
            },
          },
        },
      },
    ]);

    const byId = new Map(
      (sums || []).map((r) => [String(r._id), { income: r.income || 0, outcome: r.outcome || 0 }])
    );

    const users = await User.find({ _id: { $in: everyoneIds } }).select("_id username");
    const clamp = (v) => Math.max(0, Math.min(100, v));

    const leaderboard = users.map((u) => {
      const s = byId.get(String(u._id)) || { income: 0, outcome: 0 };
      const pct = s.income > 0 ? Math.round(((s.income - s.outcome) / s.income) * 100) : 0;
      return {
        _id: u._id,
        username: u.username,
        income: s.income,
        outcome: s.outcome,
        progress: clamp(pct),
      };
    });

    res.json({ leaderboard });
  } catch (e) {
    console.error("friends.getFriendsLeaderboard error:", e);
    res.status(500).json({ message: "Failed to compute leaderboard" });
  }
};
