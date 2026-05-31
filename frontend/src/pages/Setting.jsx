import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';
import { ArrowLeft, Camera, Pencil, Copy, Mail, Edit, Eye, Trash, X, Check, RotateCw, RefreshCw } from "lucide-react";
import { CgProfile } from "react-icons/cg";
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from 'framer-motion';
import TakePhoto from '../components/TakePhoto';
import ChatWindow from '../components/ChatWindow';
import { useNavigate } from 'react-router-dom';
import LogOut from '../components/LogOut';
import { Link } from 'react-router-dom';

// 1. Edit New name.
export function EditNameCard({ user, onUpdateName }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(user?.name || "");
    const [loading, setLoading] = useState(false);
    const { showPicker, setShowPicker } = useAppContext();

    const handleSaveName = async () => {
        if (!nameInput.trim()) return;

        try {
            setLoading(true);
            // Calls the backend function passed down from the parent component
            await onUpdateName(nameInput.trim());
            setIsEditingName(false);
        } catch (err) {
            console.error("Failed to update name", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEmojiClick = (emojiData) => {
        console.log("click")
        // Extract the actual emoji character from the object
        const emoji = emojiData.emoji || emojiData.native;
        console.log(emoji)

        setNameInput((prev) => prev + emoji);
        setShowPicker(false);
    };

    return (


        <div className="mt-5 rounded-2xl bg-gray-50 p-4 border border-gray-100 shadow-sm">
            <span className="text-sm font-medium text-gray-500">Name</span>

            <div className="my-3 flex items-center justify-between min-h-10">
                {isEditingName ? (
                    /* EDITING STATE: Input field with only a bottom line */
                    <div className="flex items-center justify-between w-full">
                        <div className="relative flex-1 flex items-center">
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                maxLength={18}
                                disabled={loading}
                                className="w-full text-lg font-medium text-gray-800 bg-transparent border-b-2 border-[#00a884] focus:outline-none pb-1 pr-14"
                                autoFocus
                            />

                            {showPicker && (
                                <div className="absolute bottom-10 z-50 ">
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        autoFocusSearch={false}
                                        theme="light"
                                        width={300}
                                        height={350}
                                        skinTonesDisabled
                                        searchPlaceHolder="Search reactions..."
                                    />
                                </div>
                            )}

                            {/* Actions Right-Aligned Inside/Next to Input (Character counter & Emoji Icon) */}
                            <div className="absolute right-2 flex items-center gap-2 ">
                                <span className="text-sm text-black font-normal">
                                    {18 - nameInput.length}
                                </span>

                                <div
                                    role="button"
                                    onClick={() => setShowPicker(!showPicker)}
                                    className="flex items-center justify-center p-1 rounded-full hover:bg-black/5 transition-all duration-150 cursor-pointer "
                                >
                                    <span aria-hidden="true" className="w-5 h-5 flex items-center justify-center pointer-events-none">
                                        <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                                            <path d="M15.5 11C15.9167 11 16.2708 10.8542 16.5625 10.5625C16.8542 10.2708 17 9.91667 17 9.5C17 9.08333 16.8542 8.72917 16.5625 8.4375C16.2708 8.14583 15.9167 8 15.5 8C15.0833 8 14.7292 8.14583 14.4375 8.4375C14.1458 8.72917 14 9.08333 14 9.5C14 9.91667 14.1458 10.2708 14.4375 10.5625C14.7292 10.8542 15.0833 11 15.5 11ZM8.5 11C8.91667 11 9.27083 10.8542 9.5625 10.5625C9.85417 10.2708 10 9.91667 10 9.5C10 9.08333 9.85417 8.72917 9.5625 8.4375C9.27083 8.14583 8.91667 8 8.5 8C8.08333 8 7.72917 8.14583 7.4375 8.4375C7.14583 8.72917 7 9.08333 7 9.5C7 9.91667 7.14583 10.2708 7.4375 10.5625C7.72917 10.8542 8.08333 11 8.5 11ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20ZM12 17.5C12.9667 17.5 13.8583 17.2667 14.675 16.8C15.4917 16.3333 16.15 15.7 16.65 14.9C16.75 14.7 16.7417 14.5 16.625 14.3C16.5083 14.1 16.3333 14 16.1 14H7.9C7.66667 14 7.49167 14.1 7.375 14.3C7.25833 14.5 7.25 14.7 7.35 14.9C7.85 15.7 8.5125 16.3333 9.3375 16.8C10.1625 17.2667 11.05 17.5 12 17.5Z" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tick Confirm Button */}
                        <button
                            type="button"
                            onClick={handleSaveName}
                            disabled={loading || !nameInput.trim()}
                            className="py-1.5 text-[#00a884] border-b-2 border-[#00a884]  transition cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#00a884]" />
                            ) : (
                                <Check size={20} />
                            )}
                        </button>
                    </div>
                ) : (
                    /* VIEW STATE: Standard Text Display */
                    <>
                        <p className="text-lg font-medium text-gray-800">
                            {user?.name || "No Name Set"}
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsEditingName(true)}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition cursor-pointer"
                        >
                            <Pencil size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}


export function ProfilePreview({ closeProfilePreview, userProfileImage }) {

    const { user } = useAuth();

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-300">

            {/* Modal Container */}
            <div className="relative flex flex-col max-w-xl w-full bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200">

                {/* Header Section */}
                <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        {/* Small Profile Avatar */}
                        {userProfileImage ? (
                            <img
                                src={userProfileImage}
                                alt="profile"
                                className="w-12 h-12 object-cover rounded-full"
                            />
                        ) : (
                            <div className='flex items-center justify-center'>
                                <CgProfile className='w-12 h-12 text-zinc-400 object-cover' />
                            </div>
                        )}

                        {/* User Title & Emojis */}
                        <div className="text-gray-800 font-medium text-base flex items-center gap-1.5 select-none">
                            {user.name}
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={closeProfilePreview}
                        className="p-2 inline-block rounded-full text-gray-500 cursor-pointer hover:rotate-90 hover:text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300 ease-in-out"
                        aria-label="Close"
                    >
                        <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
                            <path d="M19.8,5.8l-1.6-1.6L12,10.4L5.8,4.2L4.2,5.8l6.2,6.2l-6.2,6.2l1.6,1.6l6.2-6.2l6.2,6.2l1.6-1.6L13.6,12 L19.8,5.8z" />
                        </svg>
                    </button>
                </div>

                {/* Main Content Area (Zoom Animated Image Container) */}
                <div className="flex items-center justify-center p-6 bg-gray-50 min-h-87.5 md:min-h-125">
                    <div className="w-full h-full max-w-112.5 overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200">
                        {userProfileImage ? (
                            <img
                                src={userProfileImage}
                                alt="profile"
                                className='w-full h-full object-cover'
                            />
                        ) : (
                            <CgProfile className='w-full h-full text-zinc-400 object-cover' />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// 2. MEDIA DROPDOWN COMPONENT
export function MediaDropdown({ onFileSelect, onFileRemove, openProfilePreview, openTakePhoto }) {
    { }
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className="absolute rounded-xl m-1 -left-10 bg-white shadow-xl border border-gray-200 z-50" role="application">
            <ul className="py-2 min-w-45">
                {/* View Photo Option */}
                <li>
                    <button type="button" onClick={openProfilePreview} className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left transition-colors">
                        <div className="flex items-center justify-center text-gray-600"><Eye size={18} /></div>
                        <span className="text-gray-800 font-medium text-sm">View photo</span>
                    </button>
                </li>

                {/* Take Photo Option */}
                <li>
                    <button
                        type="button"
                        onClick={openTakePhoto}
                        className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left transition-colors"
                        data-testid="mi-take-photo"
                    >
                        <div className="flex items-center justify-center text-gray-600">
                            <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
                                <title>ic-photo-camera</title>
                                <path d="M12 17.5C13.25 17.5 14.3125 17.0625 15.1875 16.1875C16.0625 15.3125 16.5 14.25 16.5 13C16.5 11.75 16.0625 10.6875 15.1875 9.8125C14.3125 8.9375 13.25 8.5 12 8.5C10.75 8.5 9.6875 8.9375 8.8125 9.8125C7.9375 10.6875 7.5 11.75 7.5 13C7.5 14.25 7.9375 15.3125 8.8125 16.1875C9.6875 17.0625 10.75 17.5 12 17.5ZM12 15.5C11.3 15.5 10.7083 15.2583 10.225 14.775C9.74167 14.2917 9.5 13.7 9.5 13C9.5 12.3 9.74167 11.7083 10.225 11.225C10.7083 10.7417 11.3 10.5 12 10.5C12.7 10.5 13.2917 10.7417 13.775 11.225C14.2583 11.7083 14.5 12.3 14.5 13C14.5 13.7 14.2583 14.2917 13.775 14.775C13.2917 15.2583 12.7 15.5 12 15.5ZM4 21C3.45 21 2.97917 20.8042 2.5875 20.4125C2.19583 20.0208 2 19.55 2 19V7C2 6.45 2.19583 5.97917 2.5875 5.5875C2.97917 5.19583 3.45 5 4 5H7.15L8.4 3.65C8.58333 3.45 8.80417 3.29167 9.0625 3.175C9.32083 3.05833 9.59167 3 9.875 3H14.125C14.4083 3 14.6792 3.05833 14.9375 3.175C15.1958 3.29167 15.4167 3.45 15.6 3.65L16.85 5H20C20.55 5 21.0208 5.19583 21.4125 5.5875C21.8042 5.97917 22 6.45 22 7V19C22 19.55 21.8042 20.0208 21.4125 20.4125C21.0208 20.8042 20.55 21 20 21H4ZM4 19H20V7H15.95L14.125 5H9.875L8.05 7H4V19Z" />
                            </svg>
                        </div>
                        <span className="text-gray-800 font-medium text-sm">Take photo</span>
                    </button>

                </li>

                {/* Upload Photo Option */}
                <li>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current.click()} className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left transition-colors" data-testid="mi-upload-photo">
                        <div className="flex items-center justify-center text-gray-600">
                            <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
                                <title>ic-folder</title>
                                <path d="M4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H9.175C9.44167 4 9.69583 4.05 9.9375 4.15C10.1792 4.25 10.3917 4.39167 10.575 4.575L12 6H20C20.55 6 21.0208 6.19583 21.4125 6.5875C21.8042 6.97917 22 7.45 22 8V18C22 18.55 21.8042 19.0208 21.4125 19.4125C21.0208 19.8042 20.55 20 20 20H4ZM4 18H20V8H11.175L9.175 6H4V18Z" />
                            </svg>
                        </div>
                        <span className="text-gray-800 font-medium text-sm">Upload photo</span>
                    </button>
                </li>

                <div className='border-t border-chat-muted/15'></div>
                <li className='p-1'>
                    <button onClick={onFileRemove} type="button" className="group w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors" data-testid="mi-take-photo">
                        <div className="flex items-center justify-center"><Trash className='group-hover:text-red-400' /></div>
                        <span className="text-gray-800 group-hover:text-red-400 font-medium text-sm">Remove photo</span>
                    </button>
                </li>
            </ul>
        </div>
    );
}

// 3. EDIT PROFILE COMPONENT
export function EditProfile() {
    const { user, socket, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mediaDropdown, setMediaDropdown] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isProfilePreview, setIsProfilePreview] = useState(false);
    const [isTakePhoto, setIsTakePhoto] = useState(false);

    const navigate = useNavigate();

    // 1. Hook reference setup
    const dropdownRef = useRef(null);

    const baseImage = user?.profilePic;
    const userProfileImage = baseImage ? `${baseImage}?t=${new Date().getTime()}` : "";

    // 2. Global outside click controller listener hook
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMediaDropdown(false);
            }
        };

        if (mediaDropdown) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [mediaDropdown]);

    const handleUploadImage = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "profile");
        formData.append("userId", user?._id);

        try {
            setLoading(true);
            setMediaDropdown(false);
            const res = await api.post("/api/uploadMedia", formData);
            const data = res.data;

            const updatedUser = { ...user, profilePic: data.imageUrl };
            localStorage.setItem("talkapp-user", JSON.stringify(updatedUser));
            setUser(updatedUser)

            if (socket) {
                socket.emit("updateProfilePic", {
                    userId: user?._id,
                    profilePic: data.imageUrl
                });
            }

            toast.success("Profile Updated!");
        } catch (err) {
            console.error(err);
            toast.error("Upload failed!");
        } finally {
            setLoading(false);
        }
    };

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleCameraCapture = (base64String) => {
        const convertedFile = dataURLtoFile(base64String, `profile_${Date.now()}.jpg`);
        handleUploadImage(convertedFile);
    };

    const onFileRemove = async () => {
        let removeprofile = true;
        try {
            setLoading(true);
            setMediaDropdown(false);
            const res = await api.post("/api/uploadMedia", { userId: user._id, removeprofile });
            const data = res.data;

            const updatedUser = { ...user, profilePic: data.profilePic };
            localStorage.setItem("talkapp-user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            if (socket) {
                socket.emit("updateProfilePic", {
                    userId: user?._id,
                    profilePic: data.profilePic
                });
            }

            toast.success("Profile Removed Successful!");
        } catch (err) {
            console.error(err);
            toast.error("Profile Removed failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async (newname) => {
        try {
            const { data } = await api.post("/api/auth/register", {
                newname: newname,
                email: user.email
            });
            const updatedUser = { ...user, name: data.name };
            localStorage.setItem("talkapp-user", JSON.stringify(updatedUser));
            if (typeof setUser === "function") {
                setUser(updatedUser);
            }
        } catch (err) {
            toast.error("Failed to update name");
            console.log(err.message);
        }
    };

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(user.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const handleprofilePreview = () => {
        setIsProfilePreview(true);
        setMediaDropdown(false);
    };

    return (
        <>
            {isProfilePreview && (
                <ProfilePreview closeProfilePreview={() => setIsProfilePreview(false)} userProfileImage={userProfileImage} />
            )}

            <TakePhoto
                isOpen={isTakePhoto}
                onClose={() => setIsTakePhoto(false)}
                onUpload={handleCameraCapture}
            />

            <div className='md:flex'>
                <div className="min-h-screen bg-white md:min-w-87.5 text-gray-900 relative" data-aos="fade-up" data-aos-duration="500">

                    {/* Top Navigation */}
                    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => { navigate('/settings', { replace: true }) }} className="rounded-full cursor-pointer p-2 text-gray-600 hover:bg-gray-100 transition">
                                <ArrowLeft size={22} />
                            </button>
                            <h1 className="text-lg font-semibold text-gray-900">Edit Profile</h1>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="mx-auto max-w-md px-5 py-6">
                        <div className="flex flex-col items-center mb-16">
                            <div className="relative">
                                {userProfileImage ? (
                                    <div className="relative h-32 w-32">
                                        {loading && (
                                            <div className="absolute inset-0 bg-white/30 flex items-center justify-center z-50 rounded-full">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-black" />
                                            </div>
                                        )}
                                        <img
                                            src={userProfileImage}
                                            alt="profile"
                                            className="h-full w-full rounded-full object-cover border-4 border-gray-100"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-400 relative">
                                        {loading && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-50 rounded-full">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-black" />
                                            </div>
                                        )}
                                        <CgProfile size={48} />
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsTakePhoto(true)}
                                    className="absolute cursor-pointer z-50 bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] text-white shadow-lg hover:bg-[#06b48f] transition"
                                >
                                    <Camera size={18} />
                                </button>
                            </div>

                            {/* Ref Attached Action Wrapper Area */}
                            <div className='relative'>
                                <button
                                    onClick={() => setMediaDropdown(!mediaDropdown)}
                                    className="mt-4 cursor-pointer flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition"
                                >
                                    <Camera size={16} />
                                    Edit Profile
                                </button>

                                {mediaDropdown && (
                                    <div ref={dropdownRef}>
                                        <MediaDropdown
                                            onFileSelect={handleUploadImage}
                                            onFileRemove={onFileRemove}
                                            openProfilePreview={handleprofilePreview}
                                            openTakePhoto={() => setIsTakePhoto(true)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <EditNameCard user={user} onUpdateName={handleUpdateName} />

                        {/* Email Field */}
                        <div className="mt-5 rounded-2xl bg-gray-50 p-4 border border-gray-100 shadow-sm">
                            <div className="mb-3">
                                <span className="text-sm font-medium text-gray-500">Email</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AnimatePresence>
                                        {copied && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                                                className="fixed left-3 bottom-2 md:bottom-4 z-50 whitespace-nowrap bg-gray-900/90 text-white text-[11px] font-medium px-6 py-3 rounded-xl shadow-lg pointer-events-none"
                                            >
                                                Copied to clipboard !
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    <div className="rounded-full bg-gray-200 text-gray-600 p-2">
                                        <Mail size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">
                                        {user?.email}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCopyEmail}
                                    className="rounded-full cursor-pointer p-2 ms-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <ChatWindow />
            </div>
        </>
    );
}


// 4. MAIN SETTINGS VIEW CONTAINER
const Setting = () => {
    const { user } = useAuth();
    const { isLogoutModalOpen, setIsLogoutModalOpen } = useAppContext();
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const navigate = useNavigate();

    // Base image URL fallback logic
    const baseImage = user?.profilePic;

    // Integrate timestamp only if baseImage exists to avoid generating a broken URL string
    const userProfileImage = baseImage
        ? `${baseImage}?t=${new Date().getTime()}`
        : "";

    return (
        <>


            <div className='md:flex'>

                <div className='flex flex-col md:min-w-87.5 h-dvh md:border-r border-chat-muted/15' data-aos="zoom-in" data-aos-duration="500">
                    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { navigate('/', { replace: true }) }} // 👈 Added replace option here
                                className="rounded-full cursor-pointer p-2 text-gray-600 hover:bg-gray-100 transition"
                            >
                                <ArrowLeft size={22} />
                            </button>
                            <h1 className="text-lg font-semibold text-gray-900">Setting</h1>
                        </div>

                    </div>

                    <div className="bg-transperant w-full overflow-hidden">
                        {/* Search Bar */}
                        <div className="p-4">
                            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search settings"
                                    className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Interactive Profile Row Entry */}
                        <Link to={'/EditProfile'}
                            className="cursor-pointer px-4 py-4 flex items-center justify-center gap-3 rounded-2xl hover:bg-gray-50 transition"
                        >
                            {userProfileImage ? (
                                <img
                                    src={userProfileImage}
                                    alt="profile"
                                    className="w-12 h-12 object-cover rounded-full"
                                />
                            ) : (
                                <div className='flex items-center justify-center'>
                                    <CgProfile className='w-12 h-12 text-zinc-400 object-cover' />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{user?.username || user?.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Tap to change profile info</p>
                            </div>
                        </Link>

                        {/* Menu Options */}
                        <div className="py-2">
                            <Link to={'/EditProfile'}
                                className="w-full cursor-pointer px-6 py-4 flex items-center justify-start gap-3 rounded-2xl hover:bg-gray-50 transition"
                            >
                                <div className='flex items-center justify-center'>
                                    <CgProfile className='w-8 h-8 text-pink-600/90' />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-medium text-gray-800">Profile</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Name, Username, profile photo</p>
                                </div>
                            </Link>
                        </div>

                        {/* Logout Option */}
                        <div className='px-2 text-red-600'>
                            <div
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="flex px-6 py-5 items-center gap-4 border-t cursor-pointer rounded-2xl hover:bg-red-50 border-gray-100 "
                            >
                                <FiLogOut size={20} />
                                <h1 className="text-sm font-medium transition">Log out</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <ChatWindow />

            </div>


            {isLogoutModalOpen && (
                <LogOut isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
            )}

            {/* Render Edit Profile View */}
            {/* {isEditingProfile && (
                <EditProfile setIsEditingProfile={setIsEditingProfile} />
            )} */}
        </>
    );
};

export default Setting;