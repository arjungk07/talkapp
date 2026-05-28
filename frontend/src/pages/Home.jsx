import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import WhatsAppHeader from "../components/WhatsAppHeader";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import Setting from "./Setting";
import LogOut from "../components/LogOut";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const Home = () => {
  const { selectedUser, setSelectedUser } = useAuth();
  const { setting, isLogoutModalOpen, setIsLogoutModalOpen } = useAppContext();
  const { id } = useParams();

  // Unified App Loading States
  const [appLoading, setAppLoading] = useState(true);
  const [initialUsers, setInitialUsers] = useState([]);

  // Fetch initial contacts before showing the dashboard layout
  const fetchInitialData = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/users`, {
        params: { page: 1, limit: 20, search: "" }
      });
      setInitialUsers(data);
    } catch (err) {
      toast.error("Failed to sync initial system records.");
      console.error(err.message);
    } finally {
      setAppLoading(false);
    }
  }, []);

  // Trigger base fetch on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handle URL changes to reset selected active user context
  useEffect(() => {
    if (!id) {
      setSelectedUser(null);
    }
  }, [id, setSelectedUser]);

  // Show a full-page loader until backend data resolves successfully
  if (appLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-dvh md:flex overflow-hidden bg-chat-bg">


      {
        !setting && <WhatsAppHeader className={`${selectedUser ? "hidden" : ""}`} />
      }
      
      
      {setting ? (
        <Setting />
      ) : (
        <Sidebar 
          className={`${selectedUser ? "hidden md:flex md:flex-col" : ""} `} 
          preloadedUsers={initialUsers}
        />
      )}

      {isLogoutModalOpen && (
        <LogOut isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
      )}
      
      <ChatWindow />
    </div>
  );
};

export default Home;