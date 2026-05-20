import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useMessagesContext } from '../context/MessagesContext';

// Reusable Button Component optimized for an overlay icon bar
const ActionButton = ({ label, children,onClick, isDestructive = false }) => {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      role="menuitem"
      onClick={onClick}
      className={`
        flex items-center justify-center p-2 rounded-full 
        cursor-pointer transition-all duration-150 ease-in-out
        shrink-0
        ${isDestructive
          ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}
      `}
    >
      <div className="h-5 w-5 flex items-center justify-center pointer-events-none">
        {children}
      </div>
    </button>
  );
};

export default function MessageActionsBar({messageId, handledelete}) {
 
  const { isSelectMode, setIsSelectMode, isShowMode, setIsShowMode ,showPicker,setShowPicker} = useMessagesContext();

  
  // State for toggling emoji picker visibility
  const containerRef = useRef(null);


  const handleEmojiClick = (emojiObject, messageId) => {
  const selectedEmoji = emojiObject.emoji;
  console.log("Selected emoji:", selectedEmoji);

  // 1. Emit to socket so other clients get it instantly
  if (socket) {
    socket.emit("send-message-reaction", {
      messageId: messageId,
      emoji: selectedEmoji,
      userId: currentUser.id, // Pass current user's ID to keep track of who reacted
    });
  }

  // 2. Optimistically update local UI state immediately
  setMessages((prevMessages) =>
    prevMessages.map((msg) => {
      if (msg.id === messageId) {
        // Handle logic if reactions array already contains this emoji or user
        const existingReactions = msg.reactions || [];
        return {
          ...msg,
          reactions: [...existingReactions, { emoji: selectedEmoji, userId: currentUser.id }],
        };
      }
      return msg;
    })
  );

  setShowPicker(false); // Close the picker view
};

  // Close the emoji picker if clicking anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div className="
        relative top-5 right-4 z-10
        flex flex-row items-center gap-0.5 p-1 
        bg-white border border-gray-100 rounded-full shadow-md 
        scale-95
        group-hover:scale-100 
        transition-all duration-200 ease-out
      ">
        <ActionButton label="Reply">
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current ">
            <path d="M6.82502 12L9.72502 14.9C9.92502 15.1 10.0209 15.3333 10.0125 15.6C10.0042 15.8667 9.90002 16.1 9.70002 16.3C9.50002 16.4833 9.26669 16.5792 9.00002 16.5875C8.73336 16.5958 8.50002 16.5 8.30002 16.3L3.70002 11.7C3.50002 11.5 3.40002 11.2667 3.40002 11C3.40002 10.7333 3.50002 10.5 3.70002 10.3L8.30002 5.69999C8.48336 5.51665 8.71252 5.42499 8.98752 5.42499C9.26252 5.42499 9.50002 5.51665 9.70002 5.69999C9.90002 5.89999 10 6.13749 10 6.41249C10 6.68749 9.90002 6.92499 9.70002 7.12499L6.82502 9.99999H16C17.3834 9.99999 18.5625 10.4875 19.5375 11.4625C20.5125 12.4375 21 13.6167 21 15V18C21 18.2833 20.9042 18.5208 20.7125 18.7125C20.5209 18.9042 20.2834 19 20 19C19.7167 19 19.4792 18.9042 19.2875 18.7125C19.0959 18.5208 19 18.2833 19 18V15C19 14.1667 18.7084 13.4583 18.125 12.875C17.5417 12.2917 16.8334 12 16 12H6.82502Z" />
          </svg>
        </ActionButton>

        {/* React/Emoji Button */}
        <ActionButton label="React" onClick={() => setShowPicker(!showPicker)}>
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
            <path d="M15.5 11C15.9167 11 16.2708 10.8542 16.5625 10.5625C16.8542 10.2708 17 9.91667 17 9.5C17 9.08333 16.8542 8.72917 16.5625 8.4375C16.2708 8.14583 15.9167 8 15.5 8C15.0833 8 14.7292 8.14583 14.4375 8.4375C14.1458 8.72917 14 9.08333 14 9.5C14 9.91667 14.1458 10.2708 14.4375 10.5625C14.7292 10.8542 15.0833 11 15.5 11ZM8.5 11C8.91667 11 9.27083 10.8542 9.5625 10.5625C9.85417 10.2708 10 9.91667 10 9.5C10 9.08333 9.85417 8.72917 9.5625 8.4375C9.27083 8.14583 8.91667 8 8.5 8C8.08333 8 7.72917 8.14583 7.4375 8.4375C7.14583 8.72917 7 9.08333 7 9.5C7 9.91667 7.14583 10.2708 7.4375 10.5625C7.72917 10.8542 8.08333 11 8.5 11ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20ZM12 17.5C12.9667 17.5 13.8583 17.2667 14.675 16.8C15.4917 16.3333 16.15 15.7 16.65 14.9C16.75 14.7 16.7417 14.5 16.625 14.3C16.5083 14.1 16.3333 14 16.1 14H7.9C7.66667 14 7.49167 14.1 7.375 14.3C7.25833 14.5 7.25 14.7 7.35 14.9C7.85 15.7 8.5125 16.3333 9.3375 16.8C10.1625 17.2667 11.05 17.5 12 17.5Z" />
          </svg>
        </ActionButton>

        <ActionButton label="Forward">
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
            <path d="M19.175 11L15.3 7.12499C15.1 6.92499 15 6.68749 15 6.41249C15 6.13749 15.1 5.89999 15.3 5.69999C15.5 5.51665 15.7375 5.42499 16.0125 5.42499C16.2875 5.42499 16.5167 5.51665 16.7 5.69999L21.3 10.3C21.4 10.4 21.4708 10.5083 21.5125 10.625C21.5542 10.7417 21.575 10.8667 21.575 11C21.575 11.1333 21.5542 11.2583 21.5125 11.375C21.4708 11.4917 21.4 11.6 21.3 11.7L16.7 16.3C16.5 16.5 16.2667 16.5958 16 16.5875C15.7333 16.5792 15.5 16.4833 15.3 16.3C15.1 16.1 14.9958 15.8667 14.9875 15.6C14.9792 15.3333 15.075 15.1 15.275 14.9L19.175 11ZM13.175 12H7C6.16667 12 5.45833 12.2917 4.875 12.875C4.29167 13.4583 4 14.1667 4 15V18C4 18.2833 3.90417 18.5208 3.7125 18.7125C3.52083 18.9042 3.28333 19 3 19C2.71667 19 2.47917 18.9042 2.2875 18.7125C2.09583 18.5208 2 18.2833 2 18V15C2 13.6167 2.4875 12.4375 3.4625 11.4625C4.4375 10.4875 5.61667 9.99999 7 9.99999H13.175L10.3 7.12499C10.1 6.92499 10 6.68749 10 6.41249C10 6.13749 10.1 5.89999 10.3 5.69999C10.5 5.51665 10.7375 5.42499 11.0125 5.42499C11.2875 5.42499 11.5167 5.51665 11.7 5.69999L16.3 10.3C16.4 10.4 16.4708 10.5083 16.5125 10.625C16.5542 10.7417 16.575 10.8667 16.575 11C16.575 11.1333 16.5542 11.2583 16.5125 11.375C16.4708 11.4917 16.4 11.6 16.3 11.7L11.7 16.3C11.5 16.5 11.2667 16.5958 11 16.5875C10.7333 16.5792 10.5 16.4833 10.3 16.3C10.1 16.1 9.99583 15.8667 9.9875 15.6C9.97917 15.3333 10.075 15.1 10.275 14.9L13.175 12Z" />
          </svg>
        </ActionButton>

        <ActionButton label="Star">
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
            <path d="M8.85001 16.825L12 14.925L15.15 16.85L14.325 13.25L17.1 10.85L13.45 10.525L12 7.12495L10.55 10.5L6.90002 10.825L9.67501 13.25L8.85001 16.825ZM12 17.275L7.85001 19.775C7.66668 19.8916 7.47502 19.9416 7.27502 19.9249C7.07502 19.9083 6.90001 19.8416 6.75001 19.725C6.60001 19.6083 6.48335 19.4625 6.40002 19.2874C6.31668 19.1124 6.30001 18.9166 6.35001 18.7L7.45001 13.975L3.77502 10.8C3.60835 10.65 3.50418 10.4791 3.46252 10.2875C3.42085 10.0958 3.43335 9.90828 3.50001 9.72495C3.56668 9.54162 3.66668 9.39162 3.80001 9.27495C3.93335 9.15828 4.11668 9.08328 4.35001 9.04995L9.20001 8.62495L11.075 4.17495C11.1583 3.97495 11.2875 3.82495 11.4625 3.72495C11.6375 3.62495 11.8167 3.57495 12 3.57495C12.1833 3.57495 12.3625 3.62495 12.5375 3.72495C12.7125 3.82495 12.8417 3.97495 12.925 4.17495L14.8 8.62495L19.65 9.04995C19.8834 9.08328 20.0667 9.15828 20.2 9.27495C20.3333 9.39162 20.4333 9.54162 20.5 9.72495C20.5667 9.90828 20.5792 10.0958 20.5375 10.2875C20.4958 10.4791 20.3917 10.65 20.225 10.8L16.55 13.975L17.65 18.7C17.6 18.9166 17.6833 19.1124 17.6 19.2874C17.5167 19.4625 17.4 19.6083 17.25 19.725C17.1 19.8416 16.925 19.9083 16.725 19.9249C16.525 19.9416 16.3334 19.8916 16.15 19.775L12 17.275Z" />
          </svg>
        </ActionButton>

        <div className="h-4 w-px bg-gray-200 mx-0.5 shrink-0" aria-hidden="true" />

        <ActionButton label="Delete" isDestructive={true} onClick={handledelete}>
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
            <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17ZM14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17Z" />
          </svg>
        </ActionButton>
      </div>

      {/* Floating Emoji Picker Portal Panel */}
      {showPicker && (
        <div className="absolute bottom-full right-4 mb-2 z-50 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme="light"
            width={320}
            height={400}
            skinTonesDisabled
            searchPlaceHolder="Search reactions..."
          />
        </div>
      )}
      
    </div>
    
  );
}