import express from "express";
import {
  getKriteria,
  saveScore,
  getScoresByProdi,
  getSummaryByProdi,
  getProdiList,
} from "../controllers/matriksPenilaianController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/matriks-penilaian/kriteria
router.get("/kriteria", getKriteria);

// POST /api/matriks-penilaian/scores
router.post("/scores", authenticateToken, saveScore);

// GET /api/matriks-penilaian/scores/:prodiId
router.get("/scores/:prodiId", authenticateToken, getScoresByProdi);

// GET /api/matriks-penilaian/summary/:prodiId
router.get("/summary/:prodiId", authenticateToken, getSummaryByProdi);

// GET /api/matriks-penilaian/prodi
router.get("/prodi", getProdiList);

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
