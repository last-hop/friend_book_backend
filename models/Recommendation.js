const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recommendedFriends: [
    {
      friend: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      mutualFriendsCount: { type: Number, default: 0 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recommendation", recommendationSchema);
