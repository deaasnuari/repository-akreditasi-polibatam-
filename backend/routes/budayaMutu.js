import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getData,
  createData,
  updateData,
  deleteData,
  importExcel,
  uploadStruktur,
  getStruktur,
  updateStruktur,
  deleteStruktur
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

// === Konfigurasi Upload Excel (temporary) ===
const storageExcel = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const uploadExcel = multer({ storage: storageExcel });

// === ROUTES CRUD Utama ===
router.get("/", getData);
router.post("/", createData);
router.put("/:id", updateData);
router.delete("/:id", deleteData);

// === Import Excel ===
router.post("/import/:type", uploadExcel.single("file"), importExcel);

// === STRUKTUR ORGANISASI ROUTES ===
router.post("/upload-struktur", uploadFile.single("file"), uploadStruktur);
router.get("/struktur", getStruktur);
router.put("/struktur/:id", uploadFile.single("file"), updateStruktur);
router.delete("/struktur/:id", deleteStruktur);

export default router;