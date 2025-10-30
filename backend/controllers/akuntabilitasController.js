import pool from "../db.js";  

// ambil semua data berdasarkan type (tataKelola / sarana)
export const getData = async (req, res) => {
  try {
    const { type } = req.query;
    const result = await pool.query(
      "SELECT * FROM akuntabilitas WHERE type = $1 ORDER BY id ASC",
      [type]
    );

    // ubah kolom indikator dari string JSON ke objek JS
    const formatted = result.rows.map((row) => ({
      id: row.id,
      data: JSON.parse(row.indikator || "{}"), // amanin kalau null
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data" });
  }
};

// buat data baru
export const createData = async (req, res) => {
  try {
    console.log("📩 BODY DITERIMA:", req.body);

    // ambil data sesuai struktur frontend
    const { type, data } = req.body;
    const cleanData = data || {}; // amanin kalau undefined/null

    // simpan langsung data ke kolom indikator
    const result = await pool.query(
      "INSERT INTO akuntabilitas (type, indikator, nilai, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
      [type, JSON.stringify(cleanData), 0]
    );

    res.json({
      success: true,
      data: { id: result.rows[0].id, data: cleanData },
      message: "Data berhasil disimpan",
    });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan data" });
  }
};

// update data
export const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const result = await pool.query(
      "UPDATE akuntabilitas SET indikator = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [JSON.stringify(data), id]
    );

    res.json({
      success: true,
      data: { id: result.rows[0].id, data },
      message: "Data berhasil diperbarui",
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui data" });
  }
};

// hapus data
export const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM akuntabilitas WHERE id = $1", [id]);
    res.json({ success: true, message: "Data berhasil dihapus" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Gagal menghapus data" });
  }
};
