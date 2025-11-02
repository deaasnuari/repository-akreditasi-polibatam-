import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
const VALID_ROLES = ['tim-akreditasi', 'p4m', 'tu'];

// REGISTER
export const register = async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!VALID_ROLES.includes(role)) return res.status(400).json({ success: false, msg: 'Role tidak valid.' });

  try {
    const existing = await pool.query('SELECT * FROM users WHERE username=$1 OR email=$2', [username, email]);
    if (existing.rows.length > 0) return res.status(409).json({ success: false, msg: 'Username atau email sudah terdaftar.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await pool.query(
      'INSERT INTO users (username,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id, username, email, role',
      [username, email, hashedPassword, role]
    );

    const token = jwt.sign({ id: newUser.rows[0].id, username, role }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV==='production' });

    res.status(201).json({ success: true, msg: 'Registrasi berhasil.', user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error.' });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email=$1 AND role=$2', [email, role]);
    if (!userRes.rows.length) return res.status(401).json({ success: false, msg: 'Email atau role salah.' });

    const user = userRes.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ success: false, msg: 'Password salah.' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV==='production' });

    res.json({ success: true, msg: 'Login berhasil.', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error.' });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV==='production' });
  res.json({ success: true, msg: 'Logout berhasil.' });
};
