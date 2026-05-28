import mongoose from "mongoose";
import User from "./User.js";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional because AI chats may not have a second User object
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          enum: ["image", "video", "document"],
          default: "image",
        },
        publicId: {
          type: String, // Useful if you plan to delete files later from Cloudinary/S3
        }
      }
    ],
    deleteforme:[{
      type : mongoose.Schema.Types.ObjectId,
      ref:'User'
    }],
   replyingTo: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      userId : {type : mongoose.Schema.Types.ObjectId, ref: 'User' }, 
      text: { type: String },
    },
    reactions: [
      {
        _id:{type:mongoose.Schema.Types.ObjectId, ref: 'Message' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String }
      }
    ],
    role: {
      type: String,
      enum: ["user", "model"],
      default: "user"
    },
    read: {
      type: Boolean,
      default: false,
    },
    isAi: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/** 
 * INDEX 1: User-to-User Conversations
 * Why: When fetching a chat between two people, you query BOTH sender and receiver.
 * Sorting by createdAt: -1 ensures the "latest" messages are found first.
 */
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

/** 
 * INDEX 2: AI Session History
 * Why: For AI memory, we fetch messages by the 'chatId'.
 * Sorting by createdAt: 1 ensures Gemini gets the history in chronological order.
 */
messageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);