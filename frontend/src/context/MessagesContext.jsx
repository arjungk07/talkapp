import React, { createContext, useContext, useState } from "react";


export const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
    const [isShowMode, setIsShowMode] = useState(false);
    const [showPicker, setShowPicker] = useState(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState([]);
    const [isActive, setIsActive] = useState(false);


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
    };

    return (
        <MessagesContext.Provider value={value}>
            {children}
        </MessagesContext.Provider>
    );
}

export const useMessagesContext = () => {
    const ctx = useContext(MessagesContext);
    if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
    return ctx;
};