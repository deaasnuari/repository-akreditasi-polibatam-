import pool from "../db.js"; // sesuaikan dengan file koneksi databasenya

// ✅ Ambil semua data review LED
export const getAllReviewLED = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM review_led_p4m ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching review LED:", error);
    res.status(500).json({ message: "Gagal mengambil data review LED" });
  }
};

// ✅ Tambah data review baru
export const addReviewLED = async (req, res) => {
  try {
    const { nama_file, catatan, status } = req.body;
    const result = await pool.query(
      "INSERT INTO review_led_p4m (nama_file, catatan, status) VALUES ($1, $2, $3) RETURNING *",
      [nama_file, catatan, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding review LED:", error);
    res.status(500).json({ message: "Gagal menambah data review LED" });
  }
};

// ✅ Update review
export const updateReviewLED = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan, status } = req.body;
    const result = await pool.query(
      "UPDATE review_led_p4m SET catatan=$1, status=$2 WHERE id=$3 RETURNING *",
      [catatan, status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating review LED:", error);
    res.status(500).json({ message: "Gagal memperbarui review LED" });
  }
};

// ✅ Hapus data review
export const deleteReviewLED = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM review_led_p4m WHERE id=$1", [id]);
    res.json({ message: "Data review LED dihapus" });
  } catch (error) {
    console.error("Error deleting review LED:", error);
    res.status(500).json({ message: "Gagal menghapus data review LED" });
  }
};

// ✅ Import Excel (kalau dibutuhkan)
export const importReviewLED = async (req, res) => {
  res.json({ message: "Fitur import review LED belum diimplementasikan" });
};
