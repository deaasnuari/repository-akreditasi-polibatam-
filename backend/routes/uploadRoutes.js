import express from "express";
import multer from "multer";

const router = express.Router();

// konfigurasi multer -> simpan ke folder uploads/
const upload = multer({ dest: "uploads/" });

// POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path,
  });
});

export default router;
