import express from "express";
import { register, login, requestPasswordReset, resetPassword, changePassword, updateProfile, uploadProfilePicture, getMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadImageMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/password/forgot", requestPasswordReset);
router.post("/password/reset", resetPassword);
router.post("/password/change", requireAuth, changePassword);
router.put("/profile", requireAuth, updateProfile);
router.post("/profile/picture", requireAuth, uploadImage.single('profilePicture'), uploadProfilePicture);
router.get('/me', requireAuth, getMe);

export default router;
