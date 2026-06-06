import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Trash2, X } from "lucide-react";
import { motion, AnimatePresence, color, delay } from "framer-motion";
import { useAppContext } from "../context/AppContext";


// upload Action Bar like image selection.
export function UploadBar({ value }) {

    const { open, uploadBarRef, imageTo, setimageTo, setopenFileAction } = value;

    // --- SVGs as standalone mini-components for readability ---

    const { user, selectedUser } = useAuth();


    const PhotosIcon = () => (
        <svg viewBox="0 0 24 24" height="18" width="18" fill="currentColor">
            <path d="M13.25 12.5L12.1 11C12 10.8667 11.8667 10.8 11.7 10.8C11.5333 10.8 11.4 10.8667 11.3 11L9.625 13.2C9.49167 13.3667 9.47083 13.5417 9.5625 13.725C9.65417 13.9083 9.80833 14 10.025 14H17.975C18.1917 14 18.3458 13.9083 18.4375 13.725C18.5292 13.5417 18.5083 13.3667 18.375 13.2L15.95 10.025C15.85 9.89167 15.7167 9.825 15.55 9.825C15.3833 9.825 15.25 9.89167 15.15 10.025L13.25 12.5ZM8 18C7.45 18 6.97917 17.8042 6.5875 17.4125C6.19583 17.0208 6 16.55 6 16V4C6 3.45 6.19583 2.97917 6.5875 2.5875C6.97917 2.19583 7.45 2 8 2H20C20.55 2 21.0208 2.19583 21.4125 2.5875C21.8042 2.97917 22 3.45 22 4V16C22 16.55 21.8042 17.0208 21.4125 17.4125C21.0208 17.8042 20.55 18 20 18H8ZM4 22C3.45 22 2.97917 21.8042 2.5875 21.4125C2.19583 21.0208 2 20.55 2 20V7C2 6.71667 2.09583 6.47917 2.2875 6.2875C2.47917 6.09583 2.71667 6 3 6C3.28333 6 3.52083 6.09583 3.7125 6.2875C3.90417 6.47917 4 6.71667 4 7V20H17C17.2833 20 17.5208 20.0958 17.7125 20.2875C17.9042 20.4792 18 20.7167 18 21C18 21.2833 17.9042 21.5208 17.7125 21.7125C17.5208 21.9042 17.2833 22 17 22H4Z" />
        </svg>
    );

    const CameraIcon = () => (
        <svg viewBox="0 0 24 24" height="18" width="18" fill="currentColor">
            <path d="M12 17.5C13.25 17.5 14.3125 17.0625 15.1875 16.1875C16.0625 15.3125 16.5 14.25 16.5 13C16.5 11.75 16.0625 10.6875 15.1875 9.8125C14.3125 8.9375 13.25 8.5 12 8.5C10.75 8.5 9.6875 8.9375 8.8125 9.8125C7.9375 10.6875 7.5 11.75 7.5 13C7.5 14.25 7.9375 15.3125 8.8125 16.1875C9.6875 17.0625 10.75 17.5 12 17.5ZM12 15.5C11.3 15.5 10.7083 15.2583 10.225 14.775C9.74167 14.2917 9.5 13.7 9.5 13C9.5 12.3 9.74167 11.7083 10.225 11.225C10.7083 10.7417 11.3 10.5 12 10.5C12.7 10.5 13.2917 10.7417 13.775 11.225C14.2583 11.7083 14.5 12.3 14.5 13C14.5 13.7 14.2583 14.2917 13.775 14.775C13.2917 15.2583 12.7 15.5 12 15.5ZM4 21C3.45 21 2.97917 20.8042 2.5875 20.4125C2.19583 20.0208 2 19.55 2 19V7C2 6.45 2.19583 5.97917 2.5875 5.5875C2.97917 5.19583 3.45 5 4 5H7.15L8.4 3.65C8.58333 3.45 8.80417 3.29167 9.0625 3.175C9.32083 3.05833 9.59167 3 9.875 3H14.125C14.4083 3 14.6792 3.05833 14.9375 3.175C15.1958 3.29167 15.4167 3.45 15.6 3.65L16.85 5H20C20.55 5 21.0208 5.19583 21.4125 5.5875C21.8042 5.97917 22 6.45 22 7V19C22 19.55 21.8042 20.0208 21.4125 20.4125C21.0208 20.8042 20.55 21 20 21H4Z" />
        </svg>
    );


    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create a temporary blob URL to use as image src
        const blobUrl = URL.createObjectURL(file);

        let formData = new FormData();
        formData.append("file", file);
        formData.append("type", "attachment");
        formData.append("userId", user._id);
        formData.append("receiverId", selectedUser?._id);
        formData.append("text", "");




        setimageTo(
            {
                formData: formData,
                path: blobUrl
            }
        );

        setopenFileAction(false);

        e.target.value = "";

    };



    const fileRef = useRef(null);
    if (!open) return null;



    // Configuration for clean dynamic rendering of items
    const menuItems = [
        { label: 'Photos', icon: <PhotosIcon />, color: 'text-pink-500', onclick: () => fileRef.current.click() },
        // { label: 'Camera', icon: <CameraIcon />, color: 'text-red-500' },

    ];


    return (
        <>
            {
                open && (

                    <div className="absolute w-fit bottom-24 left-4 z-50 transform origin-bottom-left transition-all duration-200 ease-out">
                        <div
                            role="menu"
                            ref={uploadBarRef}
                            className="w-60 max-w-65 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-700/50 py-2"
                        >
                            {/* Scrollable inner container layer matching max-height logic */}
                            <div className="max-h-166 overflow-y-auto custom-scrollbar flex flex-col">
                                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                                {menuItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        role="menuitem"
                                        type="button"
                                        className="w-full flex items-center px-4 py-3 text-left transition-colors duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-zinc-700/50 active:bg-gray-100 dark:active:bg-zinc-700 outline-none focus-visible:bg-gray-50 group"
                                        onClick={item.onclick}
                                    >
                                        {/* Icon Wrapper */}
                                        <div className={`flex items-center justify-center shrink-0 w-5 h-5 mr-3 transition-transform duration-150 group-hover:scale-105 ${item.color}`}>
                                            {item.icon}
                                        </div>

                                        {/* Label Text */}
                                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-200 truncate">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                )}
        </>

    );

}

// ── Delete Confirm Popup ────────────────────────────────────────────────
export function DeleteMessagePopup({ value }) {

    const { open, onClose, onDelete } = value
    const { selectedMsg } = useAppContext();
    const { user } = useAuth();

    const deleteforme = true;

    const option = [
        {
            label: "Delete for me",
            // Light red/orange gradient
            style: "bg-linear-to-r from-red-500 to-rose-500 text-white border-transparent",
            onClick: () => onDelete("deleteforme")
        },

        // Conditional spread: Checks if ALL selected messages belong to the current user
        ...(Array.isArray(selectedMsg) && selectedMsg.length > 0 && selectedMsg.every(msg => msg?.senderId === user?._id)
            ? [
                {
                    label: "Delete for Everyone",
                    // Deep red/crimson gradient (stands out more)
                    style: "bg-linear-to-r from-red-600 to-rose-700 text-white border-transparent",
                    onClick: () => onDelete()
                }
            ]
            : [] // Returns an empty array if conditions aren't met, which safely spreads into nothing
        ),

        {
            label: "Cancel",
            // Neutral zinc look
            style: "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200",
            onClick: onClose
        }
    ];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 40 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="relative w-full max-w-sm overflow-hidden rounded-4xl bg-white shadow-[0_20px_80px_rgba(0,0,0,0.18)]"
                    >
                        <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-red-100 blur-3xl" />

                        <motion.button
                            whileHover={{ rotate: 90, scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-500 shadow-s transition-colors hover:bg-zinc-200 active:bg-zinc-300 focus:outline-none"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </motion.button>

                        <div className="relative z-10 px-7 pb-7 pt-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                                className="mx-auto flex h-15 w-15 items-center justify-center"
                            >
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, -5, 0] }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <Trash2 className="h-7 w-7 text-red-500" />
                                </motion.div>
                            </motion.div>

                            <div className="mt-6 text-center">
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                                    Delete message?
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                                    This message will be permanently removed from your
                                    conversation history.
                                </p>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">

                                {
                                    option.map((opt, index) => (
                                        <motion.button
                                            key={index}
                                            // 1. Scale up slightly on hover and loop the brightness/opacity for a pulse effect
                                            whileHover={{
                                                scale: 1.03,
                                                transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                                            }}
                                            // 2. Scale down slightly when clicked
                                            whileTap={{ scale: 0.96 }}
                                            onClick={opt.onClick}
                                            className={`${opt.style} md:opacity-70 flex-1 cursor-pointer rounded-full border py-3 text-sm font-semibold transition-all shadow-sm hover:opacity-100`}
                                        >
                                            {opt.label}
                                        </motion.button>
                                    ))
                                }


                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Delte Action bar 
export function DeleteAction({ value }) {


    const { handleCancelSelectMode, DeleteModel } = value

    const { selectedMessageIds } = useAppContext();

    return (
        <div className="flex items-center gap-4 w-full px-4 py-1.5 animate-fade-in">
            <button
                type="button"
                onClick={handleCancelSelectMode}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
            >
                Cancel
            </button>

            <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                    {selectedMessageIds.length}{" "}
                    {selectedMessageIds.length === 1 ? "message" : "messages"}{" "}
                    selected
                </span>

                <button
                    type="button"
                    onClick={DeleteModel}
                    disabled={selectedMessageIds.length === 0}
                    className={`p-2 rounded-xl transition-all duration-150 cursor-pointer ${selectedMessageIds.length > 0
                        ? "text-red-500 hover:bg-red-50 active:bg-red-100"
                        : "text-gray-300 cursor-not-allowed"
                        }`}
                    title="Delete Selected"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9C9 3.45 9.45 3 10 3H14C14.55 3 15 3.45 15 4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM10 17H12V9H10V17ZM14 17H16V9H14V17Z" />
                    </svg>
                </button>
            </div>
        </div>
    );



}