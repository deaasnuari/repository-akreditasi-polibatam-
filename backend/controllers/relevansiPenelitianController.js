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

/* =============================================
   GET DATA
============================================= */
export const getData = async (req, res) => {
  try {
    const { subtab, prodi: prodiQuery } = req.query;
    const { id: userId, role: userRole, prodi: userProdi } = req.user;

    console.log('DEBUG: getData - req.query', req.query); // Added for debugging
    console.log('DEBUG: getData - req.user', req.user);   // Added for debugging

    let whereClause = { subtab };

    const normalizedRole = userRole ? userRole.trim().toLowerCase().replace(/\s+/g, '-') : '';
    if (normalizedRole === 'tim-akreditasi') {
      // Tim Akreditasi can ONLY view data for their own prodi
      if (!userProdi) {
        return res.status(403).json({ success: false, message: "Prodi pengguna tidak ditemukan." });
      }
      whereClause.prodi = userProdi;
    } else if (normalizedRole === 'p4m') {
      // P4M can view all data, but can also filter by prodi if 'prodi' query param is provided
      if (prodiQuery) {
        whereClause.prodi = prodiQuery;
      }
    } else {
      // Other roles always filter by their prodi
      if (!userProdi) {
        return res.status(403).json({ success: false, message: "Prodi pengguna tidak ditemukan." });
      }
      whereClause.prodi = userProdi;
    }

    console.log('DEBUG: Constructed whereClause', whereClause); // Added for debugging

    const rows = await prisma.relevansi_penelitian.findMany({
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

    const created = await prisma.relevansi_penelitian.create({
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
   UPDATE DATA
============================================= */
export const updateData = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role: userRole } = req.user;
    const cleanData = normalizeRow(req.body);

    // Cek kepemilikan data
    const record = await prisma.relevansi_penelitian.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    // Hanya pemilik data atau tim-akreditasi yang bisa edit
    if (record.user_id !== userId && userRole !== 'tim-akreditasi') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk mengubah data ini" });
    }

    const updated = await prisma.relevansi_penelitian.update({
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
    const record = await prisma.relevansi_penelitian.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    // Hanya pemilik data atau tim-akreditasi yang bisa hapus
    if (record.user_id !== userId && userRole !== 'tim-akreditasi') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk menghapus data ini" });
    }

    const deleted = await prisma.relevansi_penelitian.delete({
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
    { key: 'namaPrasarana', label: 'Nama Prasarana' },
    { key: 'dayaTampung', label: 'Daya Tampung' },
    { key: 'luasRuang', label: 'Luas Ruang (m²)' },
    { key: 'status', label: 'Milik sendiri (M)/Sewa (W)' },
    { key: 'lisensi', label: 'Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)' },
    { key: 'perangkat', label: 'Perangkat' },
    { key: 'linkBukti', label: 'Link Bukti' },
  ],
  'hibah-dan-pembiayaan': [
    { key: 'no', label: 'No' },
    { key: 'namadtpr', label: 'Nama DTPR (Ketua)' },
    { key: 'judulpenelitian', label: 'Judul Penelitian' },
    { key: 'jumlahmahasiswa', label: 'Jumlah Mahasiswa yang Terlibat' },
    { key: 'jenishibah', label: 'Jenis Hibah Penelitian' },
    { key: 'sumber', label: 'Sumber L/N/I' },
    { key: 'durasi', label: 'Durasi (tahun)' },
    { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp juta)' },
    { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp juta)' },
    { key: 'pendanaants', label: 'Pendanaan TS (Rp juta)' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
  'pengembangan-dtpr': [
    { key: 'namaDTPR', label: 'Nama DTPR' },
    { key: 'jenisPengembangan', label: 'Jenis Pengembangan DTPR' },
    { key: 'tahunAkademik', label: 'Tahun Akademik' },
    { key: 'linkBukti', label: 'Link Bukti' },
  ],
  'kerjasama-penelitian': [
    { key: 'no', label: 'No' },
    { key: 'judulkerjasama', label: 'Judul Kerjasama' },
    { key: 'mitrakerjasama', label: 'Mitra Kerja Sama' },
    { key: 'sumber', label: 'Sumber L/N/I' },
    { key: 'durasi', label: 'Durasi (Tahun)' },
    { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp Juta)' },
    { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp Juta)' },
    { key: 'pendanaants', label: 'Pendanaan TS (Rp Juta)' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
  'publikasi-penelitian': [
    { key: 'no', label: 'No' },
    { key: 'namaDTPR', label: 'Nama DTPR' },
    { key: 'judulPublikasi', label: 'Judul Publikasi' },
    { key: 'jenisPublikasi', label: 'Jenis Publikasi (IB/I/S1,S2,S3,S4,T)' },
    { key: 'tahun', label: 'Tahun' },
    { key: 'linkBukti', label: 'Link Bukti' },
  ],
  'perolehan-hki': [
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

          await prisma.relevansi_penelitian.create({
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
