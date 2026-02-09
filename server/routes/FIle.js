import express from 'express'
import { handleFileUpload, handleFileRetrieval} from '../controllers/File.js';
import { AuthHandler } from '../middlewares/Auth.js';
const router= express.Router();

router.post('/upload',AuthHandler,handleFileUpload);
router.get('/retrieve/:fileID',AuthHandler,handleFileRetrieval);
export default router;