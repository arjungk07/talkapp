import React, { createContext, useContext, useState } from "react";


export const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
    const [isShowMode, setIsShowMode] = useState(false);
    const [showPicker, setShowPicker] = useState(null);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState([]); //['6a0d66f3cbe8efb3edcb28cd', '6a0d5465cbe8efb3edcb27a1']
    console.log(selectedMessageIds);
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