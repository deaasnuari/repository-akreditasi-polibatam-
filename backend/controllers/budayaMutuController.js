import pool from '../db.js';

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
