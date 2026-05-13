import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../hooks/useMessages";
import { FaUserAlt } from "react-icons/fa";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { formatDistanceToNow } from "date-fns";
import ai from '../assets/image/talk_ai_icon.png';

const ChatWindow = ({ className }) => {
  const { onlineUsers, selectedUser } = useAuth();



  const { messages, loading, sending, isTyping, sendMessage, emitTyping, emitStopTyping } =
    useMessages(selectedUser);
  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isOnline = onlineUsers.includes(selectedUser?._id);




  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    clearTimeout(typingTimeoutRef.current);
    emitStopTyping();
    await sendMessage(text,isActive);
    setText("");
  };

  const handleTyping = useCallback((e) => {
    setText(e.target.value);
    emitTyping();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitStopTyping(), 2000);
  }, [emitTyping, emitStopTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };


  




  
  // No user selected — only visible on desktop (parent hides this on mobile)
  if (!selectedUser) {
    return (
      <div className={`${className} flex-1 flex items-center h-screen  justify-center  bg-chat-panel`}>
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-chat-panel border border-chat-border flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-12 h-12 text-chat-accent opacity-60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.02-1.35C8.47 21.52 10.19 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
          <h2 className="text-xl  text-chat-text mb-2 font-bold">Welcome to TalkApp</h2>
          <p className="text-chat-muted text-sm max-w-xs talkapp-font font-medium">
            Select a contact from the sidebar to start a conversation
          </p>
        </div>
      </div>
    );
  }

  return (

    <div className="flex flex-1 h-screen w-full overflow-hidden bg-chat-bg">

      {/* MAIN CHAT WINDOW */}
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">

        {/* CHAT HEADER: Styled to stay at the top without 'fixed' to avoid overlap issues */}
        <header className="px-4 lg:px-6 py-4 border-b border-chat-border bg-chat-panel flex items-center  gap-3 shrink-0 z-10">
          <div className="relative">

            {selectedUser.profilePic ? (
              <img
                src={selectedUser.profilePic}
                alt={selectedUser.name}
                className="w-11 h-11 rounded-full  bg-chat-surface border border-chat-border"
              />
            ) : (
              <FaUserAlt className="w-11 h-11 p-1 rounded-full bg-chat-surface text-chat-muted border border-chat-border" />
            )}

            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-chat-online rounded-full border-2 border-chat-panel" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-chat-text google-sans ">{selectedUser.name}</h2>
            <p className="text-xs text-chat-muted">
              {isTyping ? (
                <span className="text-chat-accent animate-pulse">typing...</span>
              ) : isOnline ? (
                <span className="text-chat-online">● Online</span>
              ) : selectedUser.lastSeen ? (
                `Last seen ${formatDistanceToNow(new Date(selectedUser.lastSeen), { addSuffix: true })}`
              ) : (
                "Offline"
              )}
            </p>
          </div>


          <button
            onClick={handleClick}
            className={`p-1 rounded-full font-bold transition-colors ${isActive
                ? 'bg-green-500 text-white' // Styles for Deactivate mode
                : 'bg-gray-500 text-white' // Styles for Activate mode
              }`}
          >
            <img src={ai} alt="ai" className="w-7 h-7 rounded-full" />
            {/* {isActive ? 'Deactivate' : 'Activate'} */}
          </button>
        </header>

        {/* MESSAGES AREA: flex-1 and overflow-y-auto ensures it scrolls while header/input stay put */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin w-8 h-8 text-chat-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                </svg>
                <p className="text-chat-muted text-sm">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-chat-panel border border-chat-border flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-chat-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-chat-muted text-sm">No messages yet.</p>
              <p className="text-chat-muted text-xs mt-1">Say hello to {selectedUser.name}! 👋</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg._id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={bottomRef} />
        </main>

        {/* INPUT SECTION */}
        <footer className="px-4 lg:px-6 py-4 border-t border-chat-border bg-chat-panel shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder={`Message to ${selectedUser.name}...`}
                maxLength={2000}
                className="w-full bg-chat-surface border border-chat-border rounded-2xl px-5 py-3 text-chat-text placeholder-chat-muted focus:outline-none focus:border-chat-accent focus:ring-1 focus:ring-chat-accent transition-all text-sm pr-12"
              />
              {text.length > 1800 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-chat-muted">
                  {2000 - text.length}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="w-12 h-12 rounded-2xl bg-chat-accent hover:bg-chat-accent-light flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shrink-0"
            >
              {sending ? (
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </form>
        </footer>
      </div>

    </div>

  );
};

export default ChatWindow;