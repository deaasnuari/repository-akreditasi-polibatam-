import express from "express";
import {
  getRelevansiPendidikan,
  getRelevansiPendidikanById,
  addRelevansiPendidikan,
  importRelevansiPendidikan,
  updateRelevansiPendidikan,
  deleteRelevansiPendidikan
} from "../controllers/relevansiPendidikanController.js";

const router = express.Router();

router.get("/", getRelevansiPendidikan);
router.get("/:id", getRelevansiPendidikanById);
router.post("/", addRelevansiPendidikan);
router.post("/import", importRelevansiPendidikan);
router.put("/:id", updateRelevansiPendidikan);
router.delete("/:id", deleteRelevansiPendidikan);

export default router;
