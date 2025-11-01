// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true, index: true },
//   username: { type: String, required: true, unique: true, index: true },
//   passwordHash: { type: String, required: true }
// }, { timestamps: true });

// export default mongoose.model("User", userSchema);

// models/User.js
// import mongoose from "mongoose";
// const { Schema, model, models } = mongoose;

// const userSchema = new Schema(
//   {
//     email:    { type: String, required: true, unique: true, index: true },
//     username: { type: String, required: true, unique: true, index: true },
//     passwordHash: { type: String, required: true },

//     // NEW: friends stored as ObjectId references
//     friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true }
// );

// // Avoid OverwriteModelError during dev/hot reload:
// const User = models.User || model("User", userSchema);
// export default User;
// models/User.js
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    email:    { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },

    // NEW: friends stored as ObjectId references
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Avoid OverwriteModelError during dev/hot reload:
const User = models.User || model("User", userSchema);
export default User;
