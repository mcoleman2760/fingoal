// models/User.js
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },

    // Friends: ObjectId references to other users
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // XP & Level
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Instance method: calculate level based on XP
userSchema.methods.calculateLevel = function () {
  // Example: 100 XP = 1 level
  return Math.floor(this.xp / 100) + 1;
};

// Avoid OverwriteModelError during dev/hot reload
const User = models.User || model("User", userSchema);

export default User;
