import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../hooks/useMessages";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useMessagesContext } from "../context/MessagesContext";
import TalkAppWallpaper from "../components/TalkAppWallpaper";

const ChatWindow = ({ className }) => {
  const { selectedUser } = useAuth();
  const {
    isSelectMode,
    setIsSelectMode,
    selectedMessageIds,
    setSelectedMessageIds,
    setIsShowMode,
    isActive,
    setShowPicker,
  } = useMessagesContext();

  const { messages, loading, sending, isTyping, sendMessage, deleteMessages, sendReaction, emitTyping, emitStopTyping } = useMessages(selectedUser);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);


  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    clearTimeout(typingTimeoutRef.current);
    emitStopTyping();
    await sendMessage(text, isActive);
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

  // --- DELETE & SELECTION LOGIC ---

  // Enter select mode and automatically check the message where "Delete" was clicked
  const handleStartDeleteMode = (messageId) => {
    setIsSelectMode(true);
    setSelectedMessageIds([messageId]);
  };



  const handleCancelSelectMode = () => {
    setIsSelectMode(false);
    setSelectedMessageIds([]);
    console.log("Select mode cancelled");
  };

  const handleDeleteSelected = async () => {
    console.log("Selected Message IDs", selectedMessageIds);
    setIsSelectMode(false);

    try {
      await deleteMessages(selectedMessageIds);
      console.log("Messages deleted successfully");
      setSelectedMessageIds([]);
      if (typeof setIsShowMode === "function") setIsShowMode(false);
    } catch (error) {
      console.error("Failed to delete messages:", error);
    }


  };

  const handleEmojiClick = async (messageId, emoji) => {

    try {
      // Close the open picker panel
      setShowPicker(null);
      await sendReaction(messageId, emoji.emoji);


    } catch (error) {
      console.log(error);
    }
  }


  // No user selected — only visible on desktop (parent hides this on mobile)
  if (!selectedUser) {
    return (
      <div className={`${className} flex-1 flex items-center h-screen justify-center bg-chat-panel`}>
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-chat-panel border border-chat-border flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-12 h-12 text-chat-accent opacity-60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.02-1.35C8.47 21.52 10.19 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
          <h2 className="text-xl text-chat-text mb-2 font-bold">Welcome to TalkApp</h2>
          <p className="text-chat-muted text-sm max-w-xs talkapp-font font-medium">
            Select a contact from the sidebar to start a conversation
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className={`w-full h-dvh flex flex-col overflow-hidden bg-chat-bg`}>


      {/* HEADER */}
      <div className="sticky top-0 z-50 shrink-0 bg-chat-bg">
        <ChatHeader />
      </div>

      {/* MESSAGES */}
      <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 pb-28 custom-scrollbar">
        <TalkAppWallpaper />
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full w-10 h-10 border-t-4 border-b-4 border-black" />
              <p className="mt-4 font-medium text-black">Loading Messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-chat-panel border border-chat-border flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-chat-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-chat-muted text-sm">No messages yet.</p>
              <p className="text-chat-muted text-xs mt-1">Say hello to {selectedUser.name}! 👋</p>
            </div>            </div>
        ) : (
          <>
            {messages?.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                onDelete={handleStartDeleteMode}
                onEmojiClick={handleEmojiClick}
              />
            ))}

            {isTyping && <TypingIndicator />}
          </>
        )}

        <div ref={bottomRef} />
      </main>

      {/* FOOTER */}
      <footer className="bg-white h-10 w-full">
        <div className="absolute bottom-3 left-0 right-0 z-50 px-4 max-w-4xl mx-auto w-full">

          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 bg-white border border-chat-border rounded-3xl p-2 md:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md"
          >
            {!isSelectMode ? (
              <>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    autoComplete="off"
                    data-1p-ignore="true"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    enterKeyHint="send"
                    inputMode="text"
                    data-form-type="other"
                    value={text}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message to ${selectedUser.name}...`}
                    maxLength={2000}
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none px-4 py-2.5 text-chat-text placeholder-chat-muted text-sm pr-12"
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
                  className="w-10 h-10 rounded-2xl bg-chat-accent hover:bg-chat-accent-light flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:bg-transparent disabled:text-chat-muted text-white shrink-0"
                >
                  {sending ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4 w-full px-4 py-1.5 animate-fade-in">
                <button
                  type="button"
                  onClick={handleCancelSelectMode}
                  className="text-sm font-medium text-gray-500  hover:text-gray-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedMessageIds.length} {selectedMessageIds.length === 1 ? 'message' : 'messages'} selected
                  </span>

                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={selectedMessageIds.length === 0}
                    className={`p-2 rounded-xl transition-all duration-150 cursor-pointer
              ${selectedMessageIds.length > 0
                        ? 'text-red-500 hover:bg-red-50 active:bg-red-100'
                        : 'text-gray-300 cursor-not-allowed'}
            `}
                    title="Delete Selected"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9C9 3.45 9.45 3 10 3H14C14.55 3 15 3.45 15 4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM10 17H12V9H10V17ZM14 17H16V9H14V17Z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </footer>


    </div>

  );
};

export default ChatWindow;