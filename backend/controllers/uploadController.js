import User from "../models/User.js";

export const uploadProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // With CloudinaryStorage, the URL is in req.file.path or req.file.path
    const imageUrl = req.file.path; 

    // Update the user's profile picture in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Image uploaded to assets folder successfully",
      imageUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};