import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserAlt } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import LogOut from './LogOut';
import { useAppContext } from "../context/AppContext";

const Sidebar = ({ className }) => {
  const { onlineUsers, selectedUser, setSelectedUser } = useAuth();
  const { users } = useAppContext(); // 👈 Purely read users from context now
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // --- Local Filtering & Search ---
  const filteredUsers = Array.isArray(users)
    ? users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    : [];

  const isOnline = (userId) => onlineUsers.includes(userId);
  const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVKIxuwSqgJuFllKhvtMd6sOtm40ee3j-G3Dl2q9Gn3fRhPgo7mstwpYA&s=10";

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    navigate(`/chat/${u._id}`);
    // toast.success(`Chatting with ${u.name}`, { id: "user-select-toast" });
  };

  return (
    <div className={`${className} md:min-w-87.5 h-full bg-chat-sidebar md:border-r border-chat-border overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="px-4 md:p-5 shrink-0">
        <div className="hidden md:flex justify-between items-center">
          <p className="text-xl talkapp-font font-semibold text-chat-text">Chats</p>
          <FiLogOut size={20} onClick={() => setIsLogoutModalOpen(true)} className="cursor-pointer" />
          <LogOut isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
        </div>

        {/* Search Input */}
        <div className="relative mt-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-chat-surface border border-chat-panel rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-chat-panel transition-all"
          />
        </div>
      </div>

      {/* User List Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        {users.length === 0 ? (
          <div className="text-center py-10 text-chat-muted text-sm">No contacts found</div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-chat-muted">
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <p className="text-sm">No contacts matching criteria</p>
          </div>
        ) : (
          <>
            {filteredUsers.map((u) => (
              <button
                type="button"
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className={`w-full flex items-center cursor-pointer gap-4 p-3 rounded-xl mb-1 text-left transition-all ${selectedUser?._id === u._id ? "bg-chat-surface" : "hover:bg-chat-surface"
                  }`}
              >
                <div className="relative shrink-0">
                  {u.profilePic ? (
                    <img
                      src={u.profilePic || DEFAULT_AVATAR}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border border-chat-border"
                      onError={(e) => {
                        // 1. Prevent the error from trying to load again
                        e.target.onerror = null;
                        // 2. Point the source to the fallback image
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />) : (
                    <FaUserAlt className="w-12 h-12 p-2 rounded-full bg-chat-surface text-chat-muted border border-chat-border" />
                  )}
                  {isOnline(u._id) && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-chat-online rounded-full border-2 border-chat-sidebar" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-chat-text text-sm truncate">
                    {search ? (
                      u.name.split(new RegExp(`(${search})`, "gi")).map((part, index) =>
                        part.toLowerCase() === search.toLowerCase() ? (
                          <span key={index} className="text-emerald-400 font-bold">
                            {part}
                          </span>
                        ) : (
                          <span key={index}>{part}</span>
                        )
                      )
                    ) : (
                      u.name
                    )}
                  </p>
                  <p className="text-xs text-chat-muted truncate">
                    {isOnline(u._id)
                      ? "Active now"
                      : u.lastSeen
                        ? `Seen ${formatDistanceToNow(new Date(u.lastSeen), { addSuffix: true })}`
                        : "Offline"}
                  </p>
                </div>
              </button>
            ))}

            <p className="text-center text-[10px] text-chat-muted py-4 uppercase tracking-widest opacity-50">
              All contacts loaded
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;