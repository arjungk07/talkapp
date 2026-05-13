import express from 'express';
import upload from '../../middleware/multer.js';
import { uploadProfile } from '../../controllers/uploadController.js';

const router = express.Router();

// 'profile' is the field name for the image file
router.post("/upload-profile", upload.single("profile"), uploadProfile);

export default router;