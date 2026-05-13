import express from "express";
const router = express.Router();
import { getMessages, sendMessage, getUnreadCounts } from "../controllers/messageController.js";
import protect from "../middleware/auth.js";

router.get("/unread", protect, getUnreadCounts);
router.get("/:userId", protect, getMessages);
router.post("/", protect, sendMessage);


export default router;    
