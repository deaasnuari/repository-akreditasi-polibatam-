// backend/controllers/diferensiasiMisiController.js
import pool from "../db.js";

// GET semua data
export const getDiferensiasiMisi = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM diferensiasi_misi ORDER BY id ASC");
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data", error: err.message });
  }
};

// POST tambah data
export const addDiferensiasiMisi = async (req, res) => {
  try {
    const { tipe_data, unit_kerja, konten, type } = req.body;
    const result = await pool.query(
      `INSERT INTO diferensiasi_misi (tipe_data, unit_kerja, konten, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tipe_data, unit_kerja, konten, type]
    );
    res.json({ message: "✅ Data berhasil ditambahkan", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan data", error: err.message });
  }
};

// PUT update data
export const updateDiferensiasiMisi = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipe_data, unit_kerja, konten, type } = req.body;
    const result = await pool.query(
      `UPDATE diferensiasi_misi
       SET tipe_data=$1, unit_kerja=$2, konten=$3, type=$4
       WHERE id=$5 RETURNING *`,
      [tipe_data, unit_kerja, konten, type, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "✅ Data berhasil diperbarui", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui data", error: err.message });
  }
};

// DELETE hapus data
export const deleteDiferensiasiMisi = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM diferensiasi_misi WHERE id=$1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "🗑️ Data berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus data", error: err.message });
  }
};
