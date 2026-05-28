import express from 'express';
import upload from '../../config/cloudinary.js';
import { uploadMedia } from '../../controllers/uploadController.js';

const router = express.Router();

router.post("/uploadMedia", upload.single("file"), uploadMedia);

export default router;