// controllers/akreditasiController.js
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simulasi data dummy
const bagianAkreditasi = [
  {
    id: 1,
    kode_bagian: "A1",
    nama_bagian: "Visi & Misi",
    deskripsi: "Menjelaskan visi dan misi institusi",
    tanggal_update: "2025-01-10",
    status: "Siap Export",
  },
  {
    id: 2,
    kode_bagian: "B1",
    nama_bagian: "Kurikulum",
    deskripsi: "Struktur kurikulum dan capaian pembelajaran",
    tanggal_update: "2025-02-05",
    status: "Belum Lengkap",
  },
];

const templates = [
  { id: 1, nama_template: "Template BAN-PT", jenis_template: "PDF" },
  { id: 2, nama_template: "Template Internal", jenis_template: "Excel" },
];

// ---------- GET /api/akreditasi/stats ----------
export const getStats = (req, res) => {
  const totalBagian = bagianAkreditasi.length;
  const siapExport = bagianAkreditasi.filter(b => b.status === "Siap Export").length;
  const belumLengkap = bagianAkreditasi.filter(b => b.status === "Belum Lengkap").length;
  const kelengkapan = Math.round((siapExport / totalBagian) * 100);

  res.json({
    totalBagian,
    siapExport,
    belumLengkap,
    kelengkapan,
  });
};

// ---------- GET /api/akreditasi/items ----------
export const getItems = (req, res) => {
  res.json(bagianAkreditasi);
};

// ---------- POST /api/akreditasi/export ----------
export const exportData = async (req, res) => {
  try {
    const { format, selectedIds } = req.body;

    // Filter data berdasarkan ID yang dipilih
    const selected = bagianAkreditasi.filter(b => selectedIds.includes(b.id));

    // Simulasi pembuatan file export
    const fileName = `akreditasi-export-${Date.now()}.${format.toLowerCase()}`;
    const filePath = path.join(__dirname, "../exports", fileName);

    // Buat folder exports kalau belum ada
    if (!fs.existsSync(path.join(__dirname, "../exports"))) {
      fs.mkdirSync(path.join(__dirname, "../exports"));
    }

    // Tulis data JSON ke file (simulasi export)
    fs.writeFileSync(filePath, JSON.stringify(selected, null, 2));

    // Kirim file sebagai response
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ message: "Gagal mengirim file" });
      }
      // Hapus file setelah dikirim
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Gagal export data" });
  }
};

// ---------- Upload Config ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `upload-${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ---------- POST /api/akreditasi/upload ----------
export const uploadMiddleware = upload.single("document");

export const uploadDocument = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diupload" });
  }
  res.json({
    message: "File berhasil diupload",
    file: req.file.filename,
  });
};

// ---------- GET /api/akreditasi/bagian ----------
export const getBagian = (req, res) => {
  res.json([
    {
      id: 1,
      kode_bagian: "A1",
      nama_bagian: "Visi & Misi",
      deskripsi: "Menjelaskan visi dan misi institusi",
      tanggal_update: "2025-01-10",
      status: "Siap Export",
    },
    {
      id: 2,
      kode_bagian: "B1",
      nama_bagian: "Kurikulum",
      deskripsi: "Struktur kurikulum dan capaian pembelajaran",
      tanggal_update: "2025-02-05",
      status: "Belum Lengkap",
    },
  ]);
};

// ---------- GET /api/akreditasi/templates ----------
export const getTemplates = (req, res) => {
  res.json([
    { id: 1, nama_template: "Template BAN-PT", jenis_template: "PDF" },
    { id: 2, nama_template: "Template Internal", jenis_template: "Excel" },
  ]);
};

