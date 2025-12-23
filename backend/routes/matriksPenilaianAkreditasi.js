import express from "express";
import {
  getKriteria,
  saveScore,
  getScoresByProdi,
  getSummaryByProdi,
  getProdiList,
  exportToExcel,
} from "../controllers/matriksPenilaianController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/matriks-penilaian/kriteria
router.get("/kriteria", getKriteria);

// POST /api/matriks-penilaian/scores
router.post("/scores", authenticateToken, saveScore);

// GET /api/matriks-penilaian/scores/:prodiId
router.get("/scores/:prodiName", authenticateToken, getScoresByProdi);

// GET /api/matriks-penilaian/summary/:prodiId
router.get("/summary/:prodiId", authenticateToken, getSummaryByProdi);

// GET /api/matriks-penilaian/prodi
router.get("/prodi", getProdiList);

router.get("/export-excel", authenticateToken, exportToExcel);

export default router;
