import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

const prisma = new PrismaClient();
const VALID_ROLES = ["TU", "P4M", "Tim Akreditasi"];

// ======================
// 🟦 GET ALL USERS
// ======================
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        username: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data pengguna" });
  }
};

// ======================
// 🟦 GET USER BY ID
// ======================
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        username: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data pengguna" });
  }
};

// ======================
// 🟩 CREATE USER
// ======================
export const createUser = async (req, res) => {
  const {
    nama_lengkap,
    email,
    username,
    password,
    role,
    status,
    currentPassword,
  } = req.body;

  // Validasi role
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Role harus salah satu dari: ${VALID_ROLES.join(", ")}`,
    });
  }

  // Validasi field wajib
  if (!nama_lengkap || !email || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "Nama lengkap, email, username, dan password wajib diisi",
    });
  }

  try {
    // determine requester id from token if present
    let requesterId = null;
    try {
      const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        requesterId = decoded.id;
      }
    } catch (e) {
      // ignore token errors; requesterId stays null
    }
    // Check if email/username already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email atau username sudah digunakan",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await prisma.users.create({
      data: {
        nama_lengkap,
        email,
        username,
        password: hashedPassword,
        role,
        status: status || "aktif",
      },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        username: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({ success: true, data: created, message: "Pengguna berhasil dibuat" });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan pengguna" });
  }
};

// ======================
// 🟧 UPDATE USER
// ======================
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    nama_lengkap,
    email,
    username,
    password,
    role,
    status,
  } = req.body;

  // include currentPassword if present (used when user changes their own password)
  const { currentPassword } = req.body;

  console.log('[manajemenAkun] updateUser payload:', {
    id,
    nama_lengkap: nama_lengkap ? '[REDACTED]' : undefined,
    email,
    username,
    role,
    status,
  });

  // Validasi role jika ada
  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Role harus salah satu dari: ${VALID_ROLES.join(", ")}`,
    });
  }

  try {
    // Check if email/username is being updated and if it's already taken
    if (email || username) {
      const existingUser = await prisma.users.findFirst({
        where: {
          AND: [
            { id: { not: Number(id) } },
            {
              OR: [
                email ? { email } : undefined,
                username ? { username } : undefined,
              ].filter(Boolean),
            },
          ],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email atau username sudah digunakan",
        });
      }
    }

    const updateData = {
      updated_at: new Date(),
    };

    // determine requester id from token if present (needed to verify currentPassword when changing own password)
    let requesterId = null;
    try {
      const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        requesterId = decoded.id;
      }
    } catch (e) {
      // ignore token errors; requesterId stays null
    }

    if (nama_lengkap) updateData.nama_lengkap = nama_lengkap;
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    // If user is changing their own password, require currentPassword verification
    if (password) {
      if (requesterId && Number(id) === Number(requesterId)) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Current password required to change your password.' });
        }
        // verify current password
        const existing = await prisma.users.findUnique({ where: { id: Number(id) }, select: { password: true } });
        if (!existing) {
          return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
        }
        const match = await bcrypt.compare(currentPassword, existing.password);
        if (!match) {
          return res.status(401).json({ success: false, message: 'Current password salah' });
        }
      }
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updated = await prisma.users.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        username: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({ success: true, data: updated, message: "Pengguna berhasil diupdate" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal update pengguna" });
  }
};

// ======================
// 🟥 DELETE USER
// ======================
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    await prisma.users.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus pengguna" });
  }
};

// ======================
// 🟦 GET BY ROLE
// ======================
export const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  try {
    const users = await prisma.users.findMany({
      where: { role },
      orderBy: { id: "asc" },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        username: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data pengguna" });
  }
};

// ======================
// 🟦 GET BY STATUS
// ======================
export const getUsersByStatus = async (req, res) => {
  const { status } = req.params;

  try {
    const users = await prisma.users.findMany({
      where: { status },
      orderBy: { id: "asc" },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        username: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data pengguna" });
  }
};
