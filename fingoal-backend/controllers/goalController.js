// Mock controller for this week's milestone
// You can switch to Mongo persistence later.

let mockGoals = [
  { id: "g1", title: "Emergency Fund", targetAmount: 1000, timeline: "3m", progress: 300 },
  { id: "g2", title: "New Laptop",     targetAmount: 1500, timeline: "6m", progress: 450 }
];

export function listMock(req, res) {
  res.json(mockGoals);
}
