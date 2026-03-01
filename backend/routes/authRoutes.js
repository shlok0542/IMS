import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  recoverPasswordByIdentity,
  getProfile,
  updateProfile,
  deleteAccount
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/recover-password", recoverPasswordByIdentity);
router.get("/profile", protect, getProfile);
router.put("/update-profile", protect, updateProfile);
router.delete("/delete-account", protect, deleteAccount);

export default router;
