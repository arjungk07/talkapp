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
      console.log("setselected user to null")
    }

  }, [id]);


  return (
    <div className="h-screen flex overflow-hidden bg-chat-bg">

      <WhatsAppHeader />
      <Sidebar className={`${selectedUser ? "hidden md:block" : "block "} md:w-[350px]`} />
      <ChatWindow className="hidden md:flex-1 md:flex md:flex-col" />


    </div>
  );
};

export default Home;