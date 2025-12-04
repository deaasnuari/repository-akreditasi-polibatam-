import prisma from '../prismaClient.js';

/**
 * Membuat atau memperbarui entri BuktiPendukung.
 * Jika entri untuk user dan path yang sama sudah ada, ia akan di-update.
 * Jika tidak, entri baru akan dibuat.
 */
export const createOrUpdateBuktiPendukung = async (req, res) => {
  const { nama, path, status } = req.body;
  const userId = req.user?.id; // Diambil dari token JWT setelah otentikasi via authMiddleware

  // Validasi input dasar
  if (!nama || !path || !status) {
    return res.status(400).json({ message: 'Field nama, path, dan status harus diisi' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'User tidak terautentikasi atau token tidak valid' });
  }

  try {
    // Cari entri yang sudah ada berdasarkan userId dan path
    const existingBukti = await prisma.buktiPendukung.findFirst({
      where: {
        userId: userId,
        path: path,
      },
    });

    if (existingBukti) {
      // --- UPDATE ---
      // Jika sudah ada, update status dan timestamp-nya
      const updatedBukti = await prisma.buktiPendukung.update({
        where: {
          id: existingBukti.id,
        },
        data: {
          status: status,
          // 'updatedAt' akan diperbarui secara otomatis oleh Prisma
        },
      });
      res.status(200).json({ message: 'Status bukti pendukung berhasil diperbarui', data: updatedBukti });
    } else {
      // --- CREATE ---
      // Jika tidak ada, buat entri baru
      const newBukti = await prisma.buktiPendukung.create({
        data: {
          nama,
          path,
          status,
          userId,
        },
      });
      res.status(201).json({ message: 'Bukti pendukung berhasil dibuat', data: newBukti });
    }
  } catch (error) {
    console.error('Error saat menyimpan bukti pendukung:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat menyimpan bukti pendukung', error: error.message });
  }
};

/**
 * Mengambil semua entri BuktiPendukung untuk user yang sedang login.
 */
export const getBuktiPendukungForUser = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User tidak terautentikasi atau token tidak valid' });
  }

  try {
    const buktiItems = await prisma.buktiPendukung.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    res.status(200).json(buktiItems);
  } catch (error) {
    console.error('Error saat mengambil data bukti pendukung:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil data', error: error.message });
  }
};
