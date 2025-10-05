import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const router = express.Router();

// ========================
// 📂 Setup folder & file JSON
// ========================

// Gunakan __dirname agar path lebih stabil
const __dirname = path.resolve();

// Simpan data ke /backend/data/budayaMutu.json
const dataDir = path.join(__dirname, "backend", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dataFile = path.join(dataDir, "budayaMutu.json");

// Pastikan file JSON ada
if (!fs.existsSync(dataFile)) {
  console.log("📄 Membuat file budayaMutu.json baru di:", dataFile);
  fs.writeFileSync(dataFile, JSON.stringify([]), "utf8");
}

// Baca data JSON
const readData = () => {
  try {
    console.log("📂 Membaca file data dari:", dataFile);
    const raw = fs.readFileSync(dataFile, "utf8");
    const json = JSON.parse(raw || "[]");
    return Array.isArray(json) ? json : [];
  } catch (err) {
    console.error("❌ Gagal membaca JSON:", err);
    return [];
  }
};

// Tulis ulang file JSON
const writeData = (arr) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(arr, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Gagal menulis file JSON:", err);
  }
};

// ========================
// ⚙️ Multer (upload Excel)
// ========================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({
  dest: uploadDir + "/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ========================
// 🆔 Helper functions
// ========================
const genId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

// Normalisasi data agar aman
const normalizeRow = (row) => {
  const get = (variants) => {
    for (const v of variants) {
      if (row[v] !== undefined && row[v] !== null && String(row[v]).trim() !== "") {
        return String(row[v]);
      }
    }
    return "";
  };

  return {
    // TUPOKSI
    unitKerja: get(["UNIT KERJA", "Unit Kerja", "unitKerja"]),
    namaKetua: get(["NAMA KETUA", "Nama Ketua", "namaKetua"]),
    periode: get(["PERIODE JABATAN", "Periode Jabatan", "periode"]),
    pendidikan: get(["PENDIDIKAN TERAKHIR", "Pendidikan Terakhir", "pendidikan"]),
    jabatan: get(["JABATAN FUNGSIONAL", "Jabatan Fungsional", "jabatan"]),
    tupoksi: get(["TUPOKSI", "Tupoksi", "tupoksi"]),

    // PENDANAAN
    sumberDana: get(["SUMBER DANA", "Sumber Dana", "sumberDana"]),
    jumlah: get(["JUMLAH", "Jumlah", "jumlah"]),
    tahun: get(["TAHUN", "Tahun", "tahun"]),

    // PENGGUNAAN DANA ✅
    jenisKegiatan: get(["JENIS KEGIATAN", "Jenis Kegiatan", "jenisKegiatan"]),
    jumlahDana: get(["JUMLAH DANA", "Jumlah Dana", "jumlahDana"]),

    // SPMI (kalau nanti)
    namaDokumen: get(["NAMA DOKUMEN", "Nama Dokumen", "namaDokumen"]),
    nomorDokumen: get(["NOMOR DOKUMEN", "Nomor Dokumen", "nomorDokumen"]),
    tanggalBerlaku: get(["TANGGAL BERLAKU", "Tanggal Berlaku", "tanggalBerlaku"]),
  };
};


// ========================
// 📜 ROUTES
// ========================

// ✅ GET semua data (opsional filter type)
router.get("/", (req, res) => {
  try {
    const { type } = req.query; // contoh: /api/budaya-mutu?type=tupoksi
    const arr = readData();
    const filtered = type ? arr.filter((d) => d.type === type) : arr;
    res.json({ success: true, data: filtered });
  } catch (err) {
    console.error("❌ Gagal membaca data:", err);
    res.status(500).json({ success: false, message: "Gagal membaca data" });
  }
});

// ✅ POST tambah data
router.post("/", express.json(), (req, res) => {
  try {
    const existing = readData();
    const item = { id: genId(), ...normalizeRow(req.body), type: req.body.type || "tupoksi" };
    existing.push(item);
    writeData(existing);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error("❌ Gagal menyimpan data:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan data" });
  }
});

// ✅ PUT ubah data
router.put("/:id", express.json(), (req, res) => {
  try {
    const id = req.params.id;
    const arr = readData();
    const idx = arr.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    arr[idx] = { ...arr[idx], ...normalizeRow(req.body), type: req.body.type || arr[idx].type };
    writeData(arr);
    res.json({ success: true, data: arr[idx] });
  } catch (err) {
    console.error("❌ Gagal mengubah data:", err);
    res.status(500).json({ success: false, message: "Gagal mengubah data" });
  }
});

// ✅ DELETE hapus data
router.delete("/:id", (req, res) => {
  try {
    const id = req.params.id;
    const arr = readData();
    const filtered = arr.filter((r) => r.id !== id);
    writeData(filtered);
    res.json({ success: true, message: "Data dihapus" });
  } catch (err) {
    console.error("❌ Gagal menghapus data:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus data" });
  }
});

// ✅ IMPORT EXCEL per tipe
router.post("/import/:type", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "File tidak tersedia" });
    const { type } = req.params;

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    const arr = readData();
    const newItems = json.map((r) => ({
      id: genId(),
      ...normalizeRow(r),
      type,
    }));

    writeData(arr.concat(newItems));
    fs.unlinkSync(req.file.path);

    res.json({ success: true, message: `Import ${type} berhasil`, data: newItems });
  } catch (err) {
    console.error("❌ Gagal import file:", err);
    res.status(500).json({ success: false, message: "Gagal import file" });
  }
});

export default router;
