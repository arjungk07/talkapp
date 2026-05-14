import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Assuming this is your axios instance
import toast from "react-hot-toast";

const Logout = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogoutAndDelete = async () => {
    if (!user?._id) {
      toast.error("User not found Please Login First");
      navigate('/login')
      return;
    }

    setLoading(true);
    try {
      // 1. Call Backend to delete the User document from MongoDB
      // Make sure this route matches your authRoutes.js
      await api.delete(`/api/auth/logout/${user._id}`);

      // 2. Clear LocalStorage and Reset Auth State
      logout();

      // 3. UI Feedback and Redirect
      toast.success("Log Out successfully ✅");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error(err.response?.data?.message || "Failed to Log Out ❌");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 google-sans]">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Log out?</h2>
          <p className="text-zinc-500 text-xs leading-relaxed talkapp-font">
            Logging out will securely sign you out of your account on this device. You can log back in anytime to access your chats and data.          </p>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-zinc-100 bg-zinc-50/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded-full cursor-pointer border border-zinc-300 text-zinc-700 font-semibold text-sm hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleLogoutAndDelete}
            disabled={loading}
            className="px-6 py-2 cursor-pointer rounded-full bg-[#ef0632] text-white font-semibold text-sm hover:bg-[#d0052b] transition-all shadow-md shadow-red-200 disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? "Processing..." : "Log out"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;