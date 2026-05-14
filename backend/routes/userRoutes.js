import express from "express";
const router = express.Router();
import { getUsers, getMe, getUserById } from "../controllers/userController.js";
import protect from "../middleware/auth.js";

router.get("/", protect, getUsers);
router.get("/me", protect, getMe);
router.get("/:id", protect, getUserById);

export default router;
