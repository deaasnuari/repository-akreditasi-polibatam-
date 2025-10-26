import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, logout } from '../controllers/authController.js';

const router = express.Router();

// ===== RATE LIMITERS =====
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,
  message: {
    success: false,
    msg: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit'
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3,
  message: {
    success: false,
    msg: 'Terlalu banyak percobaan registrasi. Coba lagi dalam 1 jam'
  },
});

// ===== VALIDATION =====
const validateAuthInput = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      msg: 'Email dan password harus diisi'
    });
  }
  next();
};

const validateRegisterInput = (req, res, next) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      msg: 'Semua field harus diisi'
    });
  }
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

// ===== ROUTES =====
router.post('/register', registerLimiter, validateRegisterInput, register);
router.post('/login', loginLimiter, validateAuthInput, login);
router.post('/logout', logout);

export default router;
