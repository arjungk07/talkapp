import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { model, SYSTEM_PROMPT } from "../config/gemini.js";

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; 
    const myId = req.user._id;     

    // 1. Mark incoming messages as read FIRST 
    // This ensures that when we fetch them in the next step, they already have read: true
    await Message.updateMany(
      { senderId: userId, receiverId: myId, read: false },
      { $set: { read: true } }
    );

    // 2. Fetch messages between me and the other user/bot
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
      deleteforme: {
        $ne: myId
      }
    }).sort({ createdAt: 1 });

    // 3. Safety Check: If messages is null/undefined, send empty array
    if (!messages) {
      return res.status(200).json([]);
    }

    // 4. Send the updated messages back to the frontend
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
    const { receiverId, text, isActive, replyingTo } = req.body;
    const senderId = req.user._id;


    if (!receiverId || !text) {
      return res.status(400).json({ message: "Data missing" });
    }

    // 1. Fetch User details for the username (needed for new chat creation)
    const user = await User.findById(senderId);

    // 2. Save Message to main collection (UI history)
    const userMessage = await Message.create({
      senderId,
      receiverId,
      text: text.trim(),
      replyingTo: replyingTo ? {
        _id: replyingTo._id,
        userId: senderId,
        text: replyingTo.text,
      } : null,
    });

    console.log(userMessage);



    if (!isActive) return res.status(201).json([userMessage]);

    // 3. Find or Create the specific history for this Sender -> Receiver pair
    let chatMemory = await Chat.findOne({ receiverId });

    if (!chatMemory) {
      chatMemory = new Chat({
        senderId,
        receiverId,
        messages: []
      });
      await chatMemory.save();
    }

    // 4. Prepare History for Gemini (last 20 messages)
    const dbHistory = chatMemory.messages.slice(-20).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const historyWithPersona = [
      { role: "user", parts: [{ text: `System: ${SYSTEM_PROMPT}` }] },
      { role: "model", parts: [{ text: "Ok da! Ready." }] },
      ...dbHistory
    ];

    // 5. Get AI Response
    const chatSession = model.startChat({ history: historyWithPersona });
    const result = await chatSession.sendMessage(text.trim());
    const botReplyText = result.response.text();

    // 6. Atomically update the history
    await Chat.updateOne(
      { senderId, receiverId },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: text.trim() },
              { role: "model", content: botReplyText }
            ]
          }
        },
        $inc: { messageCount: 2 }
      }
    );

    // 7. Create AI UI Message
    const aiMessage = await Message.create({
      senderId: receiverId,
      receiverId: senderId,
      text: botReplyText,
      isAi: true,
    });

    res.status(201).json([userMessage, aiMessage]);

  } catch (error) {
    console.error("Gemini Process Error:", error);
    res.status(500).json({ message: "Aiyo, something went wrong!" });
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

const deleteMessages = async (req, res) => {
  try {

    const { messageIds, deleteforme } = req.body;
    const userId = req.user._id;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        message: "Invalid message ids"
      });
    }

    // DELETE FOR ME
    if (deleteforme) {

      const result = await Message.updateMany(
        {
          _id: { $in: messageIds }
        },
        {
          $addToSet: {
            deleteforme: userId
          }
        }
      );

      console.log(result);


      return res.status(200).json({
        message: "Messages deleted for you",
        deleteforme :userId
      });
    }

    // DELETE FOR EVERYONE
    const result = await Message.deleteMany({
      _id: { $in: messageIds },
      senderId: userId
    });

    return res.status(200).json({
      message: "Messages deleted for everyone",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};


const addMessageReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id; // Extracted from your authentication middleware

    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: "Message not found" });

    // Check if user already reacted to this message
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        // Option A: If clicked the exact same emoji, remove it (Toggle behavior)
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Option B: If choosing a different emoji, update it
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // Option C: Add a new reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    return res.status(200).json({ messageId: message._id, reactions: message.reactions });
  } catch (error) {
    console.error("Reaction Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export { getMessages, sendMessage, getUnreadCounts, deleteMessages, addMessageReaction };





