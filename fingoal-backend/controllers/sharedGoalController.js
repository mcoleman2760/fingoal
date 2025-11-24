import SharedGoal from "../models/SharedGoal.js";


// GET /api/shared-goals
export const getSharedGoals = async (req, res) => {
  try {
    const goals = await SharedGoal.find().sort({ createdAt: -1 });
    res.json({ sharedGoals: goals });
  } catch (e) {
    console.error("sharedGoals.getSharedGoals error:", e);
    res.status(500).json({ message: "Failed to fetch shared goals" });
  }
};

// POST /api/shared-goals  { title, description, targetAmount }
export const createSharedGoal = async (req, res) => {
  try {
    const { title, description, targetAmount } = req.body;
    if (!title || !targetAmount)
      return res
        .status(400)
        .json({ message: "Title and targetAmount required" });

    const goal = new SharedGoal({ title, description, targetAmount });
    await goal.save();
    res.status(201).json(goal);
  } catch (e) {
    console.error("sharedGoals.createSharedGoal error:", e);
    res.status(500).json({ message: "Failed to create goal" });
  }
};

// PUT /api/shared-goals/:goalId  { amount }
export const contributeToSharedGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Amount must be > 0" });

    const goal = await SharedGoal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const contributor = goal.contributors.find(
      (c) => c.user.toString() === req.user.id
    );
    if (contributor) {
      contributor.amount += amount;
    } else {
      goal.contributors.push({ user: req.user.id, amount });
    }

    goal.currentAmount += amount;
    await goal.save();
    res.json(goal);
  } catch (e) {
    console.error("sharedGoals.contributeToSharedGoal error:", e);
    res.status(500).json({ message: "Failed to contribute" });
  }
};
