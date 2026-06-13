import React, { useRef, useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import MessageActionsBar from "../components/MessageActionBar";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import EmojiPicker from "emoji-picker-react";
import ReplyPreview from "./ReplyPreview";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const REPLY_THRESHOLD = 72;
const MAX_DRAG = 90;

// ── ImageBubble 
const IMAGE_NOT_FOUND =
  "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png";

const ImageBubble = ({ message, isSent, selectedUser, longPressTriggered }) => {

  const { isSelectMode } = useAppContext();

  const navigate = useNavigate();
  const attachments = Array.isArray(message.attachments)
    ? message.attachments
    : [];

  const openPreview = (attachment) => {

    // this prevent user press long for selection not open
    if (longPressTriggered.current) { return };

    if (isSelectMode) return;

    navigate("/image-preview", {
      state: {
        imageUrl: attachment.localUrl || attachment.url,
        senderName: selectedUser?.name,
        createdAt: message.createdAt,
        isSent,
      },
    });
  };

  return (
    <div className="relative max-w-80 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            onClick={() => openPreview(attachment)}
            className={`relative aspect-square overflow-hidden select-none rounded-lg ${attachments.length > 1 ? "w-[calc(50%-4px)]" : "w-full"
              }`}
          >
            {attachment.fileType === "image" && (
              <>
                <img
                  src={attachment.localUrl || attachment.url || IMAGE_NOT_FOUND}
                  alt={attachment.fileName || `Attachment ${index + 1}`}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = IMAGE_NOT_FOUND;
                  }}
                />

                {!isSent && (
                  <div className="fixed -top-3 left-2 z-10 bg-[url('https://img.freepik.com/free-vector/blurred-pink-tones-background_1102-31.jpg?semt=ais_hybrid&w=740&q=80')] bg-cover bg-center bg-no-repeat px-2 py-1 rounded-full">
                    <p className="w-full text-xs font-bold">{selectedUser?.name}</p>
                  </div>
                )}

                {/* Timestamp + Read Receipt Overlay */}
                <div className="absolute bottom-2 z-10 right-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-white">
                  <span className="text-[10px]">
                    {message.createdAt
                      ? format(new Date(message.createdAt), "hh:mm a")
                      : "--:--"}
                  </span>
                  {isSent &&
                    (message.read ? (
                      <svg
                        viewBox="0 0 16 11"
                        height="11"
                        width="16"
                        preserveAspectRatio="xMidYMid meet"
                        className="text-blue-400"
                        fill="none"
                      >
                        <path
                          fill="currentColor"
                          d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 12 10"
                        height="11"
                        width="16"
                        preserveAspectRatio="xMidYMid meet"
                        fill="none"
                      >
                        <path
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          strokeWidth="1.5"
                          fill="none"
                          stroke="white"
                          d="M1 5l3 3 6-6"
                        />
                      </svg>
                    ))}
                </div>

                {/* Upload pending spinner */}
                {message.pending && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full border-4 border-white/20"></div>
                      <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};





// ── Main Component ────────────────────────────────────────────────────────────
const MessageBubble = ({ message, onEmojiClick, onReply, searchQuery, registerMessageRef }) => {
  const { user, selectedUser } = useAuth();
  const {
    isShowMode, setIsShowMode,
    isSelectMode, setIsSelectMode,
    selectedMessageIds, setSelectedMessageIds,
    showPicker, setShowPicker,
    selectedMsg, setSelectedMsg,
  } = useAppContext();

  // ── All hooks BEFORE any early return ────────────────────────────────────
  const [fullView, setFullView] = useState(false);

  const bubbleRef = useRef(null);
  const actionBarRef = useRef(null);
  const emojiRef = useRef(null);
  const pressTimer = useRef(null);
  const replyFired = useRef(false);

  // Capture bubble rect for portal positioning
  const [bubbleRect, setBubbleRect] = useState(null);

  // Motion values
  const x = useMotionValue(0);
  const replyIconOpacity = useTransform(
    x,
    [0, REPLY_THRESHOLD * 0.5, REPLY_THRESHOLD],
    [0, 0.4, 1]
  );
  const replyIconX = useTransform(x, [0, REPLY_THRESHOLD], [-100, -50]);
  const replyIconScale = useTransform(
    x,
    [0, REPLY_THRESHOLD * 0.7, REPLY_THRESHOLD],
    [0.6, 0.85, 1.15]
  );
  const bubbleScale = useTransform(x, [0, MAX_DRAG], [1, 0.97]);

  // ── Derived values (safe to compute even if message is null) ──────────────
  const isSent = message?.senderId === user?._id;
  const isSelected = Array.isArray(selectedMessageIds)
    ? selectedMessageIds.includes(message?._id)
    : selectedMessageIds === message?._id;
  const hasAttachments =
    message?.attachments && message.attachments.length > 0;
  const isPickerOpen = showPicker === message?._id;

  // ── Reset emoji picker state fully ───────────────────────────────────────
  const resetEmojiView = useCallback(() => {
    setShowPicker(null);
    setFullView(false);
  }, [setShowPicker]);

  // ── Click-outside: action bar ─────────────────────────────────────────────
  useEffect(() => {
    if (!isShowMode || !isSelected) return;
    const onDown = (e) => {
      if (
        !bubbleRef.current?.contains(e.target) &&
        !actionBarRef.current?.contains(e.target)
      ) {
        setIsShowMode(false);
        setSelectedMessageIds([]);
        setSelectedMsg([]);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isShowMode, isSelected, setIsShowMode, setSelectedMessageIds, setSelectedMsg]);

  // ── Click-outside: emoji picker (compact + full) ──────────────────────────
  useEffect(() => {
    if (!isPickerOpen) return;

    const onDown = (e) => {
      // Let clicks inside the picker ref pass through
      if (emojiRef.current?.contains(e.target)) return;
      // Let clicks on the bubble's emoji toggle button pass through
      if (bubbleRef.current?.contains(e.target)) return;
      // Everything else closes the picker
      resetEmojiView();
    };

    // Use capture phase so we catch clicks before they bubble
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
    };
  }, [isPickerOpen, resetEmojiView]);

  // ── Update bubbleRect when picker opens so portal is positioned correctly ─
  useEffect(() => {
    if (isPickerOpen && bubbleRef.current) {
      setBubbleRect(bubbleRef.current.getBoundingClientRect());
    }
  }, [isPickerOpen]);

  // ── Guard: render nothing if message/user data is missing ─────────────────
  if (!message || !message.senderId || !user) return null;

  // ── Drag callbacks ─────────────────────────────────────────────────────────
  const handleDragStart = () => {
    clearTimeout(pressTimer.current);
  };

  const handleDrag = (_, info) => {
    if (info.offset.x >= REPLY_THRESHOLD && !replyFired.current) {
      replyFired.current = true;
      navigator.vibrate?.(30);
      onReply?.(message);
    }
  };

  const handleDragEnd = () => {
    animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    replyFired.current = false;
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const triggerSelect = () => {
    if (typeof setSelectedMsg === "function") {
      setSelectedMsg((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.some((m) => m._id === message._id)
          ? arr.filter((m) => m._id !== message._id)
          : [...arr, message];
      });
    }
    if (typeof setSelectedMessageIds === "function") {
      setSelectedMessageIds((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.includes(message._id)
          ? arr.filter((id) => id !== message._id)
          : [...arr, message._id];
      });
    }
  };

  const handleToggleSelectMessage = (msg) => {
    if (!msg?._id) return;
    if (typeof setSelectedMsg === "function") {
      setSelectedMsg((prev) => {
        const arr = Array.isArray(prev) ? prev : prev != null ? [prev] : [];
        return arr.some((m) => m?._id === msg._id)
          ? arr.filter((m) => m?._id !== msg._id)
          : [...arr, msg];
      });
    }
    if (typeof setSelectedMessageIds === "function") {
      setSelectedMessageIds((prev) => {
        const arr = Array.isArray(prev) ? prev : prev != null ? [prev] : [];
        return arr.includes(msg._id)
          ? arr.filter((id) => id !== msg._id)
          : [...arr, msg._id];
      });
    }
  };

  const longPressTriggered = useRef(false);

  // ── Long-press (mobile select) ─────────────────────────────────────────────
  const handlePressStart = () => {
    longPressTriggered.current = false;

    if (fullView) return;

    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setIsShowMode(false);
      setIsSelectMode(true);
      // Update bubble rect before opening picker
      if (bubbleRef.current) {
        setBubbleRect(bubbleRef.current.getBoundingClientRect());
      }
      setShowPicker(isPickerOpen ? null : message._id);
      triggerSelect();
    }, 600);
  };

  const handlePressEnd = () => clearTimeout(pressTimer.current);

  // ── Right-click (desktop) ──────────────────────────────────────────────────
  const handleContextMenu = (e) => {
    if (navigator.maxTouchPoints > 0) return;
    e.preventDefault();
    setIsShowMode(true);
    triggerSelect();
  };

  const handleRowClick = () => {
    if (isSelectMode) handleToggleSelectMessage(message);
  };

  const handledelete = () => {
    setIsSelectMode(true);
    setIsShowMode(false);
  };

  // ── Emoji picker toggle (hover button) ────────────────────────────────────
  const handleEmojiToggle = () => {
    if (bubbleRef.current) {
      setBubbleRect(bubbleRef.current.getBoundingClientRect());
    }
    if (isPickerOpen) {
      resetEmojiView();
    } else {
      setFullView(false);
      setShowPicker(message._id);
    }
  };

  // ── Emoji click handler ────────────────────────────────────────────────────
  // FIX: compact picker passes { emoji } correctly; full picker uses emojiData.emoji


  const handleCompactEmojiClick = (emoji) => {
    onEmojiClick?.(message._id, { emoji });
    resetEmojiView();
  };

  const handleFullEmojiClick = (emojiData) => {
    onEmojiClick?.(message._id, { emoji: emojiData.emoji });
    resetEmojiView();
  };

  const isDragEnabled = !isSelectMode;

  // ── Compact picker position: above the bubble ──────────────────────────────
  const compactPickerStyle = bubbleRect
    ? {
      position: "fixed",
      // Place above the bubble with a small gap
      top: bubbleRect.top + 10,
      // Align to bubble's left edge but keep it on screen
      left: Math.min(
        Math.max(bubbleRect.left, 8),
        window.innerWidth - 320
      ),
      zIndex: 9999,
    }
    : { display: "none" };

  const highlightText = (text, query) => {
    if (!query) return text;

    const regex = new RegExp(
      `(${query})`,
      "gi"
    );

    return text
      .split(regex)
      .map((part, index) =>
        part.toLowerCase() ===
          query.toLowerCase() ? (
          <mark
            key={index}
            className="bg-yellow-300 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
  };


  // ── Full picker: centered at bottom of screen ──────────────────────────────
  return (
    <motion.div
      ref={bubbleRef}
      drag={isDragEnabled ? "x" : false}
      dragDirectionLock
      dragConstraints={{ left: 0, right: MAX_DRAG }}
      dragElastic={{ left: 0, right: 0.15 }}
      style={{ x, scale: bubbleScale }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onContextMenu={handleContextMenu}
      onClick={handleRowClick}
      className={`
        flex mb-3 px-2 relative group transition-colors duration-200 gap-3 items-center select-none
        ${isSent ? "justify-end" : "justify-start"}
        ${isSelectMode
          ? `rounded-xl ${isSent ? "md:justify-between!" : ""} bg-gray-50/50 hover:bg-green-50/60 active:scale-[0.99]`
          : ""}
        ${isSelectMode && isSelected ? "bg-green-100/50 hover:bg-green-100/70" : ""}
      `}
    >
      {/* Reply icon — revealed from the left as row slides right */}
      <motion.div
        aria-hidden="true"
        style={{
          opacity: replyIconOpacity,
          scale: replyIconScale,
          position: "absolute",
          left: replyIconX,
          zIndex: 0,
          pointerEvents: "none",
        }}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-500 fill-current">
          <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
        </svg>
      </motion.div>

      {/* ── Multi-select Checkbox ──────────────────────────────────────────── */}
      {isSelectMode && (
        <input
          type="checkbox"
          id={`select-${message._id}`}
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            handleToggleSelectMessage(message);
          }}
          className="hidden md:block w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer accent-green-600 transition-all duration-300 scale-110 animate-bubble-pop shrink-0"
        />
      )}

      {/* ── Action Bar Popover ─────────────────────────────────────────────── */}
      {isShowMode && isSelected && (
        <div
          ref={actionBarRef}
          className={`absolute -top-10 z-99 ${isSent ? "left-auto right-0" : "left-2"}`}
        >
          <MessageActionsBar
            messageId={message._id}
            handledelete={handledelete}
          />
        </div>
      )}

      {/* ── Hover Emoji Button (desktop md+) ──────────────────────────────── */}
      {!isSelectMode && (
        <div
          className={`
            ${isSent ? "justify-end" : "order-1"}
            ${message.reactions?.length > 0 ? "mb-5" : ""}
            group hidden md:group-hover:flex items-center
            pointer-events-auto transition-opacity duration-150 z-10
          `}
        >
          <div className="flex items-center justify-center p-1 bg-white border border-gray-100 rounded-full shadow-md">
            <div
              role="button"
              onClick={handleEmojiToggle}
              className="flex items-center justify-center p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150 cursor-pointer outline-none select-none shrink-0"
            >
              <span
                aria-hidden="true"
                className="w-5 h-5 flex items-center justify-center pointer-events-none"
              >
                <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                  <path d="M15.5 11C15.9167 11 16.2708 10.8542 16.5625 10.5625C16.8542 10.2708 17 9.91667 17 9.5C17 9.08333 16.8542 8.72917 16.5625 8.4375C16.2708 8.14583 15.9167 8 15.5 8C15.0833 8 14.7292 8.14583 14.4375 8.4375C14.1458 8.72917 14 9.08333 14 9.5C14 9.91667 14.1458 10.2708 14.4375 10.5625C14.7292 10.8542 15.0833 11 15.5 11ZM8.5 11C8.91667 11 9.27083 10.8542 9.5625 10.5625C9.85417 10.2708 10 9.91667 10 9.5C10 9.08333 9.85417 8.72917 9.5625 8.4375C9.27083 8.14583 8.91667 8 8.5 8C8.08333 8 7.72917 8.14583 7.4375 8.4375C7.14583 8.72917 7 9.08333 7 9.5C7 9.91667 7.14583 10.2708 7.4375 10.5625C7.72917 10.8542 8.08333 11 8.5 11ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20ZM12 17.5C12.9667 17.5 13.8583 17.2667 14.675 16.8C15.4917 16.3333 16.15 15.7 16.65 14.9C16.75 14.7 16.7417 14.5 16.625 14.3C16.5083 14.1 16.3333 14 16.1 14H7.9C7.66667 14 7.49167 14.1 7.375 14.3C7.25833 14.5 7.25 14.7 7.35 14.9C7.85 15.7 8.5125 16.3333 9.3375 16.8C10.1625 17.2667 11.05 17.5 12 17.5Z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Bubble + Reactions ─────────────────────────────────────────────── */}
      <div
        ref={(el) =>
          registerMessageRef(message._id, el)
        }
        className={`
          animate-bubble-pop
          max-w-[90%] sm:max-w-[75%] md:max-w-[50%]
          flex flex-col relative z-10
          ${isSent ? "items-end" : "items-start"}
          ${isSelected ? "opacity-90 scale-[0.99] transition-all" : ""}
        `}
      >
        {/* replypreview / image / text / timestamp / emoji reaction ui section */}
        <div

          className={`
            relative overflow-visible flex flex-col gap-1 text-[15px] font-medium rounded-[14px] transition-all duration-300
            ${message.replyingTo ? "p-0.5" : hasAttachments ? "p-1" : "ps-5 pt-1 pe-3"}
            ${isSent
              ? "bg-chat-panel bg-[url('https://img.magnific.com/free-vector/elegant-gradient-background_1340-3948.jpg?semt=ais_hybrid&w=740&q=80')] opacity-90 bg-cover bg-center bg-no-repeat text-[#1A1A1A] rounded-br-xs after:absolute after:bottom-0 after:-right-2 after:w-0 after:h-0 after:border-l-9 after:border-l-[#600307] after:border-t-8 after:border-t-transparent"
              : "bg-chat-surface text-[#2B2B2B] rounded-bl-md before:absolute before:bottom-0 before:-left-1.5 before:w-0 before:h-0 before:border-r-8 before:border-r-chat-surface before:border-t-8 before:border-t-transparent"
            }
          `}
        >
          {/* ReplyPreview */}
          {message.replyingTo && (
            <div>
              <ReplyPreview replyingTobubble={message.replyingTo} />
            </div>
          )}

          {/* Image or Text bubble */}
          {hasAttachments ? (
            <ImageBubble
              message={message}
              isSent={isSent}
              selectedUser={selectedUser}
              longPressTriggered={longPressTriggered}
            />
          ) : (
            <p
              className={`text-sm ${message.replyingTo ? "ps-3 pe-3" : ""
                } leading-relaxed select-none md:select-text wrap-break-word cursor-text whitespace-pre-wrap ${isSent ? "text-white" : "text-chat-text"
                }`}
            >
              {highlightText(
                message.text,
                searchQuery
              )}
            </p>
          )}

          {/* Timestamp + Read receipt */}
          {!hasAttachments && (
            <div
              className={`flex items-center gap-1 mb-2 justify-end ${message.replyingTo ? "px-2 pb-1" : ""
                }`}
            >
              <span
                className={`text-[10px] ${isSent ? "text-white/90" : "text-black"}`}
              >
                {message.createdAt
                  ? format(new Date(message.createdAt), "hh:mm a")
                  : "--:--"}
              </span>
              {isSent &&
                (message.read ? (
                  <svg
                    viewBox="0 0 16 11"
                    height="11"
                    width="16"
                    preserveAspectRatio="xMidYMid meet"
                    className="text-blue-500"
                    fill="none"
                  >
                    <path
                      fill="currentColor"
                      d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 12 10"
                    height="11"
                    width="16"
                    preserveAspectRatio="xMidYMid meet"
                    fill="none"
                  >
                    <path
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      fill="none"
                      stroke="white"
                      d="M1 5l3 3 6-6"
                    />
                  </svg>
                ))}
            </div>
          )}
        </div>

        {/* Emoji reactions display */}
        {message.reactions?.length > 0 && (
          <div
            className={`flex gap-1 z-10 ${isSent ? "-mt-2" : "-mt-3"
              } px-2`}
            data-aos="zoom-in"
            data-aos-duration="300"
          >
            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 px-2 py-0.5 rounded-full text-xs">
              <span className="flex items-center gap-0.5">
                {[...new Set(message.reactions.map((r) => r.emoji))].map(
                  (emoji, idx) => (
                    <span
                      key={idx}
                      className="w-5 h-5 flex items-center justify-center"
                    >
                      {emoji}
                    </span>
                  )
                )}
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-medium scale-90">
                {message.reactions.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Emoji Picker (portaled) ────────────────────────────────────────── */}
      {isPickerOpen &&
        createPortal(
          <>
            {/* Compact Picker — shown when !fullView */}
            {!fullView && (
              <div ref={emojiRef} style={compactPickerStyle}>
                <div className="flex items-center gap-2 px-2 py-1.5 bg-white rounded-xl shadow-xl border border-gray-100">
                  {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompactEmojiClick(emoji);
                      }}
                      className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                  {/* Expand to full picker */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullView(true);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Show full emoji picker"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Full Picker — shown when fullView */}
            {fullView && (
              <div
                ref={emojiRef}
                className="fixed inset-0 z-50 flex items-end justify-center"
                // Backdrop click closes full picker (but not picker itself)
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) resetEmojiView();
                }}
              >
                {/* Semi-transparent backdrop */}
                <div className="absolute inset-0 bg-black/20" />

                <div className="relative w-87.5 md:w-125 z-10 bg-white rounded-t-2xl shadow-2xl pb-safe">
                  <EmojiPicker
                    onEmojiClick={(emojiData, e) => {
                      e.stopPropagation?.();
                      handleFullEmojiClick(emojiData);
                    }}
                    width='100%'
                    height={380}
                    theme="light"
                  />
                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSelectMode(false)
                      resetEmojiView();
                    }}
                    className="absolute -top-3 -right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 shadow-md transition-colors text-sm font-medium"
                    aria-label="Close emoji picker"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </>,
          document.body
        )}
    </motion.div>
  );

};

export default MessageBubble;