import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * ReplyPreview
 * ─────────────
 * Props:
 *   replyingTo  {object|null}  — the message being replied to (null = hidden)
 *   onCancel    {function}     — called when the X button is clicked
 */
const ReplyPreview = ({ replyingTo, replyingTobubble, onCancel }) => {
  const { user } = useAuth();

  // Who sent the message we're replying to?
  const isOwnMessage = replyingTo?.senderId === user?._id;
  const senderLabel = isOwnMessage ? "You" : user.name;

  // Truncate long messages so the bar stays compact
  const previewText =
    replyingTo?.text?.length > 80
      ? replyingTo.text.slice(0, 80) + "…"
      : replyingTo?.text;

  return (
    <AnimatePresence>

      {replyingTo && (
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
            onClick={onCancel}
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

      {
        replyingTobubble && (
          <motion.div

            className="relative
            flex items-center 
            bg-chat-accent/5
            border border-chat-border
            rounded-2xl
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            overflow-hidden
          "
          >

            {/* Left accent bar — same colour as sent bubble */}
            <div className="w-1 self-stretch rounded-full bg-chat-text shrink-0" />

            {/* Text */}
            <div className="flex-1 py-3 px-2 min-w-0">
              <p className="text-sm talkapp-font font-semibold text-chat-text truncate leading-tight mb-2">
                {senderLabel}
              </p>
              <p className={`text-md google-sans leading-relaxed select-none md:select-text wrap-break-word cursor-text whitespace-pre-wrap `}>
                {replyingTobubble.text}
              </p>
            </div>



          </motion.div>
        )
      }


    </AnimatePresence>
  );
};

export default ReplyPreview;