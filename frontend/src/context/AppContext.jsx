import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    const { user } = useAuth();

    const [isShowMode, setIsShowMode] = useState(false);
    const [showPicker, setShowPicker] = useState(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState([]); //['6a0d66f3cbe8efb3edcb28cd', '6a0d5465cbe8efb3edcb27a1']
    const [isActive, setIsActive] = useState(false);
    const [uploadFile, setUploadFile] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState([]);
    const [setting, setSetting] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);



    const [appLoading, setAppLoading] = useState(true);
    const [initialUsers, setInitialUsers] = useState([]);

    // 1. WATCH THE STATE CHANGE CORRECTLY
    useEffect(() => {
        console.log("Initial Users state updated:", initialUsers);
    }, [initialUsers]);

    // 2. FIXED FETCH FUNCTION (Now checks token first)
    const fetchInitialData = useCallback(async () => {
        // 1. Get the raw string item from localStorage
        const item = window.localStorage.getItem("talkapp-user");

        try {
            let token = null;

            // 2. Parse the item securely if it exists
            if (item) {
                const parsedUser = JSON.parse(item);
                token = parsedUser?.token; // Extract the nested token property safely
            }

            // 3. 🔒 Check for token before hitting the network
            if (!token) {
                console.log("No token found (Incognito/Logged out). Skipping API fetch.");
                setAppLoading(false);
                return; // Exit early! Prevent the 401 request completely.
            }

            const { data } = await api.get('/api/users');
            console.log("Data received from backend:", data);
            setInitialUsers(data);
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
    }, [user]);

    // 3. TRIGGER IT ON GLOBAL MOUNT AND AUTH CHANGES
    useEffect(() => {
        // If we don't have users yet, attempt to fetch them
        if (initialUsers.length === 0) {
            fetchInitialData();
        }

        // If a user logs out (user becomes null), reset the initial users list!
        if (!user) {
            setInitialUsers([]);
        }
    }, [fetchInitialData, user, initialUsers.length]); // <--- Added 'user' and length check here


    const value = {
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
        setting,
        setSetting,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        appLoading,
        initialUsers,
    };




    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
    return ctx;
};