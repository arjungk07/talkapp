import express from 'express';
import upload from '../../config/cloudinary.js';
import { uploadProfile } from '../../controllers/uploadController.js';

const router = express.Router();

router.post("/upload-profile", upload.single("profile"), uploadProfile);

export default router;