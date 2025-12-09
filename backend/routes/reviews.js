import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { createReview, getReviews } from '../controllers/reviewsController.js';

const router = express.Router();

// GET /api/reviews?module=...&itemId=... (public - anyone can view reviews, untuk P4M reviewer)
router.get('/', getReviews);

// POST /api/reviews (requires auth)
router.post('/', authenticateToken, createReview);

export default router;
