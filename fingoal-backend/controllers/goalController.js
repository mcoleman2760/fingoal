// fingoal-backend/controllers/goalController.js
// Mock controller for this week's milestone
// You can switch to Mongo persistence later.

let mockGoals = [
  { id: "g1", title: "Emergency Fund", targetAmount: 1000, timeline: "3m", progress: 300 },
  { id: "g2", title: "New Laptop",     targetAmount: 1500, timeline: "6m", progress: 450 }
];

// GET /api/goals
export async function list(req, res) {
  res.json(mockGoals);
}

// POST /api/goals
export async function create(req, res) {
  const { title, targetAmount, timeline = "" } = req.body;
  if (!title || targetAmount == null) {
    return res.status(400).json({ error: "title and targetAmount are required" });
  }
  const goal = {
    id: "g" + (mockGoals.length + 1),
    title,
    targetAmount: Number(targetAmount),
    timeline,
    progress: 0,
  };
  mockGoals.push(goal);
  res.status(201).json(goal);
}
