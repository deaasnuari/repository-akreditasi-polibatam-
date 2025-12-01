import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUsersByStatus,
} from "../controllers/manajemenAkunController.js";

const router = express.Router();

// === ROUTES CRUD Utama ===
router.get("/", getAllUsers);
router.get("/detail/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// === FILTER ROUTES ===
router.get("/role/:role", getUsersByRole);
router.get("/status/:status", getUsersByStatus);

export default router;
