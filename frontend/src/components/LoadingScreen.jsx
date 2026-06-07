import React from 'react';
import { useState, useEffect } from 'react';
import logo from '../assets/image/logo1.png';

function LoadingProgressBar({ duration }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const startTime = Date.now();

        const updateProgress = () => {
            const elapsedTime = Date.now() - startTime;
            const linearProgress = Math.min((elapsedTime / duration) * 100, 100);

            // WhatsApp style easing curve: logarithmic progression 
            // (moves fast initially, then slows down to simulate loading data)
            const easedProgress = 100 - Math.pow(1 - linearProgress / 100, 2) * 100;

            setProgress(easedProgress);

            if (elapsedTime < duration) {
                requestAnimationFrame(updateProgress);
            }
        };

        const animationFrame = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(animationFrame);
    }, [duration]);


    return (
        <div className="w-full space-y-4 text-center">
            {/* Track */}
            <div className="w-full h-0.75 bg-[#e9edef] rounded-full overflow-hidden">
                {/* Progress Fill */}
                <div
                    className="h-full bg-[#00a884] transition-all duration-75 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <span className='text-black/70 text-sm font-medium google-sans'>{Math.round(progress)}%</span>

            {/* Status texts matching WhatsApp style */}
            <div className="flex flex-col gap-0.5">
                <span className="text-[14px] text-gray-700 font-medium talkapp-font">
                    Loading your chats
                </span>
            </div>
            
        </div>
    );
}

export default function LoadingScreen({ initialLoading, usersCount }) {
    // Only show if we are actively loading the initial payload and have no data yet
    if (!initialLoading || usersCount > 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-chat-panel p-8 select-none">
            {/* Top Spacer to push content down slightly for that off-center WhatsApp look */}
            <div className="h-10" />

            {/* Center Content: Brand Icon & Progress */}
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-xs gap-8">
                {/* Logo */}

                <img src={logo} className='w-24 h-24' />

                {/* The Progress Bar Component */}
                <LoadingProgressBar duration={6000} />
            </div>

            {/* Bottom Footer Text */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-xs tracking-widest text-gray-400 talkapp-font font-medium">
                    Talkapp
                </span>
                <span className="text-[11px] talkapp-font text-gray-400 flex items-center gap-1">
                    {/* Padlock icon for end-to-end encrypted */}
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Fully safe
                </span>
            </div>
        </div>
    );
}