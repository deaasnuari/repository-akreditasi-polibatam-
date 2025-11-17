import * as Model from '../models/relevansiPenelitianModel.js';
import xlsx from 'xlsx';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// GET data per subtab
export const getData = async (req, res) => {
  try {
    const subtab = req.query.subtab; // ganti type -> subtab
    const rows = await Model.findBySubtab(subtab);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data', error: err.message });
  }
};

// POST — tambah data baru
export const createData = async (req, res) => {
  try {
    const { subtab, ...data } = req.body; // ganti type -> subtab

    if (!subtab) {
      return res.status(400).json({ success: false, message: 'Field "subtab" wajib diisi' });
    }

    const keys = Object.keys(data || {});
    if (keys.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data untuk disimpan' });
    }

    // Basic validation: ensure column names are safe identifiers
    const invalidKey = keys.find(k => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k));
    if (invalidKey) {
      return res.status(400).json({ success: false, message: `Nama kolom tidak valid: ${invalidKey}` });
    }

    const item = await Model.create(subtab, data);
    res.json({ success: true, message: '✅ Data berhasil ditambahkan', data: item });
  } catch (err) {
    console.error('POST error:', err);
    // In development return the error message so frontend can show details.
    const safeMessage = process.env.NODE_ENV === 'production' ? 'Gagal menambahkan data' : (err.message || 'Gagal menambahkan data');
    const payload = { success: false, message: safeMessage };
    if (process.env.NODE_ENV !== 'production') payload.error = err.stack || err.message;
    res.status(500).json(payload);
  }
};

// PUT — update data
export const updateData = async (req, res) => {
  try {
    const idRaw = req.params.id;
    console.log(`[relevansi-penelitian] UPDATE called with idRaw=${idRaw}, body=`, req.body);
    const id = Number(idRaw);
    if (!Number.isFinite(id) || id <= 0) {
      console.warn(`[relevansi-penelitian] invalid id for update: ${idRaw}`);
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const data = req.body || {};
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diberikan untuk diupdate' });
    }

    const updated = await Model.updateById(id, data);
    if (!updated) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, message: '✅ Data berhasil diperbarui', data: updated });
  } catch (err) {
    console.error('PUT error:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data', error: err.message });
  }
};

// DELETE — hapus data
export const deleteData = async (req, res) => {
  try {
    const idRaw = req.params.id;
    // log incoming id for debugging
    console.log(`[relevansi-penelitian] DELETE called with idRaw=${idRaw}`);
    const id = Number(idRaw);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const deleted = await Model.deleteById(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, message: '🗑️ Data berhasil dihapus', data: deleted });
  } catch (err) {
    console.error('DELETE error:', err);
    // print stack if available to help debugging
    if (err && err.stack) console.error(err.stack);
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

        // use model importRows for batch insert
        await Model.importRows(subtab, [mappedRow]);
        added++;
      }

      res.json({ success: true, message: `✅ Imported ${added} rows`, added });
    } catch (err) {
      console.error('Import error:', err);
      res.status(500).json({ success: false, message: 'Gagal mengimpor file', error: err.message });
    }
  },
];
