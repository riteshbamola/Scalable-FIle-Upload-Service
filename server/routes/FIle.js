import express from 'express'
import { handleFileUpload, handleFileRetrieval, getAllFiles} from '../controllers/File.js';
import { AuthHandler } from '../middlewares/Auth.js';
const router= express.Router();

router.post('/upload',AuthHandler,handleFileUpload);
router.get('/retrieve/:fileID',AuthHandler,handleFileRetrieval);
router.get('/allfiles',AuthHandler,getAllFiles);
export default router;