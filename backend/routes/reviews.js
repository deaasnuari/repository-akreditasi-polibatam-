import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { createReview, getReviews, deleteReview } from '../controllers/reviewsController.js';

const router = express.Router();

// GET /api/reviews?module=...&itemId=... (public - anyone can view reviews, untuk P4M reviewer)
router.get('/', getReviews);

// POST /api/reviews (requires auth)
router.post('/', authenticateToken, createReview);

// DELETE /api/reviews/:id (requires auth)
router.delete('/:id', authenticateToken, deleteReview);

export default router;
