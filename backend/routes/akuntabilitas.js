import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  getData,
  createData,
  updateData,
  deleteData,
  importExcel
} from "../controllers/akuntabilitasController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// === Konfigurasi Upload Excel (temporary) ===
const storageExcel = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const uploadExcel = multer({ storage: storageExcel });

// === CRUD ROUTES ===
router.get("/", authenticateToken, getData);
router.post("/", authenticateToken, createData);
router.put("/:id", authenticateToken, updateData);
router.delete("/:id", authenticateToken, deleteData);

// === IMPORT EXCEL ===
router.post("/import/:type", authenticateToken, uploadExcel.single("file"), importExcel);

export default router;
