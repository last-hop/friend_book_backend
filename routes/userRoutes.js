const express = require("express");
const { signup, login, getFriends, sendFriendRequest, manageFriendRequest, searchUsers, listRequest, generateFriendRecommendations  } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/friends", authMiddleware , getFriends);

router.get("/list", authMiddleware , listRequest);

router.post("/search", authMiddleware, searchUsers);

router.post("/:userId", authMiddleware, sendFriendRequest);
router.put("/:requestId", authMiddleware, manageFriendRequest);

router.get("/recommendations", authMiddleware, generateFriendRecommendations);

module.exports = router;
