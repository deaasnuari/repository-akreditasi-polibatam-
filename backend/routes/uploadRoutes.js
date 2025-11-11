import express from "express";
import multer from "multer";

const router = express.Router();

// konfigurasi multer -> simpan ke folder uploads/
const upload = multer({ dest: "uploads/" });

// POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  res.json({
    success: true,
    message: "File uploaded successfully",
    filename: req.file.filename,
    originalname: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
  });
});

export default router;
