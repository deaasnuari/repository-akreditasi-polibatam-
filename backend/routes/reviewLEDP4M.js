import express from "express";
import {
  getAllReviewLED,
  addReviewLED,
  updateReviewLED,
  deleteReviewLED,
  importReviewLED
} from "../controllers/reviewLEDP4MController.js";

const router = express.Router();

router.get("/", getAllReviewLED);
router.post("/", addReviewLED);
router.put("/:id", updateReviewLED);
router.delete("/:id", deleteReviewLED);
router.post("/import", importReviewLED);

export default router;
