import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
const VALID_ROLES = ['tim-akreditasi', 'p4m', 'tu'];

// ===== LOGIN =====
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, msg: 'Email, password, dan role harus diisi' });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ success: false, msg: 'Role tidak valid' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, role]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, msg: 'Email atau role salah' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, msg: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      msg: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, msg: 'Terjadi kesalahan server' });
  }
};

// ===== REGISTER =====
export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ success: false, msg: 'Semua field harus diisi' });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ success: false, msg: 'Role tidak valid' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, msg: 'Password minimal 6 karakter' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, msg: 'Format email tidak valid' });
  }

  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (checkUser.rows.length > 0) {
      const existing = checkUser.rows[0];
      if (existing.username === username) {
        return res.status(409).json({ success: false, msg: 'Username sudah terdaftar' });
      }
      if (existing.email === email) {
        return res.status(409).json({ success: false, msg: 'Email sudah terdaftar' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, role]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username, role: newUser.rows[0].role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      msg: 'Registrasi berhasil',
      token,
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, msg: 'Terjadi kesalahan server' });
  }
};

// ===== LOGOUT =====
export const logout = async (req, res) => {
  try {
    // JWT bersifat stateless, jadi kita hanya informasikan ke frontend untuk hapus token
    return res.json({
      success: true,
      msg: 'Logout berhasil, token dihapus di sisi klien'
    });
  } catch (err) {
    console.error('Logout error:', err.message);
    return res.status(500).json({ success: false, msg: 'Gagal logout' });
  }
};
