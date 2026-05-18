import React, { useEffect } from "react";
import WhatsAppHeader from "../components/WhatsAppHeader";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";



const Home = () => {

  const { selectedUser , setSelectedUser } = useAuth();

  const {id} = useParams();

  
  useEffect(() => {

    if(!id){
      setSelectedUser(null);
    }

  }, [id]);

  


  return (
    <div className="h-dvh md:flex overflow-hidden bg-chat-bg">

      <WhatsAppHeader className={`${selectedUser ? "hidden" : "block"}`}/>
      <Sidebar className={`${selectedUser ? "hidden md:block" : "block"} md:w-[350px]`} />
      <ChatWindow  />


    </div>
  );
};

export default Home;