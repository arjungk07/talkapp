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
    const { email, name, username, password, newname } = req.body;

    // 1. Check if newname is provided but empty/just spaces
    if (newname !== undefined && newname.trim() === "") {
      return res.status(400).json({ message: "New name cannot be empty" });
    }

    // 2. Adjust core validation: 
    // If 'newname' exists, we only strictly need the 'email' to find the user.
    // If 'newname' DOES NOT exist, it's a standard registration, so ALL fields are required.
    if (!newname) {
      if (!email || !name || !username || !password) {
        return res.status(400).json({ message: "All fields are required for registration" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
    } else {
      // If updating, we still need at least the email to look them up
      if (!email) {
        return res.status(400).json({ message: "Email is required to update name" });
      }
    }

    // 3. Check if the user already exists by email or username
    let user = await User.findOne({
      $or: [
        { email: email },
        { username: username }
      ]
    });



    // 4. If newname is provided and the user exists, update their name
    if (newname && user) {
      const trimmedNewName = newname.trim();
      console.log("Processing name update to:", trimmedNewName);

      // Scenario A: The name is identical to what's already in the database
      if (user.name === trimmedNewName) {
        return res.status(200).json({
          status: "success",
          message: "No changes detected; profile name is already up to date.",
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
        });
      }

      // Scenario B: The name is different, proceed with update and save
      user.name = trimmedNewName;
      await user.save();

      const token = generateToken(user._id);
      return res.status(200).json({
        status: "success",
        message: "User profile updated successfully.",
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        token,
      });
    }



    // 5. Standard validation if the user exists but no 'newname' was provided (Registration attempt)
    if (user) {
      return res.status(400).json({ message: "User already exists with this email or username" });
    }

    // 6. Create new user if they don't exist
    user = await User.create({ name, username, email, password });

    const token = generateToken(user._id);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      token,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists with this credential" });
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
