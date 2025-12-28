import prisma from "../prismaClient.js";
import multer from "multer";
import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import { createOrUpdateBuktiPendukung } from '../controllers/buktiPendukungController.js';

const upload = multer({ storage: multer.memoryStorage() });

// ============================================================
// CRUD OPERATIONS: Budaya Mutu Data
// ============================================================
// Mengambil data budaya mutu berdasarkan type dan role
export const getData = async (req, res) => {
  const { type, prodi } = req.query;
  try {
      const user_id = req.user.id;
      const user_prodi = req.user.prodi;
      const user_role = req.user.role;

      let whereClause = { type };

      const normalizedRole = user_role ? user_role.trim().toLowerCase() : '';
      
      if (normalizedRole === 'tim akreditasi') {
        // Tim Akreditasi hanya bisa melihat data prodi mereka sendiri
        if (!user_prodi) {
          return res.status(403).json({ success: false, message: "Prodi pengguna tidak ditemukan." });
        }
        whereClause.prodi = user_prodi;
      } else if (normalizedRole === 'p4m') {
        // P4M bisa melihat semua data, bisa difilter dengan parameter prodi
        if (prodi) {
          whereClause.prodi = prodi;
        }
      } else {
        // Role lain filter berdasarkan user_id dan prodi mereka
        whereClause.user_id = user_id;
        if (!user_prodi) {
          return res.status(403).json({ success: false, message: "Prodi pengguna tidak ditemukan." });
        }
        whereClause.prodi = user_prodi;
      }
  
      const data = await prisma.budaya_mutu.findMany({
        where: whereClause,
        orderBy: { id: "asc" },
        select: {
          id: true,
          type: true,
          prodi: true,
          data: true,
          created_at: true,
          updated_at: true,
        },    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data" });
  }
};

// Mengambil daftar prodi yang berbeda
export const getDistinctProdi = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userProdi = req.user.prodi;

    let whereClause = {};
    const normalizedUserRole = userRole ? userRole.trim().toLowerCase() : '';

    if (normalizedUserRole !== 'tim akreditasi') {
      if (userProdi) {
        whereClause = { prodi: userProdi };
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const distinctProdi = await prisma.budaya_mutu.findMany({
      where: whereClause,
      distinct: ['prodi'],
      select: {
        prodi: true,
      },
    });

    const prodiOptions = distinctProdi.map(item => item.prodi).filter(Boolean);

    res.json({ success: true, data: prodiOptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil opsi prodi", error: err.message });
  }
};

// Membuat data budaya mutu baru
export const createData = async (req, res) => {
  const { type, data, prodi } = req.body;
  const user_id = req.user.id;
  const user_prodi = req.user.prodi;

  const final_prodi = prodi || user_prodi;

  if (!final_prodi) {
    return res.status(400).json({ success: false, message: "Prodi tidak ditemukan" });
  }

  console.log("CREATE DATA - Received:", { type, data, user_id, final_prodi });

  try {
    const cleanData = normalizeRow(data);
    console.log("CREATE DATA - Cleaned data:", cleanData);

    const created = await prisma.budaya_mutu.create({
      data: {
        user_id,
        type,
        prodi: final_prodi, // Include prodi here
        data: cleanData,
      },
    });

    console.log("CREATE DATA - Created successfully:", created);
    res.json({ success: true, data: created });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan data" });
  }
};

// Mengupdate data budaya mutu yang ada
export const updateData = async (req, res) => {
  const { id } = req.params;
  const { type, data, prodi } = req.body;

  try {
    const cleanData = normalizeRow(data);

    const updated = await prisma.budaya_mutu.update({
      where: { id: Number(id) },
      data: {
        type,
        prodi: prodi,
        data: cleanData,
        updated_at: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal update data" });
  }
};

// Menghapus data budaya mutu
export const deleteData = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.budaya_mutu.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "Data berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal hapus data" });
  }
};

// ============================================================
// CONFIGURATION: Subtab Fields Definition
// ============================================================
const subtabFields = {
  'tupoksi': [
    { key: 'unitKerja', label: 'Unit Kerja' },
    { key: 'namaKetua', label: 'Nama Ketua' },
    { key: 'periode', label: 'Periode' },
    { key: 'pendidikanTerakhir', label: 'Pendidikan Terakhir' },
    { key: 'jabatanFungsional', label: 'Jabatan Fungsional' },
    { key: 'tugasPokokDanFungsi', label: 'Tugas Pokok dan Fungsi' },
  ],
  'pendanaan': [
    { key: 'sumberPendanaan', label: 'Sumber Pendanaan' },
    { key: 'ts2', label: 'TS-2' },
    { key: 'ts1', label: 'TS-1' },
    { key: 'ts', label: 'TS' },
    { key: 'linkBukti', label: 'Link Bukti' },
  ],
  'penggunaan-dana': [
    { key: 'penggunaanDana', label: 'Penggunaan Dana' },
    { key: 'ts2', label: 'TS-2' },
    { key: 'ts1', label: 'TS-1' },
    { key: 'ts', label: 'TS' },
    { key: 'linkBukti', label: 'Link Bukti' },
  ],
  'ewmp': [
    { key: 'namaDTPR', label: 'Nama DTPR' },
    { key: 'psSendiri', label: 'PS Sendiri' },
    { key: 'psLainPTSendiri', label: 'PS Lain PT Sendiri' },
    { key: 'ptLain', label: 'PT Lain' },
    { key: 'sksPenelitian', label: 'SKS Penelitian' },
    { key: 'sksPengabdian', label: 'SKS Pengabdian' },
    { key: 'manajemenPTSendiri', label: 'Manajemen PT Sendiri' },
    { key: 'manajemenPTLain', label: 'Manajemen PT Lain' },
    { key: 'totalSKS', label: 'Total SKS' },
  ],
  'ktk': [
    { key: 'jenisTenagaKependidikan', label: 'Jenis Tenaga Kependidikan' },
    { key: 's3', label: 'S3' },
    { key: 's2', label: 'S2' },
    { key: 's1', label: 'S1' },
    { key: 'd4', label: 'D4' },
    { key: 'd3', label: 'D3' },
    { key: 'd2', label: 'D2' },
    { key: 'd1', label: 'D1' },
    { key: 'sma', label: 'SMA' },
    { key: 'unitKerja', label: 'Unit Kerja' },
  ],
  'spmi': [
    { key: 'unitSPMI', label: 'Unit SPMI' },
    { key: 'namaUnitSPMI', label: 'Nama Unit SPMI' },
    { key: 'dokumenSPMI', label: 'Dokumen SPMI' },
    { key: 'jumlahAuditorMutuInternal', label: 'Jumlah Auditor Mutu Internal' },
    { key: 'certified', label: 'Certified' },
    { key: 'nonCertified', label: 'Non Certified' },
    { key: 'frekuensiAudit', label: 'Frekuensi Audit' },
    { key: 'buktiCertifiedAuditor', label: 'Bukti Certified Auditor' },
    { key: 'laporanAudit', label: 'Laporan Audit' },
  ],
};

// ============================================================
// EXCEL IMPORT: Preview & Import Functions
// ============================================================
// Preview Excel sebelum import
export const previewExcel = [
  upload.single("file"),
  async (req, res) => {
    try {
      const type = req.params.type;

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "File tidak ditemukan" 
        });
      }

      // Parse Excel
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "File Excel kosong"
        });
      }

      // Get headers from first row
      const headers = Object.keys(rows[0]);
      
      // Generate suggestions based on field matching
      const suggestions = generateSuggestions(headers, type);

      console.log("PREVIEW - Headers:", headers);
      console.log("PREVIEW - Suggestions:", suggestions);

      res.json({
        success: true,
        headers,
        rows: rows.slice(0, 5), // Preview first 5 rows
        suggestions,
        totalRows: rows.length
      });

    } catch (err) {
      console.error("PREVIEW ERROR:", err);
      res.status(500).json({ 
        success: false, 
        message: "Gagal memproses file Excel",
        error: err.message 
      });
    }
  }
];

// Import data dari Excel ke database
export const importExcel = [
  upload.single("file"),
  async (req, res) => {
    try {
      const type = req.params.type;
      const user_id = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "File tidak ditemukan" 
        });
      }

      // Parse mapping from request body
      let mapping = {};
      if (req.body.mapping) {
        try {
          mapping = JSON.parse(req.body.mapping);
          console.log("IMPORT - Mapping received:", mapping);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Format mapping tidak valid"
          });
        }
      }

      
      // Parse Excel
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
      
      console.log('row: ', rows);
      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "File Excel kosong"
        });
      }

      console.log("IMPORT - Processing", rows.length, "rows");

      let added = 0;
      let errors = [];

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        try {
          const rawRow = rows[i];
          const mappedData = {};

          // Tentukan prodi untuk record ini
          let record_prodi = req.user.prodi; 
          if (mapping.prodi && rawRow.hasOwnProperty(mapping.prodi)) {
            record_prodi = rawRow[mapping.prodi];
          }

          if (!record_prodi) {
             errors.push({ 
              row: i + 1, 
              error: `Prodi tidak ditemukan untuk baris ini.` 
            });
            continue;
          }

          // Mapping kolom Excel ke field database
          Object.entries(mapping).forEach(([dbField, excelColumn]) => {
            if (dbField !== 'prodi' && excelColumn && rawRow.hasOwnProperty(excelColumn)) {
              mappedData[dbField] = rawRow[excelColumn];
            }
          });

          console.log(`IMPORT - Row ${i + 1} mapped:`, mappedData, `Prodi: ${record_prodi}`);

          // Validate required fields
          const fields = subtabFields[type] || [];
          const missingFields = fields
            .filter(field => !mappedData[field.key] || mappedData[field.key] === '')
            .map(field => field.label);
          
          console.log("missing: ", missingFields);

          if (missingFields.length > 0) {
            errors.push({ 
              row: i + 1, 
              error: `Field wajib kosong: ${missingFields.join(', ')}` 
            });
            continue;
          }

          const cleanData = normalizeRow(mappedData);

          await prisma.budaya_mutu.create({
            data: {
              user_id,
              type,
              prodi: record_prodi,
              data: cleanData,
            },
          });

          added++;
        } catch (e) {
          console.error(`IMPORT - Error on row ${i + 1}:`, e);
          errors.push({ 
            row: i + 1, 
            error: e.message 
          });
        }
      }

      console.log("IMPORT - Complete:", { added, failed: errors.length });

      res.json({
        success: true,
        message: `Import selesai: ${added} berhasil, ${errors.length} gagal`,
        added,
        failed: errors.length,
        errors: errors.slice(0, 10)
      });

    } catch (err) {
      console.error("IMPORT ERROR:", err);
      res.status(500).json({ 
        success: false, 
        message: "Gagal import data",
        error: err.message 
      });
    }
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
// Generate suggestions untuk mapping kolom Excel
function generateSuggestions(headers, type) {
  const suggestions = {};
  const fields = subtabFields[type] || [];

  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[()]/g, '')
      .replace(/-/g, '');

    for (const field of fields) {
      const normalizedKey = field.key.toLowerCase();
      const normalizedLabel = field.label.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[()]/g, '')
        .replace(/-/g, '');

      if (normalizedHeader === normalizedKey || normalizedHeader === normalizedLabel) {
        suggestions[field.key] = header;
        break;
      }

      if (normalizedHeader.includes(normalizedKey) || 
          normalizedLabel.includes(normalizedHeader)) {
        if (!suggestions[field.key]) {
          suggestions[field.key] = header;
        }
      }
    }
  });

  return suggestions;
}

// Normalisasi value untuk consistency
function normalizeValue(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === 'string') return value.trim();
  return value;
}

function normalizeRow(row = {}) {
  const result = {};
  for (const key of Object.keys(row)) {
    result[key] = normalizeValue(row[key]);
  }
  return result;
}

// ============================================================
// STRUKTUR ORGANISASI: File Management
// ============================================================
// Upload file struktur organisasi
export const uploadStruktur = async (req, res) => {
  const file = req.file;

  if (!file)
    return res.status(400).json({ success: false, message: "Tidak ada file diunggah" });

  try {
    const saved = await prisma.struktur_files.create({
      data: {
        nama_file: file.originalname,
        file_path: file.path,
      },
    });

    res.json({
      success: true,
      message: "File berhasil diupload",
      fileId: saved.id,
      fileName: file.originalname,
      fileUrl: `/uploads/struktur/${path.basename(file.path)}`,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal upload file" });
  }
};

// Mengambil file struktur organisasi terbaru
export const getStruktur = async (req, res) => {
  try {
    const file = await prisma.struktur_files.findFirst({
      orderBy: {
        created_at: "desc",
      },
    });

    if (!file) return res.json({ success: true, file: null });

    res.json({
      success: true,
      file: {
        id: file.id,
        fileName: file.nama_file,
        fileUrl: `/uploads/struktur/${path.basename(file.file_path)}`,
        createdAt: file.created_at,
      },
    });
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil file" });
  }
};

// Update file struktur organisasi
export const updateStruktur = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  try {
    const old = await prisma.struktur_files.findUnique({
      where: { id: Number(id) },
    });

    if (!old)
      return res.status(404).json({ success: false, message: "File tidak ditemukan" });

    if (fs.existsSync(old.file_path)) {
      fs.unlinkSync(old.file_path);
    }

    await prisma.struktur_files.update({
      where: { id: Number(id) },
      data: {
        nama_file: file.originalname,
        file_path: file.path,
        created_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: "File berhasil diupdate",
      fileName: file.originalname,
      fileUrl: `/uploads/struktur/${path.basename(file.path)}`,
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal update file" });
  }
};

// Hapus file struktur organisasi
export const deleteStruktur = async (req, res) => {
  const { id } = req.params;

  try {
    const file = await prisma.struktur_files.findUnique({
      where: { id: Number(id) },
    });

    if (!file)
      return res.status(404).json({ success: false, message: "File tidak ditemukan" });

    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    await prisma.struktur_files.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "File berhasil dihapus" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus file" });
  }
};

// ============================================================
// DRAFT MANAGEMENT
// ============================================================
// Menyimpan draft dengan referensi ke bukti pendukung
export const saveDraft = async (req, res) => {
  const { nama, path, status, type, currentData } = req.body;
  const user_id = req.user.id;
  const user_prodi = req.user.prodi;
  if (!nama || !path || !status || !type || !currentData) {
    return res.status(400).json({ success: false, message: "Nama, path, status, type, dan data tidak boleh kosong" });
  }
  if (!user_id || !user_prodi) {
    return res.status(401).json({ success: false, message: "User tidak terautentikasi atau prodi tidak ditemukan" });
  }

  try {
    console.log('💾 [SAVE DRAFT] Data yang akan disimpan:', {
      type,
      user_id,
      user_prodi,
      currentDataLength: currentData?.length,
      currentDataSample: currentData?.[0]
    });

    // NOTE: Data sudah tersimpan di budaya_mutu via CREATE/UPDATE endpoint
    // Save draft hanya membuat referensi di bukti_pendukung

    // Verifikasi data exists di budaya_mutu
    const existingDataCount = await prisma.budaya_mutu.count({
      where: {
        user_id: user_id,
        prodi: user_prodi,
        type: type,
      },
    });

    console.log(`✅ [SAVE DRAFT] Data exists di budaya_mutu: ${existingDataCount} rows`);

    // Buat/Update referensi di Bukti Pendukung
    const existingBukti = await prisma.buktiPendukung.findFirst({
      where: {
        userId: user_id,
        path: path,
      },
    });

    let buktiPendukungEntry;
    if (existingBukti) {
      buktiPendukungEntry = await prisma.buktiPendukung.update({
        where: { id: existingBukti.id },
        data: { status: status },
      });
    } else {
      buktiPendukungEntry = await prisma.buktiPendukung.create({
        data: {
          nama: nama,
          path: path,
          status: status,
          userId: user_id,
        },
      });
    }

    res.json({ 
      success: true, 
      message: "Draft Budaya Mutu berhasil disimpan - referensi Bukti Pendukung dibuat", 
      existingDataCount: existingDataCount,
      buktiPendukungReference: buktiPendukungEntry
    });

  } catch (err) {
    console.error("SAVE DRAFT BUDAYA MUTU ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan draft Budaya Mutu" });
  }
};