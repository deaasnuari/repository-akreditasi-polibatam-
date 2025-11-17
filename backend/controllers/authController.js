import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
const VALID_ROLES = ['tim-akreditasi', 'p4m', 'tu'];

// ===============================
// REGISTER
// ===============================
export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ success: false, msg: 'Role tidak valid.' });
  }

  try {
    // cek user
    const existing = await prisma.users.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existing) {
      return res.status(409).json({ success: false, msg: 'Username atau email sudah terdaftar.' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // create user
    const newUser = await prisma.users.create({
      data: { username, email, password: hashedPassword, role },
      select: { id: true, username: true, email: true, role: true }
    });

    // generate token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // set cookies
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.cookie('role', newUser.role, { httpOnly: false, sameSite: 'lax' });

    res.status(201).json({
      success: true,
      msg: 'Registrasi berhasil.',
      user: newUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error.' });
  }
};

// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // ambil user berdasarkan email dan role
    const user = await prisma.users.findFirst({
      where: { email, role }
    });

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Email atau role salah.' });
    }

    // cek password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, msg: 'Password salah.' });
    }

    // jwt token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // set cookie
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.cookie('role', user.role, { httpOnly: false, sameSite: 'lax' });

    res.json({
      success: true,
      msg: 'Login berhasil.',
      user
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
  res.json({ success: true, msg: 'Logout berhasil.' });
};
