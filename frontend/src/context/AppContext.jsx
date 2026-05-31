import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const { user, socket } = useAuth(); // 👈 Pull the active socket connection here

    const [appLoading, setAppLoading] = useState(true);

    // 1. One Singular State Chain for your list
    const [users, setUsers] = useState([]);

    // 2. FIXED FETCH FUNCTION (Checks token first)
    const fetchInitialData = useCallback(async () => {
        const item = window.localStorage.getItem("talkapp-user");

        try {
            let token = null;
            if (item) {
                const parsedUser = JSON.parse(item);
                token = parsedUser?.token;
            }

            if (!token) {
                console.log("No token found. Skipping API fetch.");
                setAppLoading(false);
                return;
            }

            const { data } = await api.get('/api/users');
            console.log("Data received from backend:", data);
            setUsers(data); // 👈 Directly populating the main state
        } catch (err) {
            if (err.response?.status === 401) {
                console.log("Unauthorized request inside context. Stopping loop.");
                window.location.href = '/';
            } else {
                toast.error("Failed to sync initial system records.");
            }
            console.error(err.message);
        } finally {
            setAppLoading(false);
        }
    }, []);

    // 3. TRIGGER IT ON GLOBAL MOUNT AND AUTH CHANGES
    useEffect(() => {
        if (users.length === 0 && user) {
            fetchInitialData();
        }

        if (!user) {
            setUsers([]); // Clear memory array instantly when current user logs out
        }
    }, [fetchInitialData, user, users.length]);

    // Real time socket listener
    useEffect(() => {
        if (!socket) return;

        // 1. Manage Global Profile Image Real-time Changes
        const handleImageChange = (updatedData) => {
            const { userId, profilePic } = updatedData;
            setUsers((prevUsers) => {
                if (!Array.isArray(prevUsers)) return [];
                return prevUsers.map((user) =>
                    String(user._id) === String(userId) ? { ...user, profilePic } : user
                );
            });
        };

        // 2. Manage Global Last Seen Updates
        const handleLastSeenChange = (data) => {
            const { userId, lastSeen } = data;
            setUsers((prevUsers) => {
                if (!Array.isArray(prevUsers)) return [];
                return prevUsers.map((u) =>
                    u._id === userId ? { ...u, lastSeen } : u
                );
            });
        };

        socket.on("user-image-updated", handleImageChange);
        socket.on("userLastSeenUpdate", handleLastSeenChange);

        return () => {
            socket.off("user-image-updated", handleImageChange);
            socket.off("userLastSeenUpdate", handleLastSeenChange);
        };
    }, [socket]);

    const [isShowMode, setIsShowMode] = useState(false);
    const [showPicker, setShowPicker] = useState(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [uploadFile, setUploadFile] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState([]);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // 5. Package up the state handlers for components
    const value = {
        users,
        setUsers,
        isShowMode,
        setIsShowMode,
        isSelectMode,
        setIsSelectMode,
        selectedMessageIds,
        setSelectedMessageIds,
        isActive,
        setIsActive,
        showPicker,
        setShowPicker,
        selectedMsg,
        setSelectedMsg,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        appLoading,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within AppContextProvider");
    return ctx;
};