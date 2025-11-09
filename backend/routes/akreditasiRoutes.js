// routes/akreditasiRoutes.js
import express from "express";
import {
  getStats,
  getItems,
  exportData,
  getBagian,
  getTemplates,
  uploadDocument,
  uploadMiddleware, 
} from "../controllers/akreditasiController.js";

const router = express.Router();

// === Routes ===
router.get("/stats", getStats);
router.get("/items", getItems);
router.get("/bagian", getBagian);
router.get("/templates", getTemplates);

router.post("/export", exportData);
router.post("/upload", uploadMiddleware, uploadDocument); 

export default router;
