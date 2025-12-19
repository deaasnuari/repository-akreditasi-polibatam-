import express from "express";
import {
  getAllSubmittedLED,
  submitLEDReview,
  getReviewHistory
} from "../controllers/reviewLEDP4MController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/p4m/reviewLED - Ambil semua LED yang sudah disubmit
router.get("/", getAllSubmittedLED);

// POST /api/p4m/reviewLED/submit - Submit review
router.post("/submit", authenticateToken, submitLEDReview);

// GET /api/p4m/reviewLED/history/:user_id - Ambil history review untuk user tertentu
router.get("/history/:user_id", getReviewHistory);

export default router;
