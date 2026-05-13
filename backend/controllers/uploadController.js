import User from "../models/User.js";

export const uploadProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("uploadController.js / 5", userId);

    // check file
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // build image URL
    const baseUrl = process.env.UPLOAD_IMG_URL;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    // update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: imageUrl },
      { new: true }
    );

    console.log("uploadController.js / 24", updatedUser);

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated",
      imageUrl,
      user: updatedUser,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
