import express from "express";
import {
  getRelevansiPendidikan,
  addRelevansiPendidikan,
  importRelevansiPendidikan,
} from "../controllers/relevansiPendidikanController.js";

const router = express.Router();

// GET data per jenis (keragaman-asal / kondisi-jumlah-mahasiswa)
router.get("/", getRelevansiPendidikan);

// POST tambah data baru
router.post("/", addRelevansiPendidikan);

// POST import dari Excel
router.post("/import", importRelevansiPendidikan);

export default router;
