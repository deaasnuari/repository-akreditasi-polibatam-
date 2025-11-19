import prisma from '../prismaClient.js';

// GET semua data
export const getDiferensiasiMisi = async (req, res) => {
  try {
    const data = await prisma.diferensiasi_misi.findMany({
      orderBy: { id: "asc" },
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data", error: err.message });
  }
};

// POST tambah data
export const addDiferensiasiMisi = async (req, res) => {
  try {
    const newData = await prisma.diferensiasi_misi.create({
      data: req.body,
    });

    res.json({ message: "Data berhasil ditambahkan", data: newData });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan data", error: err.message });
  }
};

// PUT update data
export const updateDiferensiasiMisi = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await prisma.diferensiasi_misi.update({
      where: { id: Number(id) },
      data: req.body,
    });

    res.json({ message: "Data berhasil diperbarui", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui data", error: err.message });
  }
};

// DELETE hapus data
export const deleteDiferensiasiMisi = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.diferensiasi_misi.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus data", error: err.message });
  }
};
