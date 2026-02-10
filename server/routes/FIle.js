import express from 'express'
import { handleFileUpload, handleFileRetrieval, getAllFiles,confirmUpload} from '../controllers/File.js';
import { AuthHandler } from '../middlewares/Auth.js';
const router= express.Router();

router.post('/request-upload',AuthHandler,handleFileUpload);
router.get('/retrieve/:fileID',AuthHandler,handleFileRetrieval);
router.get('/allfiles',AuthHandler,getAllFiles);
router.post('/confirm-upload',AuthHandler,confirmUpload);
export default router;