import prisma from '../prismaClient.js';

// GET semua data berdasarkan user_id
export const getDiferensiasiMisi = async (req, res) => {
  try {
    const userId = req.user.id; // dari middleware auth
    const { subtab } = req.query; // opsional filter subtab

    const whereClause = { user_id: userId };
    if (subtab) {
      whereClause.subtab = subtab;
    }

    const data = await prisma.diferensiasi_misi.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
    });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data", error: err.message });
  }
};

// POST tambah data
export const addDiferensiasiMisi = async (req, res) => {
  try {
    const userId = req.user.id; // dari middleware auth
    const { subtab, data } = req.body;

    if (!subtab || !data) {
      return res.status(400).json({ message: "subtab dan data diperlukan" });
    }

    const newData = await prisma.diferensiasi_misi.create({
      data: {
        user_id: userId,
        subtab,
        data,
      },
    });

    res.json({ message: "Data berhasil ditambahkan", data: newData });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan data", error: err.message });
  }
};

// PUT update data
export const updateDiferensiasiMisi = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { subtab, data } = req.body;

    const updated = await prisma.diferensiasi_misi.updateMany({
      where: {
        id: Number(id),
        user_id: userId, // pastikan hanya user sendiri yang bisa update
      },
      data: {
        ...(subtab && { subtab }),
        ...(data && { data }),
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan atau tidak memiliki akses" });
    }

    res.json({ message: "Data berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui data", error: err.message });
  }
};

// DELETE hapus data
export const deleteDiferensiasiMisi = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const deleted = await prisma.diferensiasi_misi.deleteMany({
      where: {
        id: Number(id),
        user_id: userId, // pastikan hanya user sendiri yang bisa delete
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan atau tidak memiliki akses" });
    }

    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus data", error: err.message });
  }
};
