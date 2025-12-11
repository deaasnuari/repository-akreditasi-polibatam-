import express from "express";
import multer from "multer";

import {
  getData,
  createData,
  updateData,
  deleteData,
  importExcel,
  getDistinctProdi, // Added this
  saveDraft // Add this line
} from "../controllers/akuntabilitasController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// === Konfigurasi Upload Excel (memory storage for better compatibility) ===
const storageExcel = multer.memoryStorage();
const uploadExcel = multer({ storage: storageExcel });

// === CRUD ROUTES ===
router.get("/", authenticateToken, getData);
router.post("/", authenticateToken, createData);
router.put("/:id", authenticateToken, updateData);
router.delete("/:id", authenticateToken, deleteData);

// === Prodi Options ===
router.get("/prodi-options", authenticateToken, getDistinctProdi); // New route

// === IMPORT EXCEL ===
router.post("/import/:type", authenticateToken, uploadExcel.single("file"), importExcel);

// === SAVE DRAFT ===
router.post("/savedraft", authenticateToken, saveDraft);

export default router;
