import User from "../models/User.js";

// @desc    Get all users except logged-in user
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ isOnline: -1, name: 1 });

    res.json(users);
  } catch (err) {
    console.error("Get Users Error:", err);

    // Handle specific MongoDB network errors
    if (err.name === 'MongoNetworkError' || err.code === 'ECONNRESET') {
      return res.status(503).json({
        message: "Database service is temporarily unavailable. Please try again later."
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching user" });
  }
};

export default { getUsers, getMe, getUserById };