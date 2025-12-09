// fingoal-backend/controllers/sharedGoalController.js
// Mock shared goals controller for this week's milestone
// Two friends can see the same goal
// Can switch to MongoDB later

let mockSharedGoals = [
  {
    id: "sg1",
    title: "Emergency Fund Together",
    targetAmount: 2000,
    currentAmount: 300,
    members: ["a", "mike"], // usernames of the members
  },
  {
    id: "sg2",
    title: "Vacation Fund",
    targetAmount: 1500,
    currentAmount: 450,
    members: ["a", "jo"],
  },
];

// GET /api/shared-goals
export async function listSharedGoals(req, res) {
  // Only return goals where current user is a member
  const username = req.user?.username;
  if (!username) return res.status(400).json({ error: "User not found" });

  const userGoals = mockSharedGoals.filter((g) => g.members.includes(username));
  res.json({ sharedGoals: userGoals });
}

// POST /api/shared-goals
export async function createSharedGoal(req, res) {
  const { title, targetAmount, members = [] } = req.body;
  const username = req.user?.username;

  if (!title || targetAmount == null) {
    return res
      .status(400)
      .json({ error: "title and targetAmount are required" });
  }

  if (!members.includes(username)) members.push(username);

  const goal = {
    id: "sg" + (mockSharedGoals.length + 1),
    title,
    targetAmount: Number(targetAmount),
    currentAmount: 0,
    members,
  };
  mockSharedGoals.push(goal);
  res.status(201).json(goal);
}

// PUT /api/shared-goals
export async function updateSharedGoal(req, res) {
  const { goalId, amount } = req.body;
  const username = req.user?.username;

  if (!goalId || amount == null)
    return res.status(400).json({ error: "goalId and amount required" });

  const goal = mockSharedGoals.find((g) => g.id === goalId);
  if (!goal) return res.status(404).json({ error: "Goal not found" });

  if (!goal.members.includes(username))
    return res.status(403).json({ error: "You are not a member of this goal" });

  goal.currentAmount += Number(amount);
  res.json(goal);
}

// DELETE /api/shared-goals/:goalId
// DELETE /api/shared-goals/:id
export async function deleteSharedGoal(req, res) {
  const { id } = req.params;
  const username = req.user?.username;

  if (!username) return res.status(400).json({ error: "User not found" });

  const goalIndex = mockSharedGoals.findIndex((g) => g.id === id);
  if (goalIndex === -1) return res.status(404).json({ error: "Goal not found" });

  const goal = mockSharedGoals[goalIndex];

  // Only allow deletion if current user is a member
  // if (!goal.members.includes(username)) {
  //   return res.status(403).json({ error: "You are not a member of this goal" });
  // }

  // Remove the goal from the array
  mockSharedGoals.splice(goalIndex, 1);

  res.json({ message: "Shared goal deleted successfully" });
}

