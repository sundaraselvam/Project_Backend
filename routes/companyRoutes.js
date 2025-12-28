import express from "express";
import { createCompany, updateCompany, getCompany, listCompanies, uploadCompanyLogo } from "../controllers/companyController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadImageMiddleware.js";

const router = express.Router();

router.get("/", listCompanies);
router.get("/:id", getCompany);
router.post("/", requireAuth, createCompany);
router.put("/:id", requireAuth, updateCompany);
router.post('/:id/logo', requireAuth, uploadImage.single('logo'), uploadCompanyLogo);

export default router;
