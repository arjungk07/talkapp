import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext'
import { FaUserAlt } from "react-icons/fa";
import ai from '../assets/image/talk_ai_icon.png';
import { formatDistanceToNow } from "date-fns";
import { useMessages } from "../hooks/useMessages";
import { useAppContext } from "../context/AppContext";



const HeaderActionsBar = () => {

    const { isActive, setIsActive } = useAppContext();

    const handleClick = () => {
        setIsActive(!isActive);
    };
    return (
        /* Main wrapper row holding both interactive utility zones */
        <div className="flex items-center justify-end gap-2 p-2 bg-transparent">

            {/* 1.Ai button */}
            <button
                onClick={handleClick}
                className="relative flex items-center justify-center w-12 h-12"
            >
                {/* Rotating Gradient Border */}
                {isActive && (
                    <div className="absolute inset-0 rounded-full animate-spin-slow">
                        <div className="w-full h-full bg-linear-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full"></div>
                    </div>
                )}

                {/* Glow Effect */}
                {isActive && (
                    <div className="absolute w-14 h-14 rounded-full bg-yellow-400/20 blur-xl animate-pulse"></div>
                )}

                {/* AI Icon */}
                <img
                    src={ai}
                    alt="ai"
                    className={`relative cursor-pointer z-10 w-8 h-8 rounded-full transition-all duration-500 ${isActive ? "scale-110" : "scale-100"
                        }`}
                />
            </button>

            {/* 2. Search Action Container */}
            <div className="flex items-center justify-center">
                <button
                    type="button"
                    aria-label="Search"
                    aria-expanded="false"
                    tabIndex={0}
                    className="flex items-center justify-center cursor-pointer p-2 text-gray-600 rounded-full transition-colors duration-200"
                >
                    <svg
                        viewBox="0 0 24 24"
                        height="24"
                        width="24"
                        fill="currentColor"
                        className="shrink-0"
                    >
                        <title>ic-search</title>
                        <path d="M9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z" />
                    </svg>
                </button>
            </div>

            {/* 3. Vert Options Menu Container */}
            <div className="flex items-center justify-center">
                <button
                    type="button"
                    aria-label="Menu"
                    aria-disabled="false"
                    aria-expanded="false"
                    aria-haspopup="menu"
                    tabIndex={0}
                    className="flex items-center justify-center cursor-pointer p-2 text-gray-600 rounded-full transition-colors duration-200 "
                >
                    <svg
                        viewBox="0 0 24 24"
                        height="24"
                        width="24"
                        fill="currentColor"
                        className="shrink-0"
                    >
                        <title>ic-more-vert</title>
                        <path d="M12 20C11.45 20 10.9792 19.8042 10.5875 19.4125C10.1958 19.0208 10 18.55 10 18C10 17.45 10.1958 16.9792 10.5875 16.5875C10.9792 16.1958 11.45 16 12 16C12.55 16 13.0208 16.1958 13.4125 16.5875C13.8042 16.9792 14 17.45 14 18C14 18.55 13.8042 19.0208 13.4125 19.4125C13.0208 19.8042 12.55 20 12 20ZM12 14C11.45 14 10.9792 13.8042 10.5875 13.4125C10.1958 13.0208 10 12.55 10 12C10 11.45 10.1958 10.9792 10.5875 10.5875C10.9792 10.1958 11.45 10 12 10C12.55 10 13.0208 10.1958 13.4125 10.5875C13.8042 10.9792 14 11.45 14 12C14 12.55 13.8042 13.0208 13.4125 13.4125C13.0208 13.8042 12.55 14 12 14ZM12 8C11.45 8 10.9792 7.80417 10.5875 7.4125C10.1958 7.02083 10 6.55 10 6C10 5.45 10.1958 4.97917 10.5875 4.5875C10.9792 4.19583 11.45 4 12 4C12.55 4 13.0208 4.19583 13.4125 4.5875C13.8042 4.97917 14 5.45 14 6C14 6.55 13.8042 7.02083 13.4125 7.4125C13.0208 7.80417 12.55 8 12 8Z" />
                    </svg>
                </button>
            </div>

        </div>
    );
};


const ChatHeader = () => {
    const { onlineUsers, selectedUser } = useAuth();
    const { isTyping } = useMessages(selectedUser);


    const isOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : false;
    const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVKIxuwSqgJuFllKhvtMd6sOtm40ee3j-G3Dl2q9Gn3fRhPgo7mstwpYA&s=10";


    return (
        <div>
            {/* CHAT HEADER */}
            <header className="px-4 lg:px-6 py-2 border-b border-chat-border bg-chat-bg  flex items-center  gap-3 shrink-0 z-10">

                {/* user profile  */}
                <div className="relative">
                    {selectedUser.profilePic ? (
                        // <img
                        //     src={selectedUser.profilePic}
                        //     alt={selectedUser.name}
                        //     className="w-12 h-12 rounded-full object-cover border border-chat-border"
                        // />
                        <img
                            src={selectedUser.profilePic || DEFAULT_AVATAR}
                            alt="selectedUser.name"
                            className="w-12 h-12 rounded-full object-cover border border-chat-border"
                            onError={(e) => {
                                // 1. Prevent the error from trying to load again
                                e.target.onerror = null;
                                // 2. Point the source to the fallback image
                                e.target.src = DEFAULT_AVATAR;
                            }}
                        />
                    ) : (
                        <FaUserAlt className="w-11 h-11 p-1 rounded-full bg-chat-surface text-chat-muted border border-chat-border" />
                    )}

                    {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-chat-online rounded-full border-2 border-chat-panel" />
                    )}
                </div>

                {/* user name and online status */}
                <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-chat-text google-sans">{selectedUser.name}</p>
                    <p className="text-[9px] md:text-xs text-chat-muted">
                        {isTyping ? (
                            <span className="text-chat-accent animate-pulse">typing...</span>
                        ) : isOnline ? (
                            <span className="text-chat-online">Active now</span>
                        ) : selectedUser?.lastSeen ? (
                            `seen ${formatDistanceToNow(new Date(selectedUser.lastSeen), { addSuffix: true })}`
                        ) : (
                            "Offline"
                        )}
                    </p>
                </div>

                <HeaderActionsBar />


            </header>
        </div>
    )
}

export default ChatHeader