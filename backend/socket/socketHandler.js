import User from "../models/User.js";

// Map: userId -> socketId
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
      console.log(`👤 User ${userId} mapped to socket ${socket.id}`);

      // Mark user online
      User.findByIdAndUpdate(userId, { isOnline: true }).catch(console.error);

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }


    // Send Message
    socket.on("sendMessage", (data) => {
      const { receiverId, message, aiReply } = data;

      // Find the receiver's specific socket ID
      const receiverSocketId = getReceiverSocketId(receiverId);

      if (receiverSocketId) {
        // Send to the receiver's screen instantly
        io.to(receiverSocketId).emit("newMessage", message);

        // If there is an AI reply, send that too
        if (aiReply) {
          io.to(receiverSocketId).emit("newMessage", aiReply);
        }
      }
    });

    // delete message

    // Listen for the delete message event from the sender
    socket.on("deleteMessages", ({ messageIds, receiverId }) => {
      // console.log(`Received delete request for IDs: ${messageIds} targeting user: ${receiverId}`);

      // Find the socket ID of the receiver
      const receiverSocketId = userSocketMap[receiverId];

      if (receiverSocketId) {
        // Emit a targeted event to the receiver telling them to delete these IDs locally
        io.to(receiverSocketId).emit("messagesDeleted", { messageIds });
        console.log(`Dispatched deletion event to socket: ${receiverSocketId}`);
      }
    });


  // Add Reaction
  socket.on("sendReaction", ({ messageId, receiverId, reactions }) => {
    // Discover target active user socket mapping channel
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", {
        messageId,
        reactions,
      });
    }
  });

  // Typing
  socket.on("typing", ({ receiverId, senderId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("stopTyping", ({ receiverId, senderId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  // Disconnect
  socket.on("disconnect", async () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);

    const disconnectedUserId = Object.keys(userSocketMap).find(
      (uid) => userSocketMap[uid] === socket.id
    );

    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];

      try {
        await User.findByIdAndUpdate(disconnectedUserId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("Error updating user offline:", err);
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});
};
