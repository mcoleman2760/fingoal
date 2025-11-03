import Goal from "../models/Goal.js";

// GET /api/goals
export async function list(req, res) {
  const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(goals);
}

// POST /api/goals
export async function create(req, res) {
  const { title, targetAmount, timeline = "" } = req.body || {};
  if (!title || targetAmount == null) {
    return res.status(400).json({ error: "title and targetAmount are required" });
  }
  const goal = await Goal.create({
    user: req.user.id,
    title,
    targetAmount: Number(targetAmount),
    timeline,
    progress: 0,
  });
  res.status(201).json(goal);
}

// PATCH /api/goals/:id  (update title/target/timeline/progress)
export async function update(req, res) {
  const allowed = ["title","targetAmount","timeline","progress"];
  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

  const g = await Goal.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    patch,
    { new: true }
  );
  if (!g) return res.status(404).json({ message: "Not found" });
  res.json(g);
}

// DELETE /api/goals/:id
export async function remove(req, res) {
  const r = await Goal.deleteOne({ _id: req.params.id, user: req.user.id });
  if (!r.deletedCount) return res.status(404).json({ message: "Not found" });
  res.status(204).end();
}