import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";


const router = express.Router();
const JWT_SECRET = "secret123"; // ganti di production

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body || {};

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Username, password, dan role wajib diisi" });
  }

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Username sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role]
    );

    res.status(201).json({ message: "User berhasil didaftarkan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.status(401).json({ message: "Username atau password salah" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Username atau password salah" });

    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login berhasil", token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

export default router;
