import express from "express";
import {
  handleFileUpload,
  handleFileRetrieval,
  getAllFiles,
  confirmUpload,
  fileDelete,
} from "../controllers/File.js";
import { AuthHandler } from "../middlewares/Auth.js";
const router = express.Router();

router.post("/request-upload", AuthHandler, handleFileUpload);
router.get("/retrieve/:fileID", AuthHandler, handleFileRetrieval);
router.get("/allfiles", AuthHandler, getAllFiles);
router.post("/confirm-upload", AuthHandler, confirmUpload);
router.delete("/deletefile/:fileId", AuthHandler, fileDelete);

// multipart

router.post("/request-multipart", AuthHandler, startUpload);
router.post("/upload-part", AuthHandler, getMultiPartURL);
router.post("/complete-multipart", AuthHandler, completeUpload);
router.post("/cancel-multipart", AuthHandler, cancelUpload);

export default router;
