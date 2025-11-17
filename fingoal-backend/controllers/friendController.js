// controllers/friendController.js
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const norm = (s) => String(s || "").trim();

/**
 * GET /api/friends
 */
export const getFriends = async (req, res) => {
  try {
    const me = await User.findById(req.user.id)
      .populate("friends", "username email xp level")
      .select("friends xp level");
    res.json({ friends: me?.friends ?? [] });
  } catch (e) {
    console.error("friends.getFriends error:", e);
    res.status(500).json({ message: "Failed to fetch friends" });
  }
};

/**
 * POST /api/friends
 * Mutual, idempotent add
 * +20 XP only the first time you are added
 */
export const addFriend = async (req, res) => {
  try {
    const myId = req.user.id;
    const friendUsername = norm(req.body.friendUsername);

    if (!friendUsername)
      return res.status(400).json({ message: "Missing friendUsername" });

    const me = await User.findById(myId).select(
      "_id username xp level friends"
    );
    const other = await User.findOne({ username: friendUsername }).select(
      "_id username xp level friends"
    );

    if (!other) return res.status(404).json({ message: "User not found" });
    if (String(other._id) === String(me._id))
      return res.status(400).json({ message: "You cannot add yourself" });

    // Check if they are already friends
    const alreadyFriends = me.friends.some(
      (f) => String(f) === String(other._id)
    );

    // Mutual add
    await User.updateOne(
      { _id: me._id },
      { $addToSet: { friends: other._id } }
    );
    await User.updateOne(
      { _id: other._id },
      { $addToSet: { friends: me._id } }
    );

    // Award XP only if this is the first time they are friends
    if (!alreadyFriends) {
      me.xp += 20;
      me.level = me.calculateLevel();
      await me.save();

      other.xp += 20;
      other.level = other.calculateLevel();
      await other.save();
    }

    const updated = await User.findById(myId)
      .populate("friends", "username email xp level")
      .select("friends xp level");

    res.json({
      friends: updated?.friends ?? [],
      xpGained: !alreadyFriends ? 20 : 0,
    });
  } catch (e) {
    console.error("friends.addFriend error:", e);
    res.status(500).json({ message: "Failed to add friend" });
  }
};

/**
 * DELETE /api/friends/:friendId
 */
export const removeFriend = async (req, res) => {
  try {
    const myId = req.user.id;
    const friendId = req.params.friendId;

    await User.updateOne({ _id: myId }, { $pull: { friends: friendId } });
    await User.updateOne({ _id: friendId }, { $pull: { friends: myId } });

    const updated = await User.findById(myId)
      .populate("friends", "username email xp level")
      .select("friends xp level");

    res.json({ friends: updated?.friends ?? [] });
  } catch (e) {
    console.error("friends.removeFriend error:", e);
    res.status(500).json({ message: "Failed to remove friend" });
  }
};

/**
 * GET /api/friends/leaderboard
 * Aggregates income/outcome for me + friends
 * Does NOT increment XP here
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
      dateMatch = {
        createdAt: {
          $gte: new Date(Date.UTC(y, m, 1)),
          $lt: new Date(Date.UTC(y, m + 1, 1)),
        },
      };
    }

    const sums = await Transaction.aggregate([
      {
        $addFields: {
          _u: { $ifNull: ["$user", { $ifNull: ["$owner", "$userId"] }] },
        },
      },
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
                {
                  $or: [{ $gt: ["$amount", 0] }, { $eq: ["$type", "income"] }],
                },
                "$amount",
                0,
              ],
            },
          },
          outcome: {
            $sum: {
              $cond: [
                {
                  $or: [{ $lt: ["$amount", 0] }, { $eq: ["$type", "expense"] }],
                },
                { $abs: "$amount" },
                0,
              ],
            },
          },
        },
      },
    ]);

    const byId = new Map(
      sums.map((r) => [
        String(r._id),
        { income: r.income || 0, outcome: r.outcome || 0 },
      ])
    );
    const users = await User.find({ _id: { $in: everyoneIds } }).select(
      "_id username xp level"
    );

    const clamp = (v) => Math.max(0, Math.min(100, v));
    const leaderboard = users.map((u) => {
      const s = byId.get(String(u._id)) || { income: 0, outcome: 0 };
      const pct =
        s.income > 0
          ? Math.round(((s.income - s.outcome) / s.income) * 100)
          : 0;
      return {
        _id: u._id,
        username: u.username,
        income: s.income,
        outcome: s.outcome,
        progress: clamp(pct),
        xp: u.xp,
        level: u.level,
      };
    });

    res.json({ leaderboard });
  } catch (e) {
    console.error("=== getFriendsLeaderboard ERROR ===");
    console.error(e);
    res
      .status(500)
      .json({ message: "Failed to compute leaderboard", error: e.message });
  }
};


