import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Trash2, X, ArrowDown, PlusIcon, ImageIcon, PaperclipIcon, CameraIcon, Upload, Clock } from "lucide-react";
import { useMessages } from "../hooks/useMessages";
import { useChatSearch } from "../hooks/useChatSearch";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import TalkAppWallpaper from "../components/TalkAppWallpaper";
import { useAppContext } from "../context/AppContext";
import ReplyPreview from "./ReplyPreview";
import { Keyboard } from "lucide-react";
import { format, set } from "date-fns";
import { UploadBar, DeleteMessagePopup, DeleteAction } from "./ActionBars";
import api from "../utils/api";
import toast from "react-hot-toast";
import Loading_animation from '../assets/image/loading_animation.mp4'




// Frequently used messages



export const RecentMsg = ({ handleSend }) => {
  const { selectedUser } = useAuth();
  const { messages } = useAppContext()

  const [hiddenMessages, setHiddenMessages] = useState([]);

  // ✅ real-time frequency calculation
  const frequentMessages = useMemo(() => {
    const map = {};

    messages.forEach((msg) => {
      const text = msg?.text?.trim();
      if (!text) return;

      map[text] = (map[text] || 0) + 1;
    });

    return Object.entries(map)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([text, count]) => ({ text, count }));
  }, [messages]);

  const defaultMessages = [
    { text: "👍" },
    { text: "Hello" },
    { text: "How are you?" },
    { text: "Thank you" },
    { text: "Okay" },
  ];


  const displayMessages = (
    frequentMessages.length > 0 ? frequentMessages : defaultMessages
  ).filter((msg) => !hiddenMessages.includes(msg.text));

  const handleLongPress = (text) => {
    setHiddenMessages((prev) =>
      prev.includes(text) ? prev : [...prev, text]
    );
  };

  let pressTimer;

  const startPressTimer = (text) => {
    pressTimer = setTimeout(() => {
      handleLongPress(text);
    }, 600);
  };

  const cancelPressTimer = () => {
    clearTimeout(pressTimer);
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto px-4 py-2 scrollbar-hide">

      {displayMessages.map((msg, index) => (

        <button
          key={msg.text}
          onClick={() => handleSend(msg.text)}
          onMouseDown={() => startPressTimer(msg.text)}
          onMouseUp={cancelPressTimer}
          onMouseLeave={cancelPressTimer}
          onTouchStart={() => startPressTimer(msg.text)}
          onTouchEnd={cancelPressTimer}
          className={`
            cursor-pointer
            shrink-0
            max-w-35
            md:max-w-55
            truncate
            rounded-full
            border border-gray-200
            bg-white
            px-4 py-2
            text-sm font-medium text-gray-700
            shadow-sm
            transition-all duration-200
            hover:bg-green-50
            hover:border-green-300
            hover:text-green-600
            hover:shadow-md
            active:scale-95
            ${index >= 5 ? "hidden md:block" : ""}
          `}
        >
          {msg.text}
        </button>

      ))}
      <Clock size={30} className="shrink-0" />
    </div>
  );
};

const ChatWindow = () => {
  const { user, selectedUser } = useAuth();

  const {
    messages,
    isSelectMode,
    setIsSelectMode,
    selectedMessageIds,
    setSelectedMessageIds,
    setSelectedMsg,
    setIsShowMode,
    isActive,
    setShowPicker,
  } = useAppContext();

  // search state and hook
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    currentMatchIndex,
    totalMatches,
    nextMatch,
    prevMatch,
    registerMessageRef,
  } = useChatSearch(messages);

  const { loading, sending, setSending, isTyping, sendMessage, uploadImage, deleteMessages, sendReaction, emitTyping, emitStopTyping } = useMessages(selectedUser);
  const [DeleteModel, setDeleteModel] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // reply state
  const [imageTo, setimageTo] = useState(null);
  const [text, setText] = useState("");
  const inputRef = useRef(null); // focus input when reply is set
  const bottomRef = useRef(null); // for go to bottom
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const plusiconRef = useRef(null);// reference of the plus icon 
  const uploadBarRef = useRef(null)// reference of the uploadBar
  const [keyboardHeight, setKeyboardHeight] = useState(0); // find visual keyboard height it is very important
  const [showScrollBottom, setShowScrollBottom] = useState(false); // for go to bottom with an icon
  const [openFileAction, setopenFileAction] = useState(false); //show the upload action bar on chat window




  // find orignal height when keyboard open
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;


    const handleViewportChange = () => {
      const keyboardH = window.innerHeight - viewport.height - viewport.offsetTop;
      setKeyboardHeight(keyboardH > 0 ? keyboardH : 0);


    };

    viewport.addEventListener("resize", handleViewportChange);
    viewport.addEventListener("scroll", handleViewportChange);

    return () => {
      viewport.removeEventListener("resize", handleViewportChange);
      viewport.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  // Detect scroll position
  useEffect(() => {

    const container = chatContainerRef.current;

    if (!container) return;

    const handleScroll = () => {

      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 300;

      setShowScrollBottom(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };

  }, []);

  // ── Click-outside: action bar ────────────────────────────────────────────────
  useEffect(() => {
    if (!openFileAction) return;

    const onDown = (e) => {
      const clickedInsideMenu = uploadBarRef.current?.contains(e.target);
      const clickedInsideButton = plusiconRef.current?.contains(e.target);

      // If the click is outside both elements, reset the state
      if (!clickedInsideMenu && !clickedInsideButton) {
        setopenFileAction(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openFileAction]);


  // Auto scroll to bottom on new messages / typing indicator , typing
  useEffect(() => {

    if (bottomRef.current) {
      // 1. Get the position of your bottom element relative to the screen
      const rect = bottomRef.current.getBoundingClientRect();

      // 2. Check if the bottom element is already visible in the viewport
      // We add a 50px buffer zone for safety
      const isAtBottom = rect.top <= window.innerHeight + 50;

      // 3. Only scroll down if it's NOT already visible on screen
      if (!isAtBottom) {
        bottomRef.current.scrollIntoView({ behavior: "auto" });
      }
    }
  }, [messages, isTyping, text]);


  const scrollToBottom = () => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };



  const handleSend = async (recentTxt = null, e) => {
    if (e && e.preventDefault) e.preventDefault();

    const Msgtext = recentTxt ?? text;

    console.log(Msgtext);
    console.log(typeof (Msgtext))

    // FIX: Return early if there is no content OR if we are ALREADY sending
    if ((!Msgtext.trim() && !imageTo) || sending) return;

    try {
      setSending(true);

      if (imageTo && imageTo.formData) {
        await uploadImage(imageTo.formData, setimageTo);
      }

      clearTimeout(typingTimeoutRef.current);
      emitStopTyping();

      await sendMessage(
        Msgtext,
        isActive,
        replyingTo ? { _id: replyingTo._id, text: replyingTo.text, image: replyingTo?.attachments?.[0]?.url } : null
      );

      // Clear inputs and states on success
      setText("");
      setReplyingTo(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
      autoResizeTextarea();

    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  // the function trigger when submit the msg 
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  }

  const autoResizeTextarea = () => {
    const textarea = inputRef.current;
    if (!textarea) return;

    // 1. Check if empty or whitespace-only: reset to default instantly
    if (!textarea.value.trim()) {
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";
      return; // Stop execution early
    }

    // 2. Reset height to calculate expansion accurately
    textarea.style.height = "auto";

    // 3. Set height to scrollHeight
    textarea.style.height = textarea.scrollHeight + "px";
    textarea.style.maxHeight = "300px";

    // 4. Toggle scrollbar visibility strictly at the 300px ceiling limit
    if (textarea.scrollHeight > 300) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  };

  const handleTyping = useCallback((e) => {
    setText(e.target.value);
    autoResizeTextarea();
    emitTyping();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitStopTyping(), 2000);
  }, [emitTyping, emitStopTyping]);

  const handleKeyDown = (e) => {
    console.log("key down")
    // If the user presses Enter without holding Shift, send the message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Stop a fresh empty line from making a mess
      if ((text.trim() || imageTo) && !sending) {
        handleSend();
      }
    }
  };

  // --- DELETE & SELECTION LOGIC ---

  // Enter select mode and automatically check the message where "Delete" was clicked
  const handleStartDeleteMode = (messageId) => {
    setIsSelectMode(true);
    setSelectedMessageIds([messageId]);
  };



  const handleCancelSelectMode = () => {
    setIsSelectMode(false);
    setSelectedMessageIds([]);
    setSelectedMsg([]);
  };

  const handleDeleteSelected = async (deleteforme) => {
    console.log("Selected Message IDs", selectedMessageIds);
    setIsSelectMode(false);
    setDeleteModel(false);
    try {
      await deleteMessages(selectedMessageIds, deleteforme);
      console.log("Messages deleted successfully");
      setSelectedMessageIds([]);
      setSelectedMsg([]);
      if (typeof setIsShowMode === "function") setIsShowMode(false);
    } catch (error) {
      console.error("Failed to delete messages:", error);
    }


  };




  const handleEmojiClick = async (messageId, emoji) => {

    try {
      // Close the open picker panel
      setIsSelectMode(false);
      setShowPicker(null);
      await sendReaction(messageId, emoji.emoji);

    } catch (error) {
      console.log(error);
    }

  }

  // Called from MessageBubble when user swipes to reply
  const handleReply = (message) => {
    setReplyingTo(message);
    // Focus the input so user can start typing immediately
    requestAnimationFrame(() => inputRef.current?.focus());
  };





  // No user selected — only visible on desktop (parent hides this on mobile)
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center h-screen justify-center bg-chat-panel" >
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-chat-panel border border-chat-border flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-12 h-12 text-chat-accent opacity-60" fill="currentColor" viewBox="0 0 24 24">
              <title>TalkApp Logo</title>
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.02-1.35C8.47 21.52 10.19 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
          <h2 className="text-xl text-chat-text mb-2 font-bold">Welcome to TalkApp</h2>
          <p className="text-chat-muted text-sm max-w-xs talkapp-font font-medium">Select a contact from the sidebar to start a conversation</p>
        </div>
      </div>
    );
  }



  return (

    <div className={`relative flex flex-col w-full h-dvh bg-chat-bg`}  >
      {/* ── HEADER — never moves ── */}
      <div className={`absolute top-0 inset-x-0 ${DeleteModel ? "z-0" : "z-99"} bg-white`}>
        <ChatHeader
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentMatchIndex={currentMatchIndex}
          totalMatches={totalMatches}
          nextMatch={nextMatch}
          prevMatch={prevMatch}
        />
      </div>

      {/* ── MESSAGES — scrollable, fills remaining space ── */}
      <main
        ref={chatContainerRef}
        className="relative flex-1 w-full px-4 overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{
          paddingTop: "120px",
          paddingBottom: `${keyboardHeight + 50}px`,  // ✅ adjusts when keyboard opens
          transition: 'paddingBottom 0.2s ease'
        }}>

        <div className="w-full px-4 lg:px-6 relative">
          <TalkAppWallpaper />
        </div>



        {loading ? (

          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-32 h-32 object-contain"
              >
                <source src={Loading_animation} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <p className="font-medium text-black">
                Loading Messages...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 rounded-2xl bg-chat-panel border border-chat-border flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-chat-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-chat-muted text-sm">No messages yet.</p>
            <p className="text-chat-muted text-xs mt-1">
              Say hello to {selectedUser.name}! 👋
            </p>
          </div>
        ) : (
          <>
            {messages?.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                onEmojiClick={handleEmojiClick}
                onReply={handleReply}
                replyingTo={replyingTo}
                searchQuery={searchQuery}
                registerMessageRef={registerMessageRef}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}

        {showScrollBottom && (
          <div className="sticky bottom-0 flex justify-center z-50">

            <button
              onClick={scrollToBottom}
              className="
    animate-bounce
    cursor-pointer
    flex
    items-center
    justify-center
    w-12
    h-12
    rounded-full
    bg-white/90
    backdrop-blur-xl
    text-gray-700
    border
    border-white/40
    shadow-lg
    hover:scale-110
    active:scale-95
    transition-all
    duration-300
  "
            >
              <ArrowDown size={20} />
            </button>

          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <UploadBar
        value={{
          open: openFileAction,
          uploadBarRef: uploadBarRef,
          imageTo: imageTo,
          setimageTo: setimageTo,
          setopenFileAction: setopenFileAction
        }}
      />

      <RecentMsg handleSend={handleSend} />

      {/* ── FOOTER — sticky at visual bottom, never moves ── */}

      {
        !isSearchOpen && (
          <footer
            className={`sticky right-0 bottom-0 ${DeleteModel ? "z-0" : "z-50 md:z-0"} bg-white px-4 py-2`}
            style={{
              bottom: `${keyboardHeight}px`,
              transition: "bottom 0.2 ease"
            }}

          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-0 bg-white border border-chat-border rounded-3xl p-2 md:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md"
            >
              {!isSelectMode ? (
                <>
                  {/* Reply Preview  */}
                  <div className={`${replyingTo || imageTo ? "block w-full" : "hidden"}`}>
                    <ReplyPreview
                      replyingTo={replyingTo}
                      imageTo={imageTo}
                      onReplyCancel={() => setReplyingTo(null)}
                      onImgCancel={() => setimageTo(null)}
                    />
                  </div>

                  {/* plus icon + input box */}
                  <div className="relative flex items-center justify-center w-full">
                    <button
                      ref={plusiconRef}
                      type="button"
                      onClick={() => { setopenFileAction(!openFileAction); }}
                      className="cursor-pointer group relative flex items-center justify-center rounded-full bg-linear-to-r from-cyan-500 to-blue-500 text-white"
                    >
                      <PlusIcon
                        className={`transition-transform duration-300 ease-in-out ${openFileAction ? "rotate-45" : "rotate-0"}`}
                      />
                      {/* Hover Text */}
                      <span className={`absolute left-2 bottom-7 ${openFileAction ? "invisible opacity-0" : "invisible opacity-0 group-hover:opacity-100 group-hover:visible"} transition-all duration-300 px-4 py-2 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 text-white text-sm whitespace-nowrap shadow-lg`}>
                        Add files and more...
                      </span>
                    </button>

                    <textarea
                      rows={1}
                      autoComplete="off"
                      ref={inputRef}
                      value={text}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message to ${selectedUser.name}...`}
                      maxLength={2000}
                      className="w-full resize-none bg-transparent focus:ring-0 focus:outline-none px-3 text-chat-text placeholder-chat-muted text-sm"
                    />

                    {text.length > 1800 && (
                      <span className="absolute right-16 top-1/2 -translate-y-1/2 text-xs text-chat-muted">
                        {2000 - text.length}
                      </span>
                    )}

                    {/* CHANGED: type="submit" so it utilizes the primary form element handler */}
                    <button
                      type="submit"
                      disabled={(!text.trim() && !imageTo) || sending}
                      className="relative z-50 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 
            bg-chat-accent hover:bg-chat-accent-light text-white
            disabled:opacity-40 disabled:bg-chat-accent disabled:hover:bg-chat-accent disabled:cursor-not-allowed shrink-0"
                    >
                      {sending ? (
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      )}
                    </button>
                  </div>

                </>
              ) : (
                <DeleteAction
                  value={{
                    handleCancelSelectMode: handleCancelSelectMode,
                    DeleteModel: () => setDeleteModel(true)
                  }}
                />
              )}
            </form>


          </footer>
        )
      }


      <DeleteMessagePopup
        value=
        {{
          open: DeleteModel,
          onClose: () => setDeleteModel(false),
          onDelete: handleDeleteSelected

        }}

      />





    </div>
  );
};

export default ChatWindow;