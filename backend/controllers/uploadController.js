import User from "../models/User.js";
import Message from "../models/Message.js"; // Import your message model

export const uploadMedia = async (
  req,
  res
) => {
  try {
    const {
      userId,
      type,
      receiverId,
      text,
      removeprofile,
    } = req.body;

    console.log("userId:", userId);
    console.log("type:", type);
    console.log("receiverId:", receiverId);

    // Remove profile pic
    if (removeprofile) {
      const updatedUser =
        await User.findByIdAndUpdate(
          userId,
          {
            profilePic: "",
          },
          {
            new: true,
          }
        );

      if (!updatedUser) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      return res.status(200).json({
        message:
          "Profile removed",
        user: updatedUser,
      });
    }

    // File validation
    if (!req.file) {
      return res.status(400).json({
        message:
          "No file uploaded",
      });
    }

    // Ensure image
    if (
      !req.file.mimetype.startsWith(
        "image/"
      )
    ) {
      return res.status(400).json({
        message:
          "Only image uploads allowed",
      });
    }

    const imageUrl = req.file.path;

    // Profile upload
    if (type === "profile") {
      const updatedUser =
        await User.findByIdAndUpdate(
          userId,
          {
            profilePic: imageUrl,
          },
          {
            new: true,
          }
        );

      return res.status(200).json({
        message:
          "Profile updated",
        imageUrl,
        user: updatedUser,
      });
    }

    // Chat attachment
    if (type === "attachment") {
      if (!receiverId) {
        return res.status(400).json({
          message:
            "receiverId required",
        });
      }

      const newMessage =
        await Message.create({
          senderId: userId,

          receiverId,

          text: text || "",

          attachments: [
            {
              url: imageUrl,

              fileType: "image",

              publicId:
                req.file.filename ||
                "",
            },
          ],
        });

      return res.status(201).json({
        success: true,

        imageUrl,

        messageData: newMessage,
      });
    }

    return res.status(400).json({
      message:
        "Invalid upload type",
    });

  } catch (error) {
    console.error(
      "UPLOAD ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Internal Server Error",

      error:
        error.message,
    });
  }
};