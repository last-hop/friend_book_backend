const User = require("../models/User");
const Recommendation = require("../models/Recommendation");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// recomendation
const generateFriendRecommendations = async (req, res) => {
  const userId = req.userId;

  try {
    // Find the current user's friends
    const user = await User.findById(userId)
      .populate("friends")
      .populate("friendRequests");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Collect IDs of the user's friends
    const userFriendIds = user.friends.map((friend) => friend._id.toString());
    const sentRequestIds = user.friendRequests.map((request) =>
      request._id.toString()
    );

    // Find potential friends (friends of friends, excluding user's friends and the user themselves)
    const potentialFriends = await User.find({
      _id: { $nin: [...userFriendIds,...sentRequestIds, userId] },
      friends: { $in: userFriendIds },
    }).populate("friends");

    // Calculate mutual friends count for each potential friend
    const recommendations = potentialFriends.map((potentialFriend) => {
      const mutualFriendsCount = potentialFriend.friends.filter((friend) =>
        userFriendIds.includes(friend._id.toString())
      ).length;

      return {
        friend: potentialFriend._id,
        username:potentialFriend.username,
        mutualFriendsCount,
      };
    });

    // Save or update recommendations in the database
    await Recommendation.findOneAndUpdate(
      { user: userId },
      { user: userId, recommendedFriends: recommendations },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "Friend recommendations generated successfully",
      recommendations,
    });
  } catch (error) {
    console.error("Error generating friend recommendations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("friends", "username ");
    res.status(200).json(user.friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.userId === userId) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    }

    const sender = await User.findById(req.userId);
    const receiver = await User.findById(userId);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    if (receiver.friendRequests.includes(req.userId)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    receiver.friendRequests.push(req.userId);
    await receiver.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const manageFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // Accept or Reject

    const user = await User.findById(req.userId);

    if (!user.friendRequests.includes(requestId)) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    // Remove the request from incoming requests
    user.friendRequests = user.friendRequests.filter(
      (req) => req.toString() !== requestId
    );

    if (action === "accept") {
      user.friends.push(requestId);
      const friend = await User.findById(requestId);
      friend.friends.push(req.userId);
      await friend.save();
    }

    await user.save();
    res.status(200).json({ message: `Friend request ${action}ed` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const searchUsers = async (req, res) => {
  try {
    const { username } = req.body; // Get the username from the request body

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    
    const user = await User.findOne({ username }).select("username profilePicture bio");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listRequest = async (req, res) => {
  try {

    // if (req.userId === userId) {
    //   return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    // }
    const userId = req.userId;
    const user = await User.findById(userId).populate("friendRequests", "username _id profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friendRequests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = { signup, login, updateProfile, getFriends, manageFriendRequest, sendFriendRequest, searchUsers ,listRequest ,generateFriendRecommendations};
