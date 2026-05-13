import React, { createContext, useContext, useState, useEffect } from "react";
import { initSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const getInitialState = () => {
    try {
      const item = window.localStorage.getItem("chatapp-user");
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

  useEffect(() => {
    if (user) {
      const s = initSocket(user._id);
      setSocket(s);

      s.on("getOnlineUsers", (users) => {
        console.log("authcontext.jsx / 32", users)
        setOnlineUsers(users);
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

  const login = (userData) => {
    localStorage.setItem("chatapp-user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("chatapp-user");
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, socket, onlineUsers , selectedUser, setSelectedUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
