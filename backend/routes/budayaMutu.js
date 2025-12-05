import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getData,
  createData,
  updateData,
  deleteData,
  previewExcel, // NEW
  importExcel,
  getDistinctProdi, // Added this
  uploadStruktur,
  getStruktur,
  updateStruktur,
  deleteStruktur,
  saveDraft // NEW
} from "../controllers/budayaMutuController.js";

const router = express.Router();

// === Konfigurasi Upload Struktur ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/struktur";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadFile = multer({ storage });

// === ROUTES CRUD Utama ===
router.get("/", authenticateToken, getData);
router.post("/", authenticateToken, createData);
router.put("/:id", authenticateToken, updateData);
router.delete("/:id", authenticateToken, deleteData);

// === Draft Route ===
router.post("/draft", authenticateToken, saveDraft);

// === Prodi Options ===
router.get("/prodi-options", authenticateToken, getDistinctProdi); // New route

// === Import Excel Routes (UPDATED) ===
router.post("/preview/:type", authenticateToken, previewExcel);
router.post("/import/:type", authenticateToken, importExcel);

// === STRUKTUR ORGANISASI ROUTES ===
router.post("/upload-struktur", authenticateToken, uploadFile.single("file"), uploadStruktur);
router.get("/struktur", authenticateToken, getStruktur);
router.put("/struktur/:id", authenticateToken, uploadFile.single("file"), updateStruktur);
router.delete("/struktur/:id", authenticateToken, deleteStruktur);

export default router;