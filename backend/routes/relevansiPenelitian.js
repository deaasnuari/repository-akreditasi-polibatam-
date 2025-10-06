import express from "express";
import multer from "multer";
import xlsx from "xlsx";
const router = express.Router();

// multer: keep file in memory
const upload = multer({ storage: multer.memoryStorage() });

// ==========================
// Dummy data per subtab
// ==========================
const dummyData = {
  "sarana-prasarana": [
    {
      id: 1,
      namaPrasarana: "Laboratorium Komputer",
      dayaTampung: "30 Mahasiswa",
      luasRuang: "50",
      status: "M",
      lisensi: "L",
      perangkat: "Server, Router, Switch, PC",
      linkBukti: "https://contoh-link.com",
    },
  ],
  "hibah-dan-pembiayaan": [
    {
      id: 1,
      namaDTPR: "Dr. Budi Santoso",
      judulPenelitian: "Penerapan IoT di Sistem Pertanian",
      jumlahMahasiswaTerlibat: 4,
      jenisHibah: "Internal",
      sumber: "Universitas",
      durasi: 1,
      pendanaan: 25,
      tahun: "2024",
    },
  ],
  "pengembangan-dtpr": [
    {
      id: 1,
      namaDTPR: "Dr. Rina Sari",
      jenisPengembangan: "Workshop Internasional",
      tahunAkademik: "2023/2024",
      linkBukti: "https://bukti.com/rina",
    },
  ],
  "kerjasama-penelitian": [
    {
      id: 1,
      judulKerjasama: "Riset Bersama Kominfo",
      mitra: "Kementerian Kominfo",
      sumber: "Nasional",
      durasi: 2,
      pendanaan: 50,
      tahun: "2023",
      linkBukti: "https://bukti.com/kerjasama",
    },
  ],
  "publikasi-penelitian": [
    {
      id: 1,
      namaDTPR: "Dr. Andi Wibowo",
      judulPublikasi: "Sistem AI untuk Deteksi Emosi",
      jenisPublikasi: "Sinta 2",
      tahun: "2024",
      linkBukti: "https://doi.org/10.1234/aiemotion",
    },
  ],
  "perolehan-hki": [
    {
      id: 1,
      judul: "Sistem Deteksi Dini Banjir",
      jenisHKI: "Paten",
      namaDTPR: "Dr. Wulan Arifin",
      tahun: "2024",
      linkBukti: "https://bukti.com/hki",
    },
  ],
};

// ==========================
// GET — Ambil data per subtab
// ==========================
router.get("/", (req, res) => {
  const type = req.query.type;
  const data = dummyData[type] || [];
  res.json({ success: true, data });
});

// ==========================
// POST — Tambah data dummy
// ==========================
router.post("/", (req, res) => {
  const { type, ...newData } = req.body;
  if (!type || !dummyData[type]) {
    return res.status(400).json({ success: false, message: "Tipe data tidak valid" });
  }
  const id = dummyData[type].length + 1;
  dummyData[type].push({ id, ...newData });
  res.json({ success: true, message: "✅ Data berhasil ditambahkan", data: newData });
});

// ==========================
// POST /import — Import Excel (multipart/form-data)
// Field: file (xlsx), type (subtab key)
// ==========================
router.post('/import', upload.single('file'), (req, res) => {
  try {
    const type = req.body.type;
    if (!type || !dummyData[type]) {
      return res.status(400).json({ success: false, message: 'Tipe data tidak valid' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    // If preview flag is present, suggest mapping and return preview rows
    if (req.body.preview === 'true' || req.query.preview === 'true') {
      const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

      // simple suggestions: normalize header and match to known keys
      const suggestions = {};
      // build known keys and labels from our dummyData schema per type
      const known = new Set();
      // guess common keys from existing data
      (dummyData[type] || []).forEach((item) => Object.keys(item).forEach((k) => known.add(k)));

      headers.forEach((h) => {
        const norm = String(h).toLowerCase().replace(/[^a-z0-9]/g, '');
        let found = '';
        // try match by simple heuristics
        for (const k of Array.from(known)) {
          const kn = String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
          if (kn === norm || kn.includes(norm) || norm.includes(kn) || kn.endsWith(norm) || norm.endsWith(kn)) {
            found = k;
            break;
          }
        }
        suggestions[h] = found || '';
      });

      return res.json({ success: true, previewRows: rows.slice(0, 10), headers: rows.length > 0 ? Object.keys(rows[0]) : [], suggestions });
    }

    // Otherwise perform actual import — allow optional mapping JSON
    let mapping = {};
    try {
      if (req.body.mapping) mapping = JSON.parse(req.body.mapping);
    } catch (e) {
      // ignore invalid mapping
      mapping = {};
    }

    let added = 0;
    rows.forEach((r) => {
      const mapped = {};
      if (Object.keys(mapping).length > 0) {
        // mapping: excelHeader -> internalKey
        for (const [h, key] of Object.entries(mapping)) {
          mapped[key] = r[h] ?? '';
        }
      } else {
        // no mapping provided: push as-is
        Object.assign(mapped, r);
      }
      const id = dummyData[type].length + 1;
      dummyData[type].push({ id, ...mapped });
      added += 1;
    });

    res.json({ success: true, message: `Imported ${added} rows`, added });
  } catch (err) {
    console.error('Import error', err);
    res.status(500).json({ success: false, message: 'Gagal mengimpor file' });
  }
});

// ==========================
// DELETE — Hapus data dummy
// ==========================
// Delete by type + id: ensures we only delete within the subtab
router.delete('/:type/:id', (req, res) => {
  const type = req.params.type;
  const id = parseInt(req.params.id);
  if (!type || !dummyData[type]) {
    return res.status(400).json({ success: false, message: 'Tipe data tidak valid' });
  }
  const before = dummyData[type].length;
  dummyData[type] = dummyData[type].filter((item) => item.id !== id);
  const after = dummyData[type].length;
  if (before === after) {
    return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
  }
  res.json({ success: true, message: '🗑️ Data berhasil dihapus (dummy)', id });
});

// ==========================
// PUT — Update data dummy
// ==========================
router.put('/:type/:id', (req, res) => {
  const type = req.params.type;
  const id = parseInt(req.params.id);
  if (!type || !dummyData[type]) {
    return res.status(400).json({ success: false, message: 'Tipe data tidak valid' });
  }
  const idx = dummyData[type].findIndex((item) => item.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
  const updated = { ...dummyData[type][idx], ...req.body };
  // ensure id stays the same
  updated.id = id;
  dummyData[type][idx] = updated;
  res.json({ success: true, message: '✅ Data berhasil diperbarui', data: updated });
});

export default router;

// router-level fallback for unmatched methods/paths (helps debugging)
// Fallback: handle any unmatched requests on this router without using path patterns
router.use((req, res) => {
  console.warn('[relevansiPenelitian] Unmatched route:', req.method, req.originalUrl);
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});
