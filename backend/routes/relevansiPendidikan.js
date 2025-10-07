import express from "express";
import {
  getRelevansiPendidikan,
  addRelevansiPendidikan,
  importRelevansiPendidikan,
  updateRelevansiPendidikan,
  deleteRelevansiPendidikan
} from "../controllers/relevansiPendidikanController.js";

const router = express.Router();

// GET data per jenis
router.get("/", getRelevansiPendidikan);

// POST tambah data baru
router.post("/", addRelevansiPendidikan);

// POST import dari Excel
router.post("/import", importRelevansiPendidikan);

// PUT update data
router.put("/:id", updateRelevansiPendidikan);

// DELETE hapus data
router.delete("/:id", deleteRelevansiPendidikan);

export default router;
