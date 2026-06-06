import User from "../models/User.js";
import Message from "../models/Message.js";

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

    // on socket for real time update profile pic
    socket.on("updateProfilePic", ({ userId, profilePic }) => {
      console.log(`📸 User ${userId} updated profile picture. Sending to all active receivers...`);

      // Get all logged-in user IDs currently online
      console.log("userSocketMap", userSocketMap)
      const onlineUserIds = Object.keys(userSocketMap);
      console.log(onlineUserIds);

      onlineUserIds.forEach((receiverId) => { //here receiverId is a user defined variable it survive the entire onlineUserIds array
        // Skip the sender so they don't get a double-update event
        if (receiverId !== userId) {
          const receiverSocketId = userSocketMap[receiverId];

          if (receiverSocketId) {
            io.to(receiverSocketId).emit("user-image-updated", {
              userId,
              profilePic
            });
          }
        }
      });
    });


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

    // Send image
    socket.on("sendImage", (messageData) => {

      const receiverSocketId = getReceiverSocketId(messageData.receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId)
          .emit("receiveImage", messageData);
      }
    });

    // 👉 BACKEND ON FUNCTION: Listens for the frontend trigger

    socket.on("markMessagesAsRead", async ({ chatUserId, currentUserId }) => {
      try {
        if (!chatUserId || !currentUserId) return;

        // 1. Double check and enforce database update
        await Message.updateMany(
          { senderId: chatUserId, receiverId: currentUserId, read: false },
          { $set: { read: true } }
        );

        // 2. Find the active socket connection ID of the original sender (Arjun)
        const senderSocketId = userSocketMap[chatUserId];
        console.log(senderSocketId)

        if (senderSocketId) {
          // 3. Send real-time event directly to Arjun's screen
          io.to(senderSocketId).emit("messagesMarkedAsRead", {
            readBy: currentUserId, // Identifies that Ganesh read them
          });
        }
      } catch (error) {
        console.error("Error updating read status over sockets:", error);
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
        const disconnectTime = new Date();

        try {
          // 1. Update database right away
          await User.findByIdAndUpdate(disconnectedUserId, {
            isOnline: false,
            lastSeen: disconnectTime,
          });

          // 2. Broadcast the specific lastSeen event for the active chat window
          io.emit("userLastSeenUpdate", {
            userId: disconnectedUserId,
            lastSeen: disconnectTime,
          });
        } catch (err) {
          console.error("Error updating user offline:", err);
        }

        // 3. get online users for show active now
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });
  });
};
