import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImageIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import { ProfilePic } from "../pages/Setting";



// ImageFull Preview component. user click the image on chat window execute the component 
export const ImageFullPreview = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state?.imageUrl) {
    navigate(-1);
    return null;
  }

  const {
    imageUrl,
    senderName,
    createdAt,
    profileUrl,
  } = state;

  return (
    <div className="fixed inset-0 z-9999 bg-white flex flex-col">

      {/* Header */}
      <header className="h-20 shrink-0 px-4  flex items-center  gap-3 bg-white border-b border-chat-panel">

        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft size={22} />
        </button>

         {/* profile pic */}
        <ProfilePic />

        {/* User Details */}
        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-900">
            {senderName}
          </h3>

          <p className="text-xs text-gray-500">
            {createdAt
              ? format(
                  new Date(createdAt),
                  "dd MMM yyyy • hh:mm a"
                )
              : ""}
          </p>
        </div>
      </header>

      {/* Image Viewer */}
      <main className="flex-1 overflow-hidden">

        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={5}
          centerOnInit
          wheel={{
            smoothStep: 0.15,
          }}
          doubleClick={{
            mode: "zoomIn",
          }}
        >
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentClass="!w-full !h-full flex items-center justify-center"
          >
            <img
              src={imageUrl}
              alt="Preview"
              draggable={false}
              className="
                max-w-full
                max-h-full
                object-contain
                select-none
                pointer-events-none
              "
            />
          </TransformComponent>
        </TransformWrapper>

      </main>
    </div>
  );
};



const ReplyPreview = ({ replyingTo, replyingTobubble, onReplyCancel, imageTo, onImgCancel }) => {


  const { user } = useAuth();



  // Who sent the message we're replying to?
  const isOwnMessage = replyingTo?.senderId || replyingTobubble?.userId  === user?._id;
  const senderLabel = isOwnMessage ? "You" : "Them";

  // Truncate long messages so the bar stays compact
  const previewText =
    replyingTo?.text?.length > 80
      ? replyingTo.text.slice(0, 80) + "…"
      : replyingTo?.text;

  return (
    <AnimatePresence>

      {/*  replyingTo for normal text */}
      {replyingTo && !replyingTo?.attachments?.[0] && (
        <motion.div
          key="reply-preview"
          /* ── Slide up from bottom + fade in ── */
          initial={{ opacity: 0, y: 12, scaleY: 0.85 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: 10, scaleY: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{ transformOrigin: "bottom" }}
          className="
             mb-1
            flex items-center gap-3
            bg-white
            border border-chat-border
            rounded-2xl
            px-4 py-2.5
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            overflow-hidden
          "
        >
          {/* Left accent bar — same colour as sent bubble */}
          <div className="w-1 self-stretch rounded-full bg-chat-accent shrink-0" />

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-chat-accent truncate leading-tight">
              {senderLabel}
            </p>

            <p className="text-[12px] text-chat-muted truncate leading-snug mt-0.5">
              {previewText}
            </p>
          </div>

          {/* Cancel button */}
          <motion.button
            type="button"
            onClick={onReplyCancel}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="
              w-6 h-6 shrink-0
              flex items-center justify-center
              rounded-full
              bg-gray-100 hover:bg-gray-200
              text-gray-500
              transition-colors duration-150
              cursor-pointer
            "
            aria-label="Cancel reply"
          >
            <X size={13} strokeWidth={2.5} />
          </motion.button>

        </motion.div>
      )}

       {/* replyingTo for imagepreview on input field */}
      {replyingTo?.attachments?.[0] && (
        <motion.div
          key="reply-preview"
          initial={{ opacity: 0, y: 12, scaleY: 0.85 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: 10, scaleY: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{ transformOrigin: "bottom" }}
          className="
      mb-1
      flex items-center
      bg-white
      border border-chat-border
      rounded-2xl
      px-4 py-2.5
      shadow-[0_2px_12px_rgba(0,0,0,0.06)]
      overflow-hidden
    "
        >
          <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100 max-w-xs">
            <img
              src={
                replyingTo?.attachments?.[0]?.localUrl ||
                replyingTo?.attachments?.[0]?.url
              }
              alt="preview"
              className="w-20 h-20 object-cover rounded-xl"
            />
          </div>

          <motion.button
            type="button"
            onClick={onReplyCancel}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="
        w-8 h-8 shrink-0
        flex items-center justify-center
        rounded-full
        bg-gray-100 hover:bg-gray-200
        text-gray-500
        transition-colors duration-150
        cursor-pointer
        ml-auto
      "
            aria-label="Cancel reply"
          >
            <X size={16} strokeWidth={2.5} />
          </motion.button>
        </motion.div>
      )}

       {/* reply Bubble ui with text and image */}
      {replyingTobubble && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="
      flex items-center
      bg-white
      rounded-xl
      overflow-hidden
      shadow-sm
    "
        >
          {/* Accent Bar */}
          <div className="w-1 self-stretch bg-green-500 shrink-0" />

          <div className="flex-1 min-w-0 px-3 py-2">
            <p className="text-xs font-semibold text-green-600 truncate">
              {senderLabel}
            </p>

            {replyingTobubble.image ? (
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <ImageIcon size={13} />
                  <span>Photo</span>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-700 truncate">
                {replyingTobubble.text}
              </p>
            )}
          </div>

          {/* Thumbnail */}
          {replyingTobubble.image && (
            <img
              src={replyingTobubble.image}
              alt=""
              className="
          h-14 w-14
          object-cover
          shrink-0
        "
            />
          )}
        </motion.div>
      )}

       {/* replyingTo for imagePreview without attachments image */}
      {imageTo && (
        <motion.div
          key="reply-preview"
          /* ── Slide up from bottom + fade in ── */
          initial={{ opacity: 0, y: 12, scaleY: 0.85 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: 10, scaleY: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{ transformOrigin: "bottom" }}
          className="
      mb-1
      flex items-center 
      bg-white
      border border-chat-border
      rounded-2xl
      px-4 py-2.5
      shadow-[0_2px_12px_rgba(0,0,0,0.06)]
      overflow-hidden
    "
        >

          {/* Text / Image Container */}
          <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100 max-w-xs">
            {imageTo?.path && (
              <img
                src={imageTo.path}
                alt="preview"
                className="w-20 h-20 object-cover rounded-xl"
              />
            )}
          </div>

          {/* Cancel button */}
          <motion.button
            type="button"
            onClick={onImgCancel}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="
        w-8 h-8 shrink-0
        flex items-center justify-center
        rounded-full
        bg-gray-100 hover:bg-gray-200
        text-gray-500
        transition-colors duration-150
        cursor-pointer
        ml-auto
      "
            aria-label="Cancel reply"
          >
            <X size={16} strokeWidth={2.5} />
          </motion.button>

        </motion.div>
      )}



    </AnimatePresence>
  );
};

export default ReplyPreview;