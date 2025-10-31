import express from "express";
const router = express.Router();

// contoh data dummy sementara
const kriteriaList = [
  { id: 1, nama: "Visi, Misi, Tujuan, dan Strategi" },
  { id: 2, nama: "Tata Pamong, Tata Kelola, dan Kerjasama" },
  { id: 3, nama: "Mahasiswa" },
];

// GET /api/matriks-penilaian/kriteria
router.get("/kriteria", (req, res) => {
  res.json(kriteriaList);
});

// GET /api/matriks-penilaian/skenario
router.get("/skenario", (req, res) => {
  res.json([
    {
      nama_skenario: "Skenario 1",
      created_at: "2025-10-31",
      jumlah_kriteria: 3,
      total_skor: 350,
    },
  ]);
});

export default router;
