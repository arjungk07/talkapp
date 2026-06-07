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
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';




export function Profile({openSetting}) {

    const { user } = useAuth();

    const userProfileImage = user?.profilePic;


    return (

        <>


            <div onClick={openSetting} className="p-2">

                <div
                    className="
      relative
      w-10
      h-10
      md:w-12
      md:h-12
      cursor-pointer
      group
    "
                >


                    {/* ROTATING RING */}
                    <div
                        className="
        absolute
        inset-0
        rounded-full
        bg-linear-to-tr
        from-yellow-400
        via-pink-500
        to-purple-600
        animate-spin
      "
                    />

                    {/* PROFILE */}
                    <div
                        className="
        absolute
        inset-0.5
        rounded-full
        overflow-hidden
        bg-white
        flex
        items-center
        justify-center
      "
                    >

                        {userProfileImage ? (
                            <img
                                src={userProfileImage || DEFAULT_AVATAR}
                                alt="Profile"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                    // 1. Prevent the error from trying to load again
                                    e.target.onerror = null;
                                    // 2. Point the source to the fallback image
                                    e.target.src = DEFAULT_AVATAR;
                                }}
                            />
                        ) : (
                            <CgProfile
                                size={22}
                                className="text-zinc-400"
                            />
                        )}

                    </div>

                </div>

            </div>

        </>
    );
}


// ---------------- MAIN HEADER COMPONENT ----------------
const WhatsAppHeader = ({ className }) => {


    const { isLogoutModalOpen, setIsLogoutModalOpen } = useAppContext();

    const [activeTab, setActiveTab] = useState('chats');
    const galleryRef = useRef();




    const navItems = [
        { id: 'chats', icon: <MdMarkUnreadChatAlt size={25} /> },
    ];


    const navigate = useNavigate();

    const openSetting = () => {
        navigate('/settings');
    }


    const MobileHeader = () => {
        return (
            <header className="w-full h-fit px-5 py-3 select-none ">
                {/* Top Row: Wordmark and Action Icons */}
                <div className="flex items-center justify-between">
                    <h1 className="text-black text-xl font-semibold tracking-wide">
                        TalkApp
                    </h1>

                    <div className="flex items-center gap-3">



                        <Profile openSetting={openSetting}/>

                        <button className="p-1 rounded-full cursor-pointer ">
                            <Camera size={22} />
                        </button>


                        <div onClick={openSetting}
                            className="p-1 rounded-full cursor-pointer">
                            <MoreVertical size={22} />
                        </div>




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
                className=" hidden md:flex flex-col h-screen w-16 bg-chat-panel  border-r border-chat-border py-4 items-center justify-between"
            >


                {/* Top Navigation */}
                <div className="flex flex-col gap-4 w-full px-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id) }}
                            className={`relative w-12 h-12 rounded-full transition-all cursor-pointer flex justify-center items-center
            ${activeTab === item.id ? 'bg-chat-accent/5 text-black' : 'text-black/70 hover:bg-chat-accent/5 hover:text-black'}`}
                        >
                            {item.icon}

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

                    <Profile openSetting={openSetting}/>



                </div>
            </header>
        </>
    );
};

export default WhatsAppHeader;