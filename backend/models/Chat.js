import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "model"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  // The User (Person sending the message)
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true
  },
  // The AI/Bot (The target receiver)
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true
  },
  messages: [historySchema]
}, { timestamps: true });

// CRITICAL: This ensures one unique history document per user-receiver pair
chatSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;