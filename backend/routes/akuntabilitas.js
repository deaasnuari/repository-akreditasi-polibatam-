import express from "express";
import { getData, createData, updateData, deleteData } from "../controllers/akuntabilitasController.js";

const router = express.Router();

router.get("/", getData);
router.post("/", createData);
router.put("/:id", updateData);
router.delete("/:id", deleteData);

export default router;
