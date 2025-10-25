import pool from '../db.js';
import xlsx from 'xlsx';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// GET data per subtab
export const getData = async (req, res) => {
  try {
    const subtab = req.query.subtab; // ganti type -> subtab
    const result = await pool.query(
      'SELECT * FROM relevansi_penelitian WHERE subtab = $1 ORDER BY id ASC',
      [subtab]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data', error: err.message });
  }
};

// POST — tambah data baru
export const createData = async (req, res) => {
  try {
    const { subtab, ...data } = req.body; // ganti type -> subtab
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 2}`).join(', ');
    const query = `INSERT INTO relevansi_penelitian (subtab, ${columns}) VALUES ($1, ${placeholders}) RETURNING *`;

    const result = await pool.query(query, [subtab, ...values]);
    res.json({ success: true, message: '✅ Data berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data', error: err.message });
  }
};

// PUT — update data
export const updateData = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(data);

    const query = `UPDATE relevansi_penelitian SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    res.json({ success: true, message: '✅ Data berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    console.error('PUT error:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data', error: err.message });
  }
};

// DELETE — hapus data
export const deleteData = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query('DELETE FROM relevansi_penelitian WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    res.json({ success: true, message: '🗑️ Data berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus data', error: err.message });
  }
};

// POST /import — import Excel
export const importExcel = [
  upload.single('file'),
  async (req, res) => {
    try {
      const subtab = req.body.subtab; // ganti type -> subtab
      if (!req.file)
        return res.status(400).json({ success: false, message: 'File tidak ditemukan' });

      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

      if (req.body.preview === 'true') {
        return res.json({
          success: true,
          previewRows: rows.slice(0, 10),
          headers: rows.length > 0 ? Object.keys(rows[0]) : [],
          suggestions: {}
        });
      }

      const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
      let added = 0;

      for (const r of rows) {
        const mappedRow = {};
        Object.keys(mapping).forEach(h => {
          if (mapping[h]) mappedRow[mapping[h]] = r[h] ?? '';
        });

        const columns = Object.keys(mappedRow).join(', ');
        const values = Object.values(mappedRow);
        const placeholders = values.map((_, i) => `$${i + 2}`).join(', ');

        await pool.query(
          `INSERT INTO relevansi_penelitian (subtab, ${columns}) VALUES ($1, ${placeholders})`,
          [subtab, ...values]
        );
        added++;
      }

      res.json({ success: true, message: `✅ Imported ${added} rows`, added });
    } catch (err) {
      console.error('Import error:', err);
      res.status(500).json({ success: false, message: 'Gagal mengimpor file', error: err.message });
    }
  },
];
