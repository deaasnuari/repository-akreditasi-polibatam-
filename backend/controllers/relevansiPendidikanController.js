import pool from "../db.js";

// GET: ambil data berdasarkan type (misalnya ?type=mahasiswa)
export const getRelevansiPendidikan = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type
      ? "SELECT * FROM relevansi_pendidikan WHERE type = $1 ORDER BY id ASC"
      : "SELECT * FROM relevansi_pendidikan ORDER BY id ASC";
    const values = type ? [type] : [];
    const result = await pool.query(query, values);
    res.json({ data: result.rows });
  } catch (err) {
    console.error("Error GET:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data" });
  }
};

// POST: tambah data baru
export const addRelevansiPendidikan = async (req, res) => {
  try {
    console.log("📥 Request body:", req.body); // Cek data masuk

    const {
      type,
      tahun,
      daya_tampung,
      pendaftar,
      diterima,
      aktif,
      asalMahasiswa,
      ts2,
      ts1,
      ts,
      jumlah,
      linkBukti,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO relevansi_pendidikan 
      (type, tahun, daya_tampung, pendaftar, diterima, aktif, asalMahasiswa, ts2, ts1, ts, jumlah, linkBukti)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [type, tahun, daya_tampung, pendaftar, diterima, aktif, asalMahasiswa, ts2, ts1, ts, jumlah, linkBukti]
    );

    console.log("✅ Data tersimpan:", result.rows[0]);
    res.json({ success: true, message: "Data berhasil ditambahkan", item: result.rows[0] });
  } catch (err) {
    console.error("❌ Error POST:", err.message);
    res.status(500).json({ success: false, message: "Gagal menambahkan data" });
  }
};


// PUT: update data berdasarkan ID
export const updateRelevansiPendidikan = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "Tidak ada data untuk diperbarui" });
    }

    // Buat dynamic SET clause
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(", ");

    const query = `UPDATE relevansi_pendidikan SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    res.json({ success: true, message: "Data berhasil diupdate", item: result.rows[0] });
  } catch (err) {
    console.error("Error PUT:", err);
    res.status(500).json({ success: false, message: "Gagal memperbarui data" });
  }
};

// DELETE: hapus data berdasarkan ID
export const deleteRelevansiPendidikan = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM relevansi_pendidikan WHERE id = $1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

    res.json({ success: true, message: "Data berhasil dihapus" });
  } catch (err) {
    console.error("Error DELETE:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus data" });
  }
};

// IMPORT: dari Excel (array)
export const importRelevansiPendidikan = async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Format salah" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const item of items) {
        const { type, tahun, daya_tampung, pendaftar, diterima, aktif } = item;
        await client.query(
          `INSERT INTO relevansi_pendidikan (type, tahun, daya_tampung, pendaftar, diterima, aktif)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [type, tahun, daya_tampung, pendaftar, diterima, aktif]
        );
      }

      await client.query("COMMIT");
      res.json({ success: true, message: `Berhasil impor ${items.length} data.` });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Import error:", err);
      res.status(500).json({ success: false, message: "Gagal impor data" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error IMPORT:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};
