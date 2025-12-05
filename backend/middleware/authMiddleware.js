import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../prismaClient.js'; // Impor prisma client

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const authenticateToken = async (req, res, next) => { // Jadikan async
  let token = req.cookies.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, msg: 'Unauthorized: Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Ambil data user terbaru dari database
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        nama_lengkap: true,
        prodi: true,
        role: true,
        status: true
      }
    });

    // Jika user tidak ditemukan di DB (misal: sudah dihapus)
    if (!user || user.status !== 'aktif') {
      return res.status(401).json({ success: false, msg: 'Unauthorized: Pengguna tidak valid atau tidak aktif' });
    }

    req.user = user; // Set req.user dengan data lengkap dari DB
    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: 'Token invalid' });
  }
};
