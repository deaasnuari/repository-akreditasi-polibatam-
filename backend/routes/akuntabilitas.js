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

const router = express.Router();

// === Konfigurasi Upload Excel (temporary) ===
const storageExcel = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const uploadExcel = multer({ storage: storageExcel });

// === CRUD ROUTES ===
router.get("/", getData);
router.post("/", createData);
router.put("/:id", updateData);
router.delete("/:id", deleteData);

// === IMPORT EXCEL ===
router.post("/import/:type", uploadExcel.single("file"), importExcel);

export default router;
