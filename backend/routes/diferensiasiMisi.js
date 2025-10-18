import express from "express";
import {
  getDiferensiasiMisi,
  addDiferensiasiMisi,
  updateDiferensiasiMisi,
  deleteDiferensiasiMisi,
} from "../controllers/diferensiasiMisiController.js";

const router = express.Router();

router.get('/', getDiferensiasiMisi); // ✅ penting: path '/'
router.post("/", addDiferensiasiMisi);
router.put("/:id", updateDiferensiasiMisi);
router.delete("/:id", deleteDiferensiasiMisi);

export default router;
