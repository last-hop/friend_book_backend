const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" }, 
  profilePicture: { type: String, default: "" }, 
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
  createdAt: { type: Date, default: Date.now },
});


userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Helper method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// module.exports = mongoose.model("User", userSchema);

const User = mongoose.model("User", userSchema);
module.exports = User;
