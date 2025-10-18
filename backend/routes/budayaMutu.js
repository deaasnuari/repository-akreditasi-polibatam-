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

  // ✅ SUBMIT DATA (dari tombol Submit di frontend)
router.post("/submit/:type", (req, res) => {
  try {
    const { type } = req.params;
    const arr = readData();

    // ubah semua data dengan type tertentu jadi status "submitted"
    const updated = arr.map((item) =>
      item.type === type
        ? { ...item, status: "submitted", submittedAt: new Date().toISOString() }
        : item
    );

    writeData(updated);

    res.json({
      success: true,
      message: `Data ${type} berhasil dikirim untuk verifikasi.`,
      data: updated.filter((d) => d.type === type),
    });
  } catch (err) {
    console.error("❌ Gagal submit data:", err);
    res.status(500).json({
      success: false,
      message: "Gagal submit data",
    });
  }
});


  return {
    // TUPOKSI
    unitKerja: get(["UNIT KERJA", "Unit Kerja", "unitKerja"]),
    namaKetua: get(["NAMA KETUA", "Nama Ketua", "namaKetua"]),
    periode: get(["PERIODE JABATAN", "Periode Jabatan", "periode"]),
    pendidikanTerakhir: get(["PENDIDIKAN TERAKHIR", "Pendidikan Terakhir", "pendidikanTerakhir"]),
    jabatanFungsional: get(["JABATAN FUNGSIONAL", "Jabatan Fungsional", "jabatanFungsional"]),
    tugasPokokDanFungsi: get(["TUPOKSI", "Tupoksi", "tugasPokokDanFungsi"]),



    // PENDANAAN
    sumberPendanaan: get(["SUMBER PENDANAAN", "Sumber Pendanaan", "sumberPendanaan"]),
    ts2: get(["TS-2", "Ts2", "ts2"]),
    ts1: get(["TS-1", "Ts1", "ts1"]),
    ts: get(["TS", "Ts", "ts"]),
    linkBukti: get(["LINK BUKTI", "Link Bukti", "linkBukti"]),

    // PENGGUNAAN DANA ✅
    penggunaanDana: get(["PENGGUNAAN DANA", "PenggunaanDana", "penggunaan-dana"]),
    ts2: get(["TS-2", "Ts2", "ts2"]),
    ts1: get(["TS-1", "Ts1", "ts1"]),
    ts: get(["TS", "Ts", "ts"]),
    linkBukti: get(["LINK BUKTI", "Link Bukti", "linkBukti"]),

    // EWMP
    no: get(["NO", "No", "no"]),
    namaDTPR: get(["NAMA DTPR", "Nama DTPR", "namaDTPR"]),
    psSendiri: get(["PS SENDIRI", "Ps Sendiri", "psSendiri"]),
    psLainPTSendiri: get(["PS LAIN PT SENDIRI", "Ps Lain PT Sendiri", "psLainPTSendiri"]),
    ptLain: get(["PT LAIN", "Pt Lain", "ptLain"]),
    sksPenelitian: get(["SKS PENELITIAN", "Sks Penelitian", "sksPenelitian"]),
    sksPengabdian: get(["SKS PENGABDIAN", "Sks Pengabdian", "sksPengabdian"]),
    manajemenPTSendiri: get(["MANAJEMEN PT SENDIRI", "Manajemen PT Sendiri", "manajemenPTSendiri"]),
    manajemenPTLain: get(["MANAJEMEN PT LAIN", "Manajemen PT Lain", "manajemenPTLain"]),
    totalSKS: get(["TOTAL SKS", "Total SKS", "totalSKS"]),

    //KTK
    no: get(["NO", "No", "no"]),
    jenisTenagaKependidikan: get(["JENIS TENAGA KEPENDIDIKAN", "Jenis Tenaga Kependidikan", "jenisTenagaKependidikan"]),
    s3: get(["S3", "S3", "s3"]),
    s2: get(["S2", "S2", "s2"]),
    s1: get(["S1", "S1", "s1"]),
    d4: get(["D4", "D4", "d4"]),
    d3: get(["D3", "D3", "d3"]),
    d2: get(["D2", "D2", "d2"]),
    d1: get(["D1", "D1", "d1"]),
    sma: get(["SMA", "Sma", "sma"]),
    unitKerja: get(["UNIT KERJA", "Unit Kerja", "unitKerja"]),

    // SPMI 
    unitSPMI: get(["UNIT SPMI", "Unit SPMI", "unitSPMI"]),
    namaUnitSPMI: get(["NAMA UNIT SPMI", "Nama Unit SPMI", "namaUnitSPMI"]),
    dokumenSPMI: get(["DOKUMEN SPMI", "Dokumen SPMI", "dokumenSPMI"]),
    jumlahAuditorMutuInternal: get(["JUMLAH AUDITOR MUTU INTERNAL", "Jumlah Auditor Mutu Internal", "jumlahAuditorMutuInternal"]),
    certified: get(["CERTIFIED", "Certified", "certified"]),
    nonCertified: get(["NON CERTIFIED", "Non Certified", "nonCertified"]),
    frekuensiAudit: get(["FREKUENSI AUDIT", "Frekuensi Audit", "frekuensiAudit"]),
    buktiCertifiedAuditor: get(["BUKTI CERTIFIED AUDITOR", "Bukti Certified Auditor", "buktiCertifiedAuditor"]),
    laporanAudit: get(["LAPORAN AUDIT", "Laporan Audit", "laporanAudit"]),
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
