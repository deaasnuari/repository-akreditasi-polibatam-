import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
const VALID_ROLES = ['TU', 'P4M', 'Tim Akreditasi'];

// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
  const { email, username, password } = req.body;

  // Debug: log login attempt (tidak mencetak password)
  console.log(`[auth] Login attempt - email: ${email || '-'}, username: ${username || '-'} at ${new Date().toISOString()}`);

  try {
    // cari user berdasarkan email dulu, jika tidak ada gunakan username sebagai fallback
    const whereClause = email ? { email, status: 'aktif' } : username ? { username, status: 'aktif' } : null;

    if (!whereClause) {
      return res.status(400).json({ success: false, msg: 'Email atau username harus disertakan.' });
    }

    const user = await prisma.users.findFirst({ where: whereClause });

    if (!user) {
      console.log('[auth] User not found or not aktif for:', { email, username });
      // Cek apakah user ada tapi tidak aktif
      const userExists = await prisma.users.findFirst({ 
        where: { [email ? 'email' : 'username']: email || username }
      });
      if (userExists && userExists.status !== 'aktif') {
        return res.status(401).json({ success: false, msg: 'Akun ini tidak aktif.' });
      }
      return res.status(401).json({ success: false, msg: 'Email/username atau status akun salah.' });
    }

    console.log('[auth] User found for login:', { id: user.id, email: user.email, username: user.username, role: user.role, status: user.status });

    // cek password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, msg: 'Password salah.' });
    }

    // jwt token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        nama_lengkap: user.nama_lengkap
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // set cookie
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.cookie('role', user.role, { httpOnly: false, sameSite: 'lax' });
    res.cookie('userId', user.id, { httpOnly: false, sameSite: 'lax' });

    res.json({
      success: true,
      msg: 'Login berhasil.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        status: user.status
      },
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error.' });
  }
};

// ===============================
// LOGOUT
// ===============================
export const logout = async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('role');
  res.clearCookie('userId');
  res.json({ success: true, msg: 'Logout berhasil.' });
};

// ===============================
// GET CURRENT USER (from token)
// ===============================
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, msg: 'Token tidak ditemukan.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        nama_lengkap: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, msg: 'User tidak ditemukan.' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, msg: 'Token tidak valid.' });
  }
};
