import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// ===== LOGIN =====
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email, role]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, msg: 'Email atau role salah' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ success: false, msg: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      success: true,
      msg: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: 'Server error' });

  }
};

// ===== REGISTER =====
export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // cek username/email sudah ada
    const checkUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ success: false, msg: 'Username atau email sudah ada' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *',
      [username, email, hashedPassword, role || 'user']
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username, role: newUser.rows[0].role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      success: true,
      msg: 'User berhasil dibuat',
      token,
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: 'Server error' });

  }
};
