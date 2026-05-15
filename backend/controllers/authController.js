import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, name, username, password } = req.body;

    if (!email || !name || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "User already exists with this username" });
    }

    // ✅ Don't hash here — the model's pre("save") hook handles it
    const user = await User.create({ name, username, email, password });

    const token = generateToken(user._id);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      token,
    });

  } catch (error) {
    // ✅ Handle duplicate email (race condition between findOne and create)
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};


export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validation
    if (!username || !password) {
      return res.status(400).json({
        message: "Email/Username and password are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: username },
        { username: username }
      ]
    });


    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4. Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Password match:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 5. Generate token
    const token = generateToken(user._id);

    // 6. Send response
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};



export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    console.log("authcontroller.js / 103 ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    else {
      res.status(200).json({ message: "Log out successfully" });

    }

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};



export default { register, login, logout };
