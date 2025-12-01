import express from 'express';
import { login, logout, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Get current user (dari token)
router.get('/me', getCurrentUser);

export default router;
