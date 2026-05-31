import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import WhatsAppHeader from "../components/WhatsAppHeader";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const Home = () => {
  const { selectedUser, setSelectedUser } = useAuth();
  const { id } = useParams();

  // 1. Grab everything from your global AppContext instead of local state
  const { 
    appLoading, 
    users 
  } = useAppContext();

  // Handle URL changes to reset selected active user context (Keep this here)
  useEffect(() => {
    if (!id) {
      setSelectedUser(null);
    }
  }, [id, setSelectedUser]);

  // 2. This will only trigger the very first time the app starts up.
  // When coming back from Settings, appLoading is already false!
  if (appLoading) {
    return (
      <LoadingScreen
        initialLoading={appLoading}
        usersCount={users.length}
      />
    );
  }

  // 3. This runs instantly when navigating back to Home
  return (
    <div className="h-dvh md:flex overflow-hidden bg-chat-bg">
      <WhatsAppHeader className={`${selectedUser ? "hidden" : ""}`} />

      
        <Sidebar
          className={`${selectedUser ? "hidden md:flex md:flex-col" : ""} `}
        />  

      <ChatWindow />
    </div>
  );
};

export default Home;