// controllers/sharedGoalController.js
import User from "../models/User.js";
import SharedGoal from "../models/SharedGoal.js";

// Helper: get user ID from username
const getUserIdsFromUsernames = async (usernames) => {
  const users = await User.find({ username: { $in: usernames } }).select("_id");
  return users.map((u) => u._id);
};

// GET /api/shared-goals
export const listSharedGoals = async (req, res) => {
  try {
    const username = req.user.username; // from auth middleware
    const sharedGoals = await SharedGoal.find({ members: username });
    res.json({ sharedGoals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch shared goals" });
  }
};


// POST /api/shared-goals
export async function createSharedGoal(req, res) {
  try {
    const { title, targetAmount, members } = req.body;

    if (
      !title ||
      !targetAmount ||
      !members ||
      !Array.isArray(members) ||
      members.length === 0
    ) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    // Ensure all members are non-empty strings
    const cleanedMembers = members.map((m) => m.trim()).filter(Boolean);
    if (cleanedMembers.length === 0) {
      return res
        .status(400)
        .json({ message: "Members must include at least one valid username" });
    }

    const goal = new SharedGoal({
      title,
      targetAmount,
      currentAmount: 0,
      members: cleanedMembers,
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    console.error("Create goal error:", err);
    res
      .status(500)
      .json({ message: "Failed to create shared goal", error: err.message });
  }
}



// PUT /api/shared-goals
export const updateSharedGoal = async (req, res) => {
  const { id } = req.params; // <-- get goal ID from URL
  const { amount } = req.body; // <-- get contribution from body

  try {
    const goal = await SharedGoal.findById(id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.currentAmount += amount;
    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update goal" });
  }
};


// DELETE /api/shared-goals/:id
export const deleteSharedGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedGoal = await SharedGoal.findByIdAndDelete(id);
    if (!deletedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete shared goal:", err);
    res.status(500).json({ message: "Failed to delete goal" });
  }
};
