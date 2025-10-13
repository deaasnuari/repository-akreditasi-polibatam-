import express from "express";
import { getByType, createItem, deleteItem } from "../controllers/relevansiPkmController.js";

const router = express.Router();

// Ambil data PKM berdasarkan type (query ?type=)
router.get("/", getByType);

// Tambah data PKM
router.post("/:type", createItem);

// Hapus data PKM
router.delete("/:type/:id", deleteItem);

export default router;
