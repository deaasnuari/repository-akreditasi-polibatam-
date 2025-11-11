import pool from '../db.js';
import multer from 'multer';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

// GET data per type
export const getData = async (req, res) => {
  const { type } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM budaya_mutu WHERE type=$1 ORDER BY id',
      [type]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data' });
  }
};

// POST data baru
export const createData = async (req, res) => {
  const { type, data } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO budaya_mutu(type, data) VALUES($1, $2) RETURNING *',
      [type, data]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan data' });
  }
};

// PUT update data
export const updateData = async (req, res) => {
  const { id } = req.params;
  const { type, data } = req.body;
  try {
    const result = await pool.query(
      'UPDATE budaya_mutu SET type=$1, data=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [type, data, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal update data' });
  }
};

// DELETE data
export const deleteData = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM budaya_mutu WHERE id=$1', [id]);
    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal hapus data' });
  }
};

// --- konfigurasi upload sementara ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
export const upload = multer({ storage });

// --- fungsi import Excel ---
export const importExcel = async (req, res) => {
  console.log("🔥 ROUTE importExcel terpanggil");
  const { type } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file diupload' });
  }

  try {
    const filePath = path.resolve(req.file.path);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const normalizedRows = sheet.map(row => ({
      namaKetua: row.__EMPTY || row['Nama Ketua'] || "",
      periode: row.__EMPTY_1 || row['Periode Jabatan'] || "",
      pendidikanTerakhir: row.__EMPTY_2 || row['Pendidikan Terakhir'] || "",
      jabatanFungsional: row.__EMPTY_3 || row['Jabatan Fungsional'] || "",
      tugasPokokDanFungsi: row.__EMPTY_4 || row['Tugas Pokok dan Fungsi'] || "",
      unitKerja: row["Tabel 1.A.1 - Pimpinan dan Tupoksi UPPS dan PS"] || row['Unit Kerja'] || ""
    }));

    const dataRows = normalizedRows.filter(
      row => row.namaKetua.toLowerCase() !== "nama ketua"
    );

    for (const row of dataRows) {
      await pool.query(
        'INSERT INTO budaya_mutu (type, data) VALUES ($1, $2)',
        [type, JSON.stringify(row)]
      );
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Data berhasil diimport (header dilewati)',
      count: dataRows.length
    });

  } catch (err) {
    console.error('IMPORT ERROR:', err);
    res.status(500).json({ success: false, message: 'Gagal import data' });
  }
};

// === STRUKTUR ORGANISASI FUNCTIONS ===

// Upload Struktur Organisasi
export const uploadStruktur = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file diunggah' });
  }

  try {
    const fileName = file.originalname;
    const filePath = file.path;
    const fileUrl = `/uploads/struktur/${file.filename}`;
    
    // Simpan ke database
    const result = await pool.query(
      'INSERT INTO struktur_files (nama_file, file_path) VALUES ($1, $2) RETURNING *',
      [fileName, filePath]
    );

    res.json({
      success: true,
      message: 'File berhasil diupload',
      fileUrl,
      fileName,
      fileId: result.rows[0].id
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, message: 'Gagal upload struktur organisasi' });
  }
};

// Get File Struktur Terbaru
export const getStruktur = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM struktur_files ORDER BY created_at DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return res.json({ success: true, file: null });
    }

    const file = result.rows[0];
    const fileUrl = `/uploads/struktur/${path.basename(file.file_path)}`;
    
    res.json({
      success: true,
      file: {
        id: file.id,
        fileName: file.nama_file,
        fileUrl,
        createdAt: file.created_at
      }
    });
  } catch (err) {
    console.error('Get Struktur Error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data struktur' });
  }
};

// Update/Replace File Struktur
export const updateStruktur = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file diunggah' });
  }

  try {
    // Ambil file lama
    const oldFile = await pool.query('SELECT * FROM struktur_files WHERE id=$1', [id]);
    
    if (oldFile.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
    }

    // Hapus file lama dari sistem
    if (fs.existsSync(oldFile.rows[0].file_path)) {
      fs.unlinkSync(oldFile.rows[0].file_path);
    }

    // Update database dengan file baru
    const fileName = file.originalname;
    const filePath = file.path;
    const fileUrl = `/uploads/struktur/${file.filename}`;

    await pool.query(
      'UPDATE struktur_files SET nama_file=$1, file_path=$2, created_at=NOW() WHERE id=$3',
      [fileName, filePath, id]
    );

    res.json({
      success: true,
      message: 'File berhasil diupdate',
      fileUrl,
      fileName,
      fileId: id
    });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ success: false, message: 'Gagal update file' });
  }
};

// Delete File Struktur
export const deleteStruktur = async (req, res) => {
  const { id } = req.params;

  try {
    const file = await pool.query('SELECT * FROM struktur_files WHERE id=$1', [id]);

    if (file.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
    }

    // Hapus file fisik
    if (fs.existsSync(file.rows[0].file_path)) {
      fs.unlinkSync(file.rows[0].file_path);
    }

    // Hapus dari database
    await pool.query('DELETE FROM struktur_files WHERE id=$1', [id]);

    res.json({ success: true, message: 'File berhasil dihapus' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus file' });
  }
};