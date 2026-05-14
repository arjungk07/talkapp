import React from "react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

const MessageBubble = ({ message }) => {
  const { user } = useAuth();

  // Guard Clause: If message data or auth user is missing, don't crash
  if (!message || !message.senderId || !user) {
    return null; 
  }

  // If I sent it, it's on the right. 
  // If the AI (or another user) sent it, it's on the left.
  const isSent = message.senderId === user._id;

  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"} mb-1 px-2`}>
      <div
        className={`
          group relative max-w-[70%]
          animate-bubble-pop
          flex flex-col
          ${isSent ? "items-end" : "items-start"}
        `}
      >
        <div
          className={`
            relative px-4 py-2 
            ${isSent
              ? "bg-chat-accent/40 rounded-[20px] rounded-br-[4px]"
              : "bg-transparent border-2 border-chat-border rounded-[20px] rounded-bl-[4px]"
            }
          `}
        >
          {/* Message text */}
          <p className={`
            text-sm leading-relaxed wrap-break-word whitespace-pre-wrap
            ${isSent ? "text-gray-900" : "text-chat-text"}
          `}>
            {message.text}
          </p>

          {/* Time + tick row */}
          <div className={`flex items-center gap-1 mt-0.5 ${isSent ? "justify-end" : "justify-start"}`}>
            <span className={`text-[10px] ${isSent ? "text-yellow-800/60" : "text-chat-muted"}`}>
              {/* Ensure date is valid before formatting */}
              {message.createdAt ? format(new Date(message.createdAt), "HH:mm") : "--:--"}
            </span>

            {isSent && (
              <svg
                className={`w-3 h-3 shrink-0 ${message.read ? "text-blue-500" : "text-yellow-800/50"}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                {message.read ? (
                  <path d="M1.5 12.5l5 5L20.5 4M6.5 12.5l5 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                ) : (
                  <path d="M4.5 12.5l5 5L19.5 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                )}
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;