import User from "../models/User.js";
import Message from "../models/Message.js"; // Import your message model

export const uploadMedia = async (req, res) => {
  try {
    // 1. Destructure ALL needed variables from req.body (including 'text')
    const { userId, type, receiverId, removeprofile, text } = req.body;

    // ==========================================
    // CONDITION 0: Handle Profile Picture Removal
    // ==========================================
    if (removeprofile) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: "" },
        { new: true }
      );

      // Check if user exists BEFORE doing anything else
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // NOTE: Removed 'updatedUser.save()' because findByIdAndUpdate already saves it.

      return res.status(200).json({
        message: "Profile picture removed successfully",
        profilePic: updatedUser.profilePic, 
        user: updatedUser,
      });
    }

    // 2. Validation check for remaining operations (Only if NOT removing profile)
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Cloudinary URL from multer-storage-cloudinary
    const imageUrl = req.file.path;

    // ==========================================
    // CONDITION 1: Handle Profile Picture Update
    // ==========================================
    if (type === "profile") {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: imageUrl },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // NOTE: Removed 'updatedUser.save()' to prevent unnecessary database double-writes.

      return res.status(200).json({
        message: "Profile picture updated successfully",
        imageUrl,
        user: updatedUser,
      });
    }

    // ==========================================
    // CONDITION 2: Handle Chat Gallery Attachment
    // ==========================================
    if (type === "attachment") {
      if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID is required for messages" });
      }

      // Message.create automatically saves it to the database
      const newMessage = await Message.create({
        sender: userId,
        recipient: receiverId, 
        text: text || "", // Fixed: 'text' is now safely grabbed from req.body
        attachments: [
          {
            url: imageUrl,
            fileType: "image",
          },
        ],
      });

      return res.status(201).json({
        message: "Message attachment uploaded successfully",
        imageUrl,
        messageData: newMessage,
      });
    }

    // Fallback if type property is invalid
    return res.status(400).json({ message: "Invalid upload type specified" });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};