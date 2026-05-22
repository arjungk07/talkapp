import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../hooks/useMessages";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useMessagesContext } from "../context/MessagesContext";
import TalkAppWallpaper from "../components/TalkAppWallpaper";
import ReplyPreview from "./ReplyPreview";

const ChatWindow = ({ className }) => {
  const { selectedUser } = useAuth();
  const {
    isSelectMode,
    setIsSelectMode,
    selectedMessageIds,
    setSelectedMessageIds,
    isShowMode,
    setIsShowMode,
    isActive,
    setShowPicker,
  } = useMessagesContext();

  const {
    messages,
    loading,
    sending,
    isTyping,
    sendMessage,
    deleteMessages,
    sendReaction,
    emitTyping,
    emitStopTyping,
  } = useMessages(selectedUser);

  const [DeleteModel, setDeleteModel] = useState(false);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // reply state
  console.log(replyingTo);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const footerRef = useRef(null);
  const mainRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null); // focus input when reply is set

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE KEYBOARD FIX
  //
  // ROOT CAUSE: When the soft keyboard opens, mobile browsers shrink
  // window.innerHeight (the "layout viewport"). Any container using h-screen,
  // h-full, or 100vh inherits this shrunken height → the WHOLE layout
  // compresses and everything shifts upward including the header.
  //
  // THE FIX — three-part approach:
  //
  // 1. CONTAINER uses height: 100dvh via inline style. `dvh` = "dynamic
  //    viewport height" — it equals the VISUAL viewport, so it stays locked
  //    to the full screen height and does NOT shrink when the keyboard opens.
  //    Fallback: 100vh for older browsers (still better than h-full/h-screen
  //    which inherit from the layout viewport).
  //
  // 2. FOOTER uses `position: sticky; bottom: 0`. When the keyboard opens,
  //    the page doesn't scroll (our container is fixed height), so sticky
  //    keeps the footer pinned at the bottom of the visible area automatically
  //    — NO JS needed for the footer.
  //
  // 3. MESSAGES AREA gets a dynamic `paddingBottom` via visualViewport JS so
  //    the last message is never hidden behind the keyboard. We also
  //    scrollIntoView after the keyboard animates in.
  //
  // This is the same pattern used by WhatsApp Web, Telegram Web, iMessage.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleViewportChange = () => {
      if (!mainRef.current || !containerRef.current) return;

      // How much of the screen is covered by the keyboard
      const keyboardHeight = Math.max(
        0,
        window.innerHeight - vv.height - (vv.offsetTop ?? 0)
      );

      // Push messages area up so content isn't hidden behind keyboard.
      // The footer is sticky so it handles itself; we only need to pad
      // the scroll container so the last message clears the footer.
      mainRef.current.style.paddingBottom = keyboardHeight > 0
        ? `${keyboardHeight}px`
        : "";

      // Scroll to bottom so the latest message stays visible after keyboard opens
      if (keyboardHeight > 0) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      }
    };

    vv.addEventListener("resize", handleViewportChange);
    vv.addEventListener("scroll", handleViewportChange);

    return () => {
      vv.removeEventListener("resize", handleViewportChange);
      vv.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  // Auto scroll to bottom on new messages / typing indicator
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    clearTimeout(typingTimeoutRef.current);
    emitStopTyping();
    await sendMessage(text, isActive, replyingTo ? { _id: replyingTo._id, text: replyingTo.text} : null);
    setText("");
    setReplyingTo(null); // clear reply after send
  };

  const handleTyping = useCallback(
    (e) => {
      setText(e.target.value);
      emitTyping();
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => emitStopTyping(), 2000);
    },
    [emitTyping, emitStopTyping]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleCancelSelectMode = () => {
    setIsSelectMode(false);
    setIsShowMode(false);
    setSelectedMessageIds([]);
  };

  const handleDeleteSelected = async () => {
    setIsSelectMode(false);
    setDeleteModel(false);
    try {
      await deleteMessages(selectedMessageIds);
      setDeleteModel(false);
      setSelectedMessageIds([]);
      if (typeof setIsShowMode === "function") setIsShowMode(false);
    } catch (error) {
      console.error("Failed to delete messages:", error);
    }
  };

  const handleEmojiClick = async (messageId, emoji) => {
    try {
      setShowPicker(null);
      await sendReaction(messageId, emoji.emoji);
    } catch (error) {
      console.log(error);
    }
  };

  // Called from MessageBubble when user swipes to reply
  const handleReply = (message) => {
    setReplyingTo(message);
    // Focus the input so user can start typing immediately
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // No user selected
  if (!selectedUser) {
    return (
      <div
        className={`${className} flex-1 flex items-center justify-center bg-chat-panel`}
      >
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-chat-panel border border-chat-border flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg
              className="w-12 h-12 text-chat-accent opacity-60"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.02-1.35C8.47 21.52 10.19 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
          <h2 className="text-xl text-chat-text mb-2 font-bold">
            Welcome to TalkApp
          </h2>
          <p className="text-chat-muted text-sm max-w-xs talkapp-font font-medium">
            Select a contact from the sidebar to start a conversation
          </p>
        </div>
      </div>
    );
  }

  // ── Delete Confirm Popup ────────────────────────────────────────────────
  function DeleteMessagePopup({ open, onClose, onDelete }) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-4xl bg-white shadow-[0_20px_80px_rgba(0,0,0,0.18)]"
            >
              <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-red-100 blur-3xl" />

              <motion.button
                whileHover={{ rotate: 90, scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-500 shadow-s transition-colors hover:bg-zinc-200 active:bg-zinc-300 focus:outline-none"
              >
                <X size={18} strokeWidth={2.5} />
              </motion.button>

              <div className="relative z-10 px-7 pb-7 pt-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                  className="mx-auto flex h-15 w-15 items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -5, 0] }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Trash2 className="h-7 w-7 text-red-500" />
                  </motion.div>
                </motion.div>

                <div className="mt-6 text-center">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                    Delete message?
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                    This message will be permanently removed from your
                    conversation history.
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onClose}
                    className="flex-1 cursor-pointer rounded-full border border-zinc-200 bg-zinc-100 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-200"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0px 10px 25px rgba(239,68,68,0.35)",
                    }}
                    whileTap={{ scale: 0.94 }}
                    onClick={onDelete}
                    className="relative cursor-pointer flex-1 overflow-hidden rounded-full bg-linear-to-r from-red-500 to-rose-500 py-3 text-sm font-semibold text-white"
                  >
                    <motion.span
                      initial={{ x: "-120%" }}
                      animate={{ x: "220%" }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                      className="absolute inset-0 w-1/3 skew-x-12 bg-white/30 blur-md"
                    />
                    <span className="relative z-10">Delete</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    /*
      LAYOUT — mobile keyboard safe
      ─────────────────────────────
      • containerRef  → height: 100dvh (dynamic viewport height).
                        dvh tracks the VISUAL viewport so it NEVER shrinks
                        when the keyboard opens. The header and messages stay
                        exactly where they are.
                        Fallback: 100vh for browsers without dvh support.

      • Header        → shrink-0, always at top, never touched.

      • main (messages) → flex-1 + overflow-y-auto + min-h-0.
                          paddingBottom is adjusted via JS when keyboard opens
                          so the last message is never hidden.

      • footer        → position: sticky; bottom: 0; shrink-0.
                        Sticky + the locked container means the footer is
                        always at the visual bottom — no JS translateY needed.
    */
    <div
      ref={containerRef}
      className={`${className} w-full flex flex-col overflow-hidden bg-chat-bg`}
      style={{
        // 100dvh = dynamic viewport height → stays locked to full screen
        // height even when the soft keyboard opens. Falls back to 100vh.
        height: "100dvh",
        // Fallback for browsers that don't support dvh
        // (overridden by the dvh value above when supported)
        minHeight: "-webkit-fill-available",
      }}
    >
      {/* ── HEADER — never moves ── */}
      <div className="shrink-0 z-50 bg-chat-bg">
        <ChatHeader />
      </div>

      {/* ── MESSAGES — scrollable, fills remaining space ── */}
      <main
        ref={mainRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{ transition: "padding-bottom 0.15s ease-out" }}
      >
        <div className="w-full px-4 lg:px-6 py-4 pb-6">
          <TalkAppWallpaper />

          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full w-10 h-10 border-t-4 border-b-4 border-black" />
                <p className="mt-4 font-medium text-black">Loading Messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-chat-panel border border-chat-border flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-chat-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-chat-muted text-sm">No messages yet.</p>
              <p className="text-chat-muted text-xs mt-1">
                Say hello to {selectedUser.name}! 👋
              </p>
            </div>
          ) : (
            <>
              {messages?.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  onEmojiClick={handleEmojiClick}
                  onReply={handleReply}
                  replyingTo={replyingTo}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* ── FOOTER — sticky at visual bottom, never moves ── */}
      <footer
        ref={footerRef}
        className="shrink-0 z-50 bg-chat-bg px-4 py-3"
        style={{
          // sticky + bottom:0 keeps footer pinned to bottom of the locked
          // container without any JS. Safe-area-inset handles iPhone notch/
          // home-bar so the input isn't hidden behind iOS chrome.
          position: "sticky",
          bottom: 0,
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >

        <form
          onSubmit={handleSend}
          className="flex flex-col items-center gap-0 bg-white border border-chat-border rounded-3xl p-2 md:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md"
        >
          {!isSelectMode ? (
            <>
              {/* Reply Preview  */}
              <div className={`${replyingTo ? "block w-full" : "hidden"}`}>
                <ReplyPreview
                  replyingTo={replyingTo}
                  onCancel={() => setReplyingTo(null)}
                />
              </div>

              {/* input field */}
              <div className="flex w-full">
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  name="chat-msg-no-ac"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore
                  enterKeyHint="send"
                  inputMode="text"
                  ref={inputRef}
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message to ${selectedUser.name}...`}
                  maxLength={2000}
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none px-4  text-chat-text placeholder-chat-muted text-sm pr-12"
                />
                {text.length > 1800 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-chat-muted">
                    {2000 - text.length}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="w-10 h-10 rounded-2xl bg-chat-accent hover:bg-chat-accent-light flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:bg-transparent disabled:text-chat-muted text-white shrink-0"
                >
                  {sending ? (
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 translate-x-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>

              </div>


            </>
          ) : (
            <div className="flex items-center gap-4 w-full px-4 py-1.5 animate-fade-in">
              <button
                type="button"
                onClick={handleCancelSelectMode}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {selectedMessageIds.length}{" "}
                  {selectedMessageIds.length === 1 ? "message" : "messages"}{" "}
                  selected
                </span>

                <button
                  type="button"
                  onClick={() => setDeleteModel(true)}
                  disabled={selectedMessageIds.length === 0}
                  className={`p-2 rounded-xl transition-all duration-150 cursor-pointer ${selectedMessageIds.length > 0
                    ? "text-red-500 hover:bg-red-50 active:bg-red-100"
                    : "text-gray-300 cursor-not-allowed"
                    }`}
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


      </footer>

      <DeleteMessagePopup
        open={DeleteModel}
        onClose={() => setDeleteModel(false)}
        onDelete={handleDeleteSelected}
      />
    </div>
  );
};

export default ChatWindow;