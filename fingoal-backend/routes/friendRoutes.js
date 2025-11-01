
// import { Router } from "express";
// import { getFriends, addFriend, removeFriend } from "../controllers/friendController.js";

// // 🔧 Robust import: works whether auth.js is CommonJS or ESM
// import auth from "../middleware/auth.js";
// const protect = auth?.protect || auth; // if CJS exports { protect }, use it; if exports function, use it

// const router = Router();

// router.use(protect);
// router.get("/", getFriends);
// router.post("/", addFriend);
// router.delete("/:friendId", removeFriend);

// export default router;

import { Router } from "express";
import { getFriends, addFriend, removeFriend, getFriendsLeaderboard } from "../controllers/friendController.js";

import auth from "../middleware/auth.js";
const protect = auth?.protect || auth;

const router = Router();

router.use(protect);
router.get("/", getFriends);
+router.get("/leaderboard", getFriendsLeaderboard); // ✅ restore this
router.post("/", addFriend);
router.delete("/:friendId", removeFriend);

export default router;
