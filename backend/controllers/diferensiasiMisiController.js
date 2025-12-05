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
    const prodi = req.user.prodi; // Ambil prodi dari user yang login

    if (!subtab || !data || !prodi) {
      return res.status(400).json({ message: "subtab, data, dan prodi diperlukan" });
    }

    const newData = await prisma.diferensiasi_misi.create({
      data: {
        user_id: userId,
        prodi,
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
    const { subtab, data, prodi } = req.body;

    const updated = await prisma.diferensiasi_misi.updateMany({
      where: {
        id: Number(id),
        user_id: userId, // pastikan hanya user sendiri yang bisa update
      },
      data: {
        ...(subtab && { subtab }),
        ...(data && { data }),
        ...(prodi && { prodi }), // Tambahkan prodi jika ada
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

// ======================
// 📝 SAVE DRAFT (Diferensiasi Misi Specific with Bukti Pendukung Reference)
// ======================
export const saveDraft = async (req, res) => {
  const { nama, path, status, type, currentData } = req.body;
  const user_id = req.user.id;
  const user_prodi = req.user.prodi;

  // Basic validation
  if (!nama || !path || !status || !type || !currentData) {
    return res.status(400).json({ success: false, message: "Nama, path, status, type, dan data tidak boleh kosong" });
  }
  if (!user_id || !user_prodi) {
    return res.status(401).json({ success: false, message: "User tidak terautentikasi atau prodi tidak ditemukan" });
  }

  try {
    // 1. Save/Update detailed Diferensiasi Misi data (treating it as the draft)
    const existingDiferensiasiMisiEntry = await prisma.diferensiasi_misi.findFirst({
      where: {
        user_id: user_id,
        prodi: user_prodi,
        subtab: type, // Using 'type' from frontend for 'subtab' field
      },
    });

    let savedDiferensiasiMisi;
    if (existingDiferensiasiMisiEntry) {
      savedDiferensiasiMisi = await prisma.diferensiasi_misi.update({
        where: { id: existingDiferensiasiMisiEntry.id },
        data: {
          data: currentData, // Update the data field with the new draft content
          updated_at: new Date(),
        },
      });
    } else {
      savedDiferensiasiMisi = await prisma.diferensiasi_misi.create({
        data: {
          user_id: user_id,
          prodi: user_prodi,
          subtab: type, // Using 'type' from frontend for 'subtab' field
          data: currentData,
        },
      });
    }

    // 2. Create/Update a reference in Bukti Pendukung
    const existingBukti = await prisma.buktiPendukung.findFirst({
      where: {
        userId: user_id,
        path: path,
      },
    });

    let buktiPendukungEntry;
    if (existingBukti) {
      buktiPendukungEntry = await prisma.buktiPendukung.update({
        where: { id: existingBukti.id },
        data: { status: status },
      });
    } else {
      buktiPendukungEntry = await prisma.buktiPendukung.create({
        data: {
          nama: nama,
          path: path,
          status: status,
          userId: user_id,
        },
      });
    }

    res.json({
      success: true,
      message: "Draft Diferensiasi Misi berhasil disimpan dan referensi Bukti Pendukung diperbarui",
      diferensiasiMisiDraft: savedDiferensiasiMisi,
      buktiPendukungReference: buktiPendukungEntry,
      redirect: "/dashboard/tim-akreditasi/bukti-pendukung" // Redirect to bukti pendukung page
    });

  } catch (err) {
    console.error("SAVE DRAFT DIFERENSIASI MISI ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan draft Diferensiasi Misi" });
  }
};
