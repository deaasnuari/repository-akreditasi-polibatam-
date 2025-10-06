import express from "express";
import db from "../db.js";

const router = express.Router();

// 🔹 Ambil semua data
router.get("/", (req, res) => {
  const q = "SELECT * FROM relevansi_pendidikan ORDER BY id DESC";
  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

// 🔹 Tambah data baru
router.post("/", (req, res) => {
  const { kategori, tabel, tahun, data } = req.body;
  const q = "INSERT INTO relevansi_pendidikan (kategori, tabel_kode, tahun, data_json) VALUES (?, ?, ?, ?)";
  db.query(q, [kategori, tabel, tahun, JSON.stringify(data)], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ id: result.insertId, kategori, tabel, tahun, data });
  });
});

// 🔹 Update data
router.put("/:id", (req, res) => {
  const { kategori, tabel, tahun, data } = req.body;
  const q = "UPDATE relevansi_pendidikan SET kategori=?, tabel_kode=?, tahun=?, data_json=? WHERE id=?";
  db.query(q, [kategori, tabel, tahun, JSON.stringify(data), req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Data berhasil diperbarui" });
  });
});

// 🔹 Hapus data
router.delete("/:id", (req, res) => {
  const q = "DELETE FROM relevansi_pendidikan WHERE id=?";
  db.query(q, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Data berhasil dihapus" });
  });
});

export default router;
