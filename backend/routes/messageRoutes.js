import express from "express";
const router = express.Router();
import { getMessages, sendMessage,addMessageReaction, getUnreadCounts, deleteMessages } from "../controllers/messageController.js";
import protect from "../middleware/auth.js";

router.get("/unread", protect, getUnreadCounts); // read counts
router.get("/:userId", protect, getMessages); // get messages
router.post("/:messageId/react", protect, addMessageReaction); // reactions for messages
router.post("/", protect, sendMessage); // send messages
router.delete("/deletemessages", protect, deleteMessages); // delete messages 


export default router;
