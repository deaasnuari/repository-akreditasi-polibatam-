import express from 'express';
import { login, register, logout, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, (req, res) => {
  res.json({ success: true, data: req.user });
});
router.put('/profile', authenticateToken, updateProfile);

export default router;
