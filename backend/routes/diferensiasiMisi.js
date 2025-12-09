import express from "express";
import multer from "multer";
import {
  getDiferensiasiMisi,
  addDiferensiasiMisi,
  updateDiferensiasiMisi,
  deleteDiferensiasiMisi,
  saveDraft,
  importExcelDiferensiasiMisi
} from "../controllers/diferensiasiMisiController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Semua route butuh autentikasi
router.use(authenticateToken);

router.get("/", getDiferensiasiMisi);
router.post("/", addDiferensiasiMisi);
router.put("/:id", updateDiferensiasiMisi);
router.delete("/:id", deleteDiferensiasiMisi);
router.post("/savedraft", authenticateToken, saveDraft);
router.post("/import", upload.single("file"), importExcelDiferensiasiMisi);

export default router;
