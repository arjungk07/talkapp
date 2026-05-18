import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Camera, } from 'lucide-react'; // Using lucide-react for clean icons
import { MdMarkUnreadChatAlt } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { GrGallery } from "react-icons/gr";
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LogOut from '../components/LogOut';
import { FiLogOut } from "react-icons/fi";




// ---------------- MAIN HEADER COMPONENT ----------------
const WhatsAppHeader = ({ className }) => {
    const [activeTab, setActiveTab] = useState('chats');
    const galleryRef = useRef();

    const profileRef = useRef();
    const { profileImage, setProfileImage, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);




    // 2. Modified Upload Function (now accepts formData as an argument)
    const uploadImage = async (formData) => {
        try {
            setLoading(true);
            const res = await api.post("/api/upload-profile", formData);
            const data = res.data;

            setProfileImage(data.imageUrl);

            console.log("profile", profileImage)

            const updatedUser = { ...user, profilePic: data.imageUrl };
            localStorage.setItem("talkapp-user", JSON.stringify(updatedUser));

            toast.success("Profile Updated!");
        } catch (err) {
            toast.error("Upload failed!");
        } finally {
            setLoading(false);
        }
    };



    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profile", file);
        formData.append("userId", user._id);

        // Call the upload function specifically
        uploadImage(formData);
    };


    const navItems = [
        { id: 'chats', icon: <MdMarkUnreadChatAlt size={25} hasBadge={true} /> },
    ];



    const userProfileImage = profileImage || user?.profilePic;


    const MobileHeader = () => {
        return (
            <header className="w-full h-fit px-5 py-3 select-none">
                {/* Top Row: Wordmark and Action Icons */}
                <div className="flex items-center justify-between">
                    <h1 className="text-black text-xl font-semibold tracking-wide">
                        TalkApp
                    </h1>

                    <div className="flex items-center gap-3">

                        {userProfileImage ? (
                            <img src={userProfileImage} alt="profile" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <CgProfile size={22} className="text-zinc-400" />
                        )}

                        <button className="p-1 rounded-full cursor-pointer ">
                            <Camera size={22} />
                        </button>


                        <button className="p-1 rounded-full cursor-pointer">
                            <MoreVertical size={22} />
                        </button>


                        <FiLogOut size={20} onClick={() => setIsLogoutModalOpen(true)} />

                        <LogOut isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />


                    </div>
                </div>
            </header>
        );
    };


    return (

        <>
            {/* MOBILE VIEW: Only shows on screens smaller than 'md' (768px) */}
            <div className={`${className} md:hidden`}>
                <MobileHeader />
            </div>

            {/* LAPTOP/DESKTOP VIEW: Only shows on screens 'md' and larger */}
            <header
                className=" hidden md:flex flex-col h-screen w-16 bg-chat-panel border-r border-chat-border py-4 items-center justify-between"
            >
                {/* Full screen loading overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black" />
                        <p className="mt-4 font-medium text-black">loading...</p>
                    </div>
                )}

                {/* Top Navigation */}
                <div className="flex flex-col gap-4 w-full px-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`relative w-12 h-12 rounded-full transition-all cursor-pointer flex justify-center items-center
            ${activeTab === item.id ? 'bg-chat-accent/5 text-black' : 'text-zinc-400 hover:bg-chat-accent/5 hover:text-black'}`}
                        >
                            {item.icon}
                            {item.hasBadge && (
                                <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-green-400 rounded-full" />
                            )}
                        </button>
                    ))}
                    <hr className="border border-chat-border my-2" />
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col gap-4 items-center mb-2">
                    <input type="file" ref={galleryRef} className="hidden" accept="image/*" />
                    <button
                        onClick={() => galleryRef.current.click()}
                        className="text-zinc-400 rounded-full hover:bg-chat-accent/5 hover:text-black cursor-pointer p-4 transition-colors"
                    >
                        <GrGallery size={22} />
                    </button>

                    <div className="p-2">
                        <input
                            type="file"
                            ref={profileRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div
                            onClick={() => profileRef.current.click()}
                            className="group relative cursor-pointer w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border-2 hover:border-yellow-400 transition-all"
                        >
                            {userProfileImage ? (
                                <img src={userProfileImage} alt="profile" className="w-full h-full object-cover" />
                            ) : (
                                <CgProfile size={25} className="text-zinc-400" />
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default WhatsAppHeader;