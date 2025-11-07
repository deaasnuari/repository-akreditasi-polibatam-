import express from "express";
import {
  getRelevansiPendidikan,
  addRelevansiPendidikan,
  importRelevansiPendidikan,
  updateRelevansiPendidikan,
  deleteRelevansiPendidikan
} from "../controllers/relevansiPendidikanController.js";

const router = express.Router();

router.get("/", getRelevansiPendidikan);
router.post("/", addRelevansiPendidikan);
router.post("/import", importRelevansiPendidikan);
router.put("/:id", updateRelevansiPendidikan);
router.delete("/:id", deleteRelevansiPendidikan);

export default router;
