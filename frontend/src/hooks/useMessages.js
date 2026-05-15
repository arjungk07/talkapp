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
      // {isAi: false, _id: '6a05704cb94e5a48e5fdc75f', senderId:'69f82fa236d9704e8ac2d087', receiverId: '6a03dabd4e6309736cf7f400', text: 'veruthute', …}    } catch (err) {
    }
    catch(err){
      console.log("Something Went wrong",data.message);
    }
     finally {
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

    // 1. Log to verify: Should be an array [...]
    console.log("Data from API:", data);

    // 2. Since backend always sends an array, spread it directly into state
    // This works for [msg] (Normal) and [msg, aiReply] (AI Mode)
    if (Array.isArray(data)) {
      setMessages((prev) => [...prev, ...data]);

      // 3. Prepare data for Socket Emit
      const userMsg = data[0]; // The first object is always your message
      const aiMsg = data.length > 1 ? data[1] : null; // Second object is AI (if exists)

      // 4. Real-time Socket Emit
      if (userMsg && userMsg._id) {
        socket?.emit("sendMessage", {
          message: userMsg,
          receiverId: selectedUser._id,
          aiReply: aiMsg, // Will be null if isAi is false
        });
      }
    }

  } catch (err) {
    console.error("Send error:", err);
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
