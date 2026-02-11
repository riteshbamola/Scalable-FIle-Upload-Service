import express from "express";
import { AuthHandler } from "../middlewares/Auth.js";
import {
  handleSignUp,
  handleSignIn,
  rotateToken,
  handleLogout,
} from "../controllers/Auth.js";

const router = express.Router();
router.post("/signup", handleSignUp);
router.post("/signin", handleSignIn);
router.post("/refresh", rotateToken);
router.post("/logout", handleLogout);
export default router;
