import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export const useMessages = (selectedUser) => {
  const { socket, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Fetch messages when a user is selected
  const fetchMessages = useCallback(async () => {
    if (!selectedUser) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/api/messages/${selectedUser._id}`);
      setMessages(data);
    } catch (err) {
      // Safely access data error message if it exists
      console.log("Something Went wrong", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchMessages();
    setIsTyping(false);
  }, [fetchMessages]);

  // Listen for incoming real-time messages
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleNewMessage = (message) => {
      const isRelevant =
        (message.senderId === selectedUser._id && message.receiverId === user._id) ||
        (message.senderId === user._id && message.receiverId === selectedUser._id);

      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
        console.log("newmessage from usemessages", message);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser, user]);


  // Listen for deletion updates from the server
  useEffect(() => {
    if (!socket) return;

    // Listen for real-time deletion updates from the server
    socket.on("messagesDeleted", ({ messageIds }) => {
      console.log("Real-time delete event received for IDs:", messageIds);

      // Remove the deleted messages from the UI state instantly
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !messageIds.includes(msg._id))
      );
    });

    // Clean up the socket listener when the component unmounts or references change
    return () => {
      socket.off("messagesDeleted");
    };
  }, [socket, setMessages]);

  // Typing indicator listeners
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedUser]);

  // EMOJI REACTION REAL-TIME LISTENER
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleMessageReaction = ({ messageId, reactions }) => {
      // Dynamically update the reactions array for the matching target message
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
      );
    };

    socket.on("messageReaction", handleMessageReaction);
    return () => {
      socket.off("messageReaction", handleMessageReaction);
    };
  }, [socket, selectedUser]);

  // Message send
  const sendMessage = async (text, isActive) => {
    if (!text.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      const { data } = await api.post("/api/messages", {
        receiverId: selectedUser._id,
        text: text.trim(),
        isActive: isActive,
      });

      console.log("Data from API:", data);

      if (Array.isArray(data)) {
        setMessages((prev) => [...prev, ...data]);

        const userMsg = data[0];
        const aiMsg = data.length > 1 ? data[1] : null;

        if (userMsg && userMsg._id) {
          socket?.emit("sendMessage", {
            message: userMsg,
            receiverId: selectedUser._id,
            aiReply: aiMsg,
          });
        }
      }
    } catch (err) {
      console.error("Send error:", err.message);
    } finally {
      setSending(false);
    }
  };

  // EMOJI REACTION FUNCTIONS 
  const sendReaction = async (messageId, emoji) => {
    if (!socket || !selectedUser || !messageId) return;

    try {
      // 1. Post to HTTP backend to persist reaction in MongoDB
      const { data } = await api.post(`/api/messages/${messageId}/react`, { emoji });

      // Expected backend response syntax: { messageId, reactions: [...] }
      // 2. Emit via socket to notify the other user instantly
      socket.emit("sendReaction", {
        messageId: messageId,
        receiverId: selectedUser._id,
        reactions: data.reactions,
      });

      // 3. Optimistically/locally update state
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reactions: data.reactions } : msg))
      );
      console.log(messages);
    } catch (err) {
      console.error("Failed to add reaction:", err.message);
    }
  };


  const deleteMessages = async (selectedMessageIds) => {
    if (!socket || !selectedUser || !selectedMessageIds || !Array.isArray(selectedMessageIds) || selectedMessageIds.length === 0) return;

    try {
      console.log("Selected Message IDs to delete:", selectedMessageIds);

      // Pass the array inside the data config option for DELETE requests
      await api.delete('/api/messages/deletemessages', { data: { messageIds: selectedMessageIds } });
      console.log("Messages deleted successfully from backend");

      // Remove messages from local state (UI)
      setMessages((prev) => prev.filter((msg) => !selectedMessageIds.includes(msg._id)));

      // Emit socket event so the other user also removes them immediately
      socket.emit("deleteMessages", {
        messageIds: selectedMessageIds,
        receiverId: selectedUser._id,
      });

      console.log("Delete event emitted via socket");
    } catch (err) {
      console.error("Error deleting messages:", err.response?.data?.message || err.message);
    }
  };

  const emitTyping = () => {
    socket?.emit("typing", {
      receiverId: selectedUser?._id,
      senderId: user?._id,
    });
  };

  const emitStopTyping = () => {
    socket?.emit("stopTyping", {
      receiverId: selectedUser?._id,
      senderId: user?._id,
    });
  };

  return {
    messages,
    loading,
    sending,
    isTyping,
    setMessages,
    sendMessage,
    sendReaction, // Added to return properties
    emitTyping,
    emitStopTyping,
    deleteMessages
  };
};