import React, { createContext, useContext, useState } from "react";


export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [isShowMode, setIsShowMode] = useState(false);
    const [showPicker, setShowPicker] = useState(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState([]); //['6a0d66f3cbe8efb3edcb28cd', '6a0d5465cbe8efb3edcb27a1']
    console.log("selected Messages Ids", selectedMessageIds);
    const [isActive, setIsActive] = useState(false);
    const [uploadFile, setUploadFile] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState([]);
    const [setting, setSetting] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);




    // App Components



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
        setIsLogoutModalOpen
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