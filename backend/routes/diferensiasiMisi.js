import express from "express";
import {
  getDiferensiasiMisi,
  addDiferensiasiMisi,
  updateDiferensiasiMisi,
  deleteDiferensiasiMisi,
  saveDraft
} from "../controllers/diferensiasiMisiController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua route butuh autentikasi
router.use(authenticateToken);

router.get("/", getDiferensiasiMisi);
router.post("/", addDiferensiasiMisi);
router.put("/:id", updateDiferensiasiMisi);
router.delete("/:id", deleteDiferensiasiMisi);
router.post("/savedraft", authenticateToken, saveDraft);

export default router;
