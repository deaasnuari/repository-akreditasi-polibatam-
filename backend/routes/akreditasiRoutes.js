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
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// === Routes ===
router.get("/stats", getStats);
router.get("/items", authenticateToken, getItems);
router.get("/bagian", getBagian);
router.get("/templates", getTemplates);

router.post("/export", authenticateToken, exportData);
router.post("/upload", uploadMiddleware, uploadDocument); 

export default router;
