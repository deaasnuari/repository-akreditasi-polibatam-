import prisma from "../prismaClient.js";
import multer from "multer";
import xlsx from "xlsx";

const upload = multer({ storage: multer.memoryStorage() });

/* =============================================
   NORMALIZATION & FILTER
============================================= */
function normalizeValue(value) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

function normalizeRow(row = {}) {
  const result = {};
  for (const key of Object.keys(row)) {
    result[key] = normalizeValue(row[key]);
  }
  return result;
}

// ==========================
// 🔹 GET data per subtab
// ==========================
export const getData = async (req, res) => {
  try {
    const { subtab, prodi: prodiQuery } = req.query;
    const { id: userId, role: userRole, prodi: userProdi } = req.user;

    let whereClause = { subtab };

    if (userRole === 'tim-akreditasi') {
      // Jika tim-akreditasi dan ada query prodi, filter berdasarkan prodi tsb
      if (prodiQuery) {
        whereClause.prodi = prodiQuery;
      }
      // Jika tidak ada query prodi, bisa lihat semua prodi
    } else {
      // Jika bukan tim-akreditasi, hanya bisa lihat data prodinya sendiri
      whereClause.prodi = userProdi;
    }

    const rows = await prisma.relevansi_pkm.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
      include: {
        user: { // Ambil info user (terutama nama lengkap dan prodi)
          select: {
            nama_lengkap: true,
            prodi: true
          }
        }
      }
    });

    // kembalikan field `data` saja plus id, nama_lengkap, dan prodi
    const data = rows.map(r => ({
      id: r.id,
      nama_user: r.user.nama_lengkap,
      prodi: r.user.prodi,
      ...r.data
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data", error: err.message });
  }
};

/* =============================================
   CREATE DATA
============================================= */
export const createData = async (req, res) => {
  try {
    const { subtab, ...body } = req.body;
    const { id: userId, prodi } = req.user; // Ambil user_id dan prodi dari token

    if (!prodi) {
      return res.status(400).json({ success: false, message: "Prodi pengguna tidak ditemukan. Pastikan akun Anda memiliki prodi." });
    }

    const cleanData = normalizeRow(body);

    const created = await prisma.relevansi_pkm.create({
      data: {
        subtab,
        user_id: userId,
        prodi: prodi, // Simpan prodi
        data: cleanData,
      },
    });

    res.json({ success: true, message: "Data berhasil ditambahkan", data: created });
  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menambahkan data", error: err.message });
  }
};



/* =============================================
   IMPORT EXCEL
============================================= */
export const importExcel = [
  upload.single("file"),
  async (req, res) => {
    try {
      const { subtab } = req.body;
      const { id: userId, prodi } = req.user; // Ambil user_id dan prodi dari token
      const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
      const isPreview = req.body.preview === 'true';

      if (!prodi) {
        return res.status(400).json({ success: false, message: "Prodi pengguna tidak ditemukan. Pastikan akun Anda memiliki prodi." });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

      if (isPreview) {
        // Handle preview: return headers, preview rows, and suggestions
        const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
        const previewRows = rows.slice(0, 5); // First 5 rows for preview
        const suggestions = {};

        const fields = subtabFields[subtab] || [];
        for (const header of headers) {
          const lowerHeader = header.toLowerCase().replace(/\s+/g, '');
          for (const field of fields) {
            const lowerKey = field.key.toLowerCase();
            const lowerLabel = field.label.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '');
            if (lowerHeader.includes(lowerKey) || lowerLabel.includes(lowerHeader) || lowerHeader === lowerKey) {
              suggestions[header] = field.key;
              break;
            }
          }
        }

        return res.json({
          success: true,
          headers,
          previewRows,
          suggestions,
        });
      }

      // Proceed with actual import
      let added = 0;
      let errors = [];

      for (let i = 0; i < rows.length; i++) {
        try {
          const raw = rows[i];
          const obj = {};
          for (const header of Object.keys(mapping)) {
            const dbField = mapping[header];
            if (dbField) obj[dbField] = raw[header];
          }

          const cleanData = normalizeRow(obj);

          await prisma.relevansi_pkm.create({
            data: {
              subtab,
              user_id: userId,
              prodi: prodi, // simpan prodi
              data: cleanData,
            },
          });
          added++;
        } catch (e) {
          errors.push({ row: i + 1, error: e.message });
        }
      }

      res.json({
        success: true,
        message: `Import selesai: ${added} berhasil, ${errors.length} gagal`,
        added,
        failed: errors.length,
        errors,
      });
    } catch (err) {
      console.error("IMPORT ERROR:", err);
      res.status(500).json({ success: false, message: "Gagal import", error: err.message });
    }
  },
];

/* =============================================
   UPDATE DATA
============================================= */
export const updateData = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role: userRole } = req.user;
    const cleanData = normalizeRow(req.body);

    // Cek kepemilikan data
    const record = await prisma.relevansi_pkm.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    if (record.user_id !== userId && userRole !== 'tim-akreditasi') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk mengubah data ini" });
    }

    const updated = await prisma.relevansi_pkm.update({
      where: { id },
      data: { data: cleanData },
    });

    res.json({ success: true, message: "Data berhasil diperbarui", data: updated });
  } catch (err) {
    console.error("PUT ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal memperbarui data", error: err.message });
  }
};

/* =============================================
   DELETE DATA
============================================= */
export const deleteData = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role: userRole } = req.user;

    // Cek kepemilikan data
    const record = await prisma.relevansi_pkm.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    if (record.user_id !== userId && userRole !== 'tim-akreditasi') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk menghapus data ini" });
    }

    const deleted = await prisma.relevansi_pkm.delete({
      where: { id },
    });

    res.json({ success: true, message: "Data berhasil dihapus", data: deleted });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus data", error: err.message });
  }
};


/* =============================================
   SUBTAB FIELDS DEFINITION
============================================= */
const subtabFields = {
  'sarana-prasarana': [
    { key: 'namaprasarana', label: 'Nama Prasarana' },
    { key: 'dayatampung', label: 'Daya Tampung' },
    { key: 'luasruang', label: 'Luas Ruang (m²)' },
    { key: 'miliksendiri', label: 'Milik Sendiri (M)/Sewa (W)' },
    { key: 'berlisensi', label: 'Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)' },
    { key: 'perangkat', label: 'Perangkat' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
  'pkm-hibah': [
    { key: 'no', label: 'No' },
    { key: 'namadtpr', label: 'Nama DTPR (Sebagai Ketua PkM)' },
    { key: 'judulpkm', label: 'Judul PkM' },
    { key: 'jumlahmahasiswa', label: 'Jumlah Mahasiswa yang Terlibat' },
    { key: 'jenishibah', label: 'Jenis Hibah PkM' },
    { key: 'sumberdana', label: 'Sumber Dana L/N/I' },
    { key: 'durasi', label: 'Durasi (tahun)' },
    { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp Juta)' },
    { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp Juta)' },
    { key: 'pendanaants', label: 'Pendanaan TS (Rp Juta)' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
  'kerjasama-pkm': [
    { key: 'no', label: 'No' },
    { key: 'judulkerjasama', label: 'Judul Kerjasama' },
    { key: 'mitrakerjasama', label: 'Mitra Kerjasama' },
    { key: 'sumber', label: 'Sumber L/N/I' },
    { key: 'durasi', label: 'Durasi (tahun)' },
    { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp Juta)' },
    { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp Juta)' },
    { key: 'pendanaants', label: 'Pendanaan TS (Rp Juta)' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
  'diseminasi-pkm': [
    { key: 'no', label: 'No' },
    { key: 'namadtpr', label: 'Nama DTPR' },
    { key: 'juduldiseminasi', label: 'Judul Diseminasi' },
    { key: 'jenisdiseminasi', label: 'Jenis Diseminasi' },
    { key: 'tahunts2', label: 'Tahun TS-2' },
    { key: 'tahunts1', label: 'Tahun TS-1' },
    { key: 'tahunts', label: 'Tahun TS' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
  'hki-pkm': [
    { key: 'no', label: 'No' },
    { key: 'judul', label: 'Judul' },
    { key: 'jenishki', label: 'Jenis HKI' },
    { key: 'namadtpr', label: 'Nama DTPR' },
    { key: 'tahunts2', label: 'Tahun Perolehan TS-2' },
    { key: 'tahunts1', label: 'Tahun Perolehan TS-1' },
    { key: 'tahunts', label: 'Tahun Perolehan TS' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
};




