import fs from "fs";
import path from "path";

const filePath = path.resolve("backend/data/diferensiasiMisi.json");

// Fungsi untuk membaca data dari file JSON
const readData = () => {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw || "[]");
};

// Fungsi untuk menyimpan data ke file JSON
const saveData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- GET (Ambil Data) ---
export const getDiferensiasiMisi = async (req, res) => {
  try {
    const { type } = req.query;
    const data = readData(); // 🔹 Ambil data dari file JSON

    // Jika ada query ?type=..., filter datanya
    const filtered = type ? data.filter((item) => item.type === type) : data;

    res.json({ data: filtered });
  } catch (err) {
    console.error("Error reading data:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --- POST (Tambah Data) ---
export const addDiferensiasiMisi = (req, res) => {
  try {
    const data = readData();
    const newItem = {
      id: Date.now(),
      tipe_data: req.body.tipe_data,
      unit_kerja: req.body.unit_kerja,
      konten: req.body.konten,
      type: req.body.type || "visi-misi",
    };

    data.push(newItem);
    saveData(data);

    res.json({ message: "✅ Data berhasil ditambahkan", data: newItem });
  } catch (err) {
    console.error("Error adding data:", err);
    res.status(500).json({ message: "Gagal menambahkan data" });
  }
};

// --- PUT (Update Data) ---
export const updateDiferensiasiMisi = (req, res) => {
  try {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.findIndex((item) => item.id === id);

    if (index === -1)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    data[index] = { ...data[index], ...req.body };
    saveData(data);

    res.json({ message: "✅ Data berhasil diperbarui", data: data[index] });
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).json({ message: "Gagal memperbarui data" });
  }
};

// --- DELETE (Hapus Data) ---
export const deleteDiferensiasiMisi = (req, res) => {
  try {
    const data = readData();
    const id = parseInt(req.params.id);
    const filtered = data.filter((item) => item.id !== id);

    if (filtered.length === data.length)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    saveData(filtered);
    res.json({ message: "🗑️ Data berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting data:", err);
    res.status(500).json({ message: "Gagal menghapus data" });
  }
};
