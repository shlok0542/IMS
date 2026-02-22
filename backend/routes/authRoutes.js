import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/update-profile", protect, updateProfile);

export default router;
