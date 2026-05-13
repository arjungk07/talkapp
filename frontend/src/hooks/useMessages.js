import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

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
      console.log("usemessage.js / 24",data)
      setMessages(data);
      console.log("usemessage.js / 26",messages)
    } catch (err) {
      toast.error("Failed to load messages");
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
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser, user]);

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

  const sendMessage = async (text, isActive) => {
    if (!text.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      const { data } = await api.post("/api/messages", {
        receiverId: selectedUser._id,
        text: text.trim(),
        isActive: isActive,
      });

      // 2. Update local UI with the user's message
      setMessages((prev) => [...prev, data.userMessage]);

      // 3. If AI was enabled and gave a reply, add that too
      if (data.aiReply) {
        setMessages((prev) => [...prev, data.aiReply]);
      }

      // 4. Emit real-time message via socket
      socket?.emit("sendMessage", {
        message: data.userMessage,
        receiverId: selectedUser._id,
        aiReply: data.aiReply || null, // Optional: let the recipient see the AI reply too
      });

    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
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

  return { messages, loading, sending, isTyping, sendMessage, emitTyping, emitStopTyping };
};
