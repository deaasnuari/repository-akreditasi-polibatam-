import fs from "fs";
const filePath = "./backend/data/relevansiPendidikan.json";

// 🔹 Ambil semua data
export const getAllRelevansi = (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal membaca data", error: err.message });
  }
};

// 🔹 Tambah data baru
export const addRelevansi = (req, res) => {
  try {
    const newItem = req.body;
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    newItem.id = data.length ? data[data.length - 1].id + 1 : 1;
    data.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.status(201).json({ message: "Data berhasil ditambahkan", data: newItem });
  } catch (err) {
    res.status(500).json({ message: "Gagal menyimpan data", error: err.message });
  }
};

// 🔹 Update data
export const updateRelevansi = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return res.status(404).json({ message: "Data tidak ditemukan" });

    data[index] = { ...data[index], ...req.body };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ message: "Data berhasil diperbarui", data: data[index] });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui data", error: err.message });
  }
};

// 🔹 Hapus data
export const deleteRelevansi = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const filtered = data.filter((item) => item.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus data", error: err.message });
  }
};
