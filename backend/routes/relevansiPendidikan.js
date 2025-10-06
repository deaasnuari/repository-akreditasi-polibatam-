import express from "express";
import {
  getAllRelevansi,
  addRelevansi,
  updateRelevansi,
  deleteRelevansi,
} from "../controllers/relevansiPendidikanController.js";

const router = express.Router();

router.get("/", getAllRelevansi);
router.post("/", addRelevansi);
router.put("/:id", updateRelevansi);
router.delete("/:id", deleteRelevansi);

export default router;
