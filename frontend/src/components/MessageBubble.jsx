import React, { useRef, useEffect } from "react";
import { format } from "date-fns";
import MessageActionsBar from "../components/MessageActionBar";
import { useAuth } from "../context/AuthContext";
import { useMessagesContext } from "../context/MessagesContext";
import EmojiPicker from "emoji-picker-react";

const MessageBubble = ({ message, onEmojiClick, onDelete }) => {
  const { user } = useAuth();
  const {
    isShowMode, //trigger message action bar like delete, forward, reaction 
    setIsShowMode,
    isSelectMode, // show multiple checkoxes to select multiple messages
    selectedMessageIds, //ids of selected messages
    setSelectedMessageIds,
    showPicker,
    setShowPicker
  } = useMessagesContext();

  // Guard Clause: If message data or auth user is missing, don't crash
  if (!message || !message.senderId || !user) {
    return null;
  }

  const bubbleRef = useRef(null);
  const isSent = message.senderId === user._id;


  // Standardize selected item tracking safely as arrays
  const isSelected = Array.isArray(selectedMessageIds)
    ? selectedMessageIds.includes(message._id)
    : selectedMessageIds === message._id;

  const isThisMessageSelected = isSelected;

  // --- CLICK OUTSIDE / CLOSE LOGIC ---
  useEffect(() => {
    if (!isShowMode || !isThisMessageSelected) return;

    const handleClickOutside = (event) => {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target)) {
        setIsShowMode(false);

        if (Array.isArray(selectedMessageIds)) {
          setSelectedMessageIds([]);
        } else {
          setSelectedMessageIds(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShowMode, isThisMessageSelected, selectedMessageIds, setIsShowMode, setSelectedMessageIds, showPicker, setShowPicker]);

  useEffect(() => {
    if (!showPicker) return;
    const handleEmojiClickOutside = (event) => {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target)) {
        setShowPicker(null);
      }
    };
    document.addEventListener("mousedown", handleEmojiClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleEmojiClickOutside);
    };
  }, [showPicker, setShowPicker]);



  let pressTimer;

  // --- SELECTION / ACTION LOGIC ---
  const triggerDelete = () => {
    if (!isSent) return;

    setIsShowMode(true);

    if (typeof setSelectedMessageIds === "function") {
      if (Array.isArray(selectedMessageIds)) {
        if (!selectedMessageIds.includes(message._id)) {
          setSelectedMessageIds([...selectedMessageIds, message._id]);
        }
      } else {
        setSelectedMessageIds(message._id);
      }
    }
  };

  const handlePressStart = () => {
    pressTimer = setTimeout(triggerDelete, 600);
  };

  const handlePressEnd = () => {
    clearTimeout(pressTimer);
  };

  const handleContextMenu = (e) => {
    if (!isSent) return;
    e.preventDefault();
    triggerDelete();
  };

  const handleToggleSelectMessage = (messageId) => {
    setSelectedMessageIds((prev) => {
      // 1. Sanitize 'prev' into a guaranteed array using standard if/else
      let prevArray;
      if (Array.isArray(prev)) {
        prevArray = prev; // prev is already an array 
      } else if (prev !== null) {
        prevArray = [prev]; // prev is a single value
      } else {
        prevArray = []; // prev is null or undefined
      }

      // 2. Toggle logic using standard if/else
      if (prevArray.includes(messageId)) {
        // If already selected, remove it
        return prevArray.filter((id) => id !== messageId);
      } else {
        // If not selected, add it
        return [...prevArray, messageId];
      }
    });
  };

  // Click handler for the root message wrapper block
  const handleRowClick = (e) => {
    // If we are in multi-select mode, prioritize checking/unchecking the message row
    if (isSelectMode) {
      handleToggleSelectMessage(message._id);
    }
  };







  return (
    <div
      ref={bubbleRef}
      onClick={handleRowClick}
      className={`
        flex  mb-3 px-2 relative group select-none cursor-pointer transition-all duration-200 gap-3 items-center
        ${isSent ? "justify-end " : "justify-start"} 
        ${showPicker === message._id ? `flex-col-reverse ${isSent ? "items-end" : "items-start"} xl:flex-row xl:items-center` : ""}
        ${isSelectMode ? "justify-between! p-2 rounded-xl bg-gray-50/50 hover:bg-green-50/60 cursor-pointer active:scale-[0.99]" : ""}
        ${isSelectMode && isSelected ? "bg-green-100/50 hover:bg-green-100/70" : ""}
      `}
    >
      {/* Checkbox to select multiple messages */}
      {isSelectMode && (
        <input
          type="checkbox"
          id={`select-${message._id}`}
          checked={isSelected}
          onChange={() => handleToggleSelectMessage(message._id)}
          onClick={(e) => e.stopPropagation()} // Stop bubbling event double triggers
          className="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer accent-green-600 transition-all duration-300 scale-110 animate-bubble-pop shrink-0"
        />
      )}

      {/* Popover Action Menu Bar */}
      {isShowMode && isSent && isThisMessageSelected && (
        <div className="absolute -top-10 z-99 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-4">
          <MessageActionsBar messageId={message._id} onDelete={onDelete} />
        </div>
      )}



      {/* hover emoji icon */}
      <div className={` ${isSent ? "justify-end" : "order-1"} ${message.reactions?.length > 0 ? "mb-5" : ""} flex flex-1 items-center group opacity-0 group-hover:opacity-100  pointer-events-auto transition-opacity duration-150 ease-in-out z-10`}>
        <div className="flex items-center justify-center p-1 bg-white border border-gray-100 rounded-full shadow-md">

          <div
            ref={bubbleRef}
            role="button"
            onClick={(e) => {
              setShowPicker(showPicker === message._id ? null : message._id)
            }}
            class="flex items-center justify-center p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150 ease-in-out cursor-pointer outline-none select-none shrink-0"
          >
            <button >
              <span aria-hidden="true" class="w-5 h-5 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 24 24" class="w-full h-full fill-current" preserveAspectRatio="xMidYMid meet">
                  <title>ic-mood</title>
                  <path d="M15.5 11C15.9167 11 16.2708 10.8542 16.5625 10.5625C16.8542 10.2708 17 9.91667 17 9.5C17 9.08333 16.8542 8.72917 16.5625 8.4375C16.2708 8.14583 15.9167 8 15.5 8C15.0833 8 14.7292 8.14583 14.4375 8.4375C14.1458 8.72917 14 9.08333 14 9.5C14 9.91667 14.1458 10.2708 14.4375 10.5625C14.7292 10.8542 15.0833 11 15.5 11ZM8.5 11C8.91667 11 9.27083 10.8542 9.5625 10.5625C9.85417 10.2708 10 9.91667 10 9.5C10 9.08333 9.85417 8.72917 9.5625 8.4375C9.27083 8.14583 8.91667 8 8.5 8C8.08333 8 7.72917 8.14583 7.4375 8.4375C7.14583 8.72917 7 9.08333 7 9.5C7 9.91667 7.14583 10.2708 7.4375 10.5625C7.72917 10.8542 8.08333 11 8.5 11ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20ZM12 17.5C12.9667 17.5 13.8583 17.2667 14.675 16.8C15.4917 16.3333 16.15 15.7 16.65 14.9C16.75 14.7 16.7417 14.5 16.625 14.3C16.5083 14.1 16.3333 14 16.1 14H7.9C7.66667 14 7.49167 14.1 7.375 14.3C7.25833 14.5 7.25 14.7 7.35 14.9C7.85 15.7 8.5125 16.3333 9.3375 16.8C10.1625 17.2667 11.05 17.5 12 17.5Z"></path>
                </svg>
              </span>
            </button>

          </div>

        </div>
      </div>


      <div
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onContextMenu={handleContextMenu}
        className={`
    
    animate-bubble-pop
    md:max-w-[50%]
    flex flex-col gap-1
    ${isSent ? "items-end" : "items-start"}
    ${isSent && showPicker ? "order-2" : ""}
    ${isThisMessageSelected ? "opacity-90 scale-[0.99] transition-all" : ""}
  `}
      >
        {/* 1. Main Message Content Bubble */}
        <div
          className={`
      relative overflow-hidden
      px-5 py-2 flex flex-col 
      text-[15px] font-medium
      rounded-[22px]
      transition-all duration-300
      ${isSent
              ? `bg-[linear-gradient(135deg,#C5E8FF_15%,#E8F7FF_100%)] text-[#1A1A1A] rounded-[6px]`
              : `bg-chat-muted/15 text-[#2B2B2B] rounded-bl-[6px]`
            }
    `}
        >
          {/* Text String Display */}
          <p className={`text-sm leading-relaxed wrap-break-word whitespace-pre-wrap ${isSent ? "text-gray-900" : "text-chat-text"}`}>
            {message.text}
          </p>

          {/* Timestamp details */}
          <div className={`flex items-center gap-1 mt-0.5 justify-end`}>
            <span className={`text-[10px] text-chat-muted`}>
              {message.createdAt ? format(new Date(message.createdAt), "hh:mm a") : "--:--"}
            </span>

            {isSent && (
              message.read ? (
                <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" className="text-blue-500" fill="none"><title>msg-dblcheck</title><path fill="currentColor" d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z"></path></svg>
              ) : (
                <svg viewBox="0 0 12 10" height="11" width="16" preserveAspectRatio="xMidYMid meet" className="" fill="none"><title>msg-check</title><path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="#4a5568" d="M1 5l3 3 6-6" /></svg>
              )
            )}
          </div>
        </div>

        {/* 2. Display Selected Emojis UI (Directly under the bubble) */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 max-w-full z-10 -mt-2 px-2 animate-in zoom-in-95 duration-100">
            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-100  px-2 py-0.5 rounded-full text-xs">
              <span className="flex items-center gap-0.5">
                {/* Extracts the raw emoji strings out of the updated array structure */}
                {[...new Set(message.reactions.map((r) => r.emoji))].map((emoji, idx) => (
                  <span key={idx}>{emoji}</span>
                ))}
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-medium pl-1 ml-0.5 scale-90">
                {message.reactions.length}
              </span>
            </div>
          </div>
        )}

      </div>



      {/* The Conditional Smart Picker */}
      {showPicker === message._id && (
        <div className={`flex items-center justify-center`}>
          <EmojiPicker
            onEmojiClick={(emoji) => onEmojiClick(message._id, emoji)}
            autoFocusSearch={false}
            theme="light"
            width={320}
            height={350}
            skinTonesDisabled
            searchPlaceHolder="Search reactions..."
          />
        </div>
      )}


    </div>
  );
};

export default MessageBubble;