import express from "express";
import { createJob, listJobs, getJob, updateJob, deleteJob, recommendJobs } from "../controllers/jobController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listJobs);
router.get("/recommend", recommendJobs);
router.get("/:id", getJob);
router.post("/", requireAuth, createJob);
router.put("/:id", requireAuth, updateJob);
router.delete("/:id", requireAuth, deleteJob);

export default router;
