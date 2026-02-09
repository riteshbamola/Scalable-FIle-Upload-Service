import express from 'express'
import { handleFileUpload } from '../controllers/File.js';
import { AuthHandler } from '../middlewares/Auth.js';
const router= express.Router();

router.post('/upload',AuthHandler,handleFileUpload);

export default router;