import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { model ,SYSTEM_PROMPT } from "../config/gemini.js";

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    // Verify the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages as read (messages sent to me by the other user)
    await Message.updateMany(
      { senderId: userId, receiverId: myId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private


const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, isActive } = req.body;
    const senderId = req.user._id;

    // 1. Basic Validation
    if (!receiverId || !text) {
      return res.status(400).json({ message: "Receiver and text are required" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // 2. Save Human Message to DB (Always do this)
    const userMessage = await Message.create({
      senderId,
      receiverId,
      text: text.trim(),
    });

    // 3. Check if AI Toggle is OFF
    if (!isActive) {
      return res.status(201).json(userMessage);
    }

    // 4. AI IS ACTIVE - Handle Gemini Logic
    let chatMemory = await Chat.findOne({ userId: senderId });
    if (!chatMemory) {
      chatMemory = new Chat({ userId: senderId, messages: [] });
    }

    // Map existing DB history to Gemini format
    const dbHistory = chatMemory.messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // INJECT PERSONA: Since 'systemInstruction' failed, we put it at the start of history
    const historyWithPersona = [
      {
        role: "user",
        parts: [{ text: `System Instructions: ${SYSTEM_PROMPT}. Confirm by saying 'Ok da'.` }]
      },
      {
        role: "model",
        parts: [{ text: "Ok da! Priya ready. Enna vishayam? 😊" }]
      },
      ...dbHistory
    ];

    // 5. Start Chat Session & Send Message
    const chatSession = model.startChat({ 
      history: historyWithPersona 
    });

    const result = await chatSession.sendMessage(text.trim());
    const botReplyText = result.response.text();

    // 6. Save AI reply to long-term memory (Chat Model)
    chatMemory.messages.push({ role: 'user', content: text.trim() });
    chatMemory.messages.push({ role: 'model', content: botReplyText });
    await chatMemory.save();

    // 7. Create a Message document for the AI reply (for UI bubbles)
    const aiMessage = await Message.create({
      senderId: receiverId, // AI takes the persona of the receiver
      receiverId: senderId,
      text: botReplyText,
    });

    // Return both messages so frontend updates instantly
    res.status(201).json({
      userMessage,
      aiReply: aiMessage
    });

  } catch (error) {
    console.error("Gemini Integration Error:", error);
    res.status(500).json({ message: "Aiyo, Gemini process la edho issue da!" });
  }
};

// @desc    Get unread message counts per conversation
// @route   GET /api/messages/unread
// @access  Private
const getUnreadCounts = async (req, res) => {
  try {
    const myId = req.user._id;

    const unreadCounts = await Message.aggregate([
      { $match: { receiverId: myId, read: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);

    // Convert to a map { senderId: count }
    const countMap = {};
    unreadCounts.forEach(({ _id, count }) => {
      countMap[_id.toString()] = count;
    });

    res.json(countMap);
  } catch (error) {
    console.error("Get unread counts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getMessages, sendMessage, getUnreadCounts };





