import React, { createContext, useContext, useState, useEffect } from "react";
import { initSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const getInitialState = () => {
    try {
      const item = window.localStorage.getItem("talkapp-user");
      console.log(item);
      // Handle the case where the string itself is "undefined"
      if (!item || item === "undefined") return null;
      return JSON.parse(item);
    } catch (error) {
      console.error("Failed to parse auth state:", error);
      return null;
    }
  };


  const [user, setUser] = useState(getInitialState);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);



  // 1. Main Socket & Online Users Sync
  useEffect(() => {
    if (user) {
      const s = initSocket(user._id);
      setSocket(s);

      s.on("getOnlineUsers", (users) => {
        setOnlineUsers(users); // Updates sidebar and header green dots instantly
      });

      return () => {
        s.off("getOnlineUsers");
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setOnlineUsers([]);
    }
  }, [user]);

  // 2. Targeted Last Seen Sync (Only fires when a user drops offline)
  useEffect(() => {
    if (!socket) return;

    socket.on("userLastSeenUpdate", (data) => {
      const { userId, lastSeen } = data;

      // Surgically update selectedUser if they are the one who went offline
      setSelectedUser((prevSelectedUser) => {
        if (prevSelectedUser && prevSelectedUser._id === userId) {
          return {
            ...prevSelectedUser,
            lastSeen: lastSeen, // Injects the fresh timestamp instantly
          };
        }
        return prevSelectedUser;
      });
    });

    return () => {
      socket.off("userLastSeenUpdate");
    };
  }, [socket]); // Cleaned dependency array: no selectedUser loop!

  const login = (userData) => {
    localStorage.setItem("talkapp-user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("talkapp-user");
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, socket, onlineUsers, selectedUser, setSelectedUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
