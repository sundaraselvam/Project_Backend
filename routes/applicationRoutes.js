import express from "express";
import { applyToJob, getApplicationsForEmployer, updateApplicationStatus, getApplicationsForJobSeeker, getApplicationById } from "../controllers/applicationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/apply/:jobId", requireAuth, uploadResume.single("resume"), applyToJob);
router.get("/employer", requireAuth, getApplicationsForEmployer);
router.get("/jobseeker", requireAuth, getApplicationsForJobSeeker);
router.get("/:id", requireAuth, getApplicationById);
router.put("/:id/status", requireAuth, updateApplicationStatus);

export default router;
