import mongoose from "mongoose";

// This represents a single exchange in the AI's memory
const historySchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ["user", "model"], // Gemini uses "model" instead of "ai" or "bot"
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const chatSchema = new mongoose.Schema({
  // The person who is talking to the AI
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true // One history document per user
  },
  // The array of previous messages Gemini will read
  messages: [historySchema]
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;