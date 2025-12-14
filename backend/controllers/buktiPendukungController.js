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

/**
 * Rekap bagian Bukti Pendukung untuk kebutuhan halaman export.
 * Kembalikan array dengan shape: { id, kode_bagian, nama_bagian, deskripsi, tanggal_update, status }
 */
export const getRekapBagian = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User tidak terautentikasi atau token tidak valid' });
  }
  try {
    // Ambil semua bukti pendukung milik user
    const items = await prisma.buktiPendukung.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    // Kelompokkan berdasarkan bagian. Asumsi: field nama menyimpan informasi bagian
    // Contoh konvensi: nama = "A1 - Visi & Misi - Dokumen X".
    // Jika Anda punya kolom kodeBagian/namaBagian tersendiri di DB, ganti mapping di bawah sesuai kolom tersebut.
    const groups = new Map();

    for (const it of items) {
      // Heuristik ekstraksi kode dan nama bagian dari field nama
      // Format yang didukung: "<KODE> - <NAMA BAGIAN> - ..." atau "<KODE> - <NAMA BAGIAN>"
      let kode = 'UNK';
      let nama = 'Bagian Tidak Dikenal';
      let deskripsi = it.nama || 'Bukti pendukung';

      if (typeof it.nama === 'string' && it.nama.includes('-')) {
        const parts = it.nama.split('-').map(s => s.trim());
        if (parts.length >= 2) {
          kode = parts[0] || kode;
          nama = parts[1] || nama;
          deskripsi = parts.slice(2).join(' - ') || deskripsi;
        }
      }

      const key = `${kode}::${nama}`;
      const current = groups.get(key) || { id: undefined, kode_bagian: kode, nama_bagian: nama, deskripsi: '', tanggal_update: undefined, dokumen: [], statusRaw: [] };

      current.dokumen.push(it);
      current.statusRaw.push((it.status || '').toLowerCase());
      // Tanggal update bagian = max updatedAt
      const ts = new Date(it.updatedAt || it.createdAt || Date.now()).toISOString();
      current.tanggal_update = !current.tanggal_update || ts > current.tanggal_update ? ts : current.tanggal_update;
      // Simpan deskripsi paling informatif sekali saja
      if (!current.deskripsi) current.deskripsi = deskripsi;

      groups.set(key, current);
    }

    // Tentukan status bagian berdasarkan status dokumen di dalamnya
    const mapStatus = (statusList) => {
      // Contoh aturan:
      // - Jika ada satupun yang bukan 'lengkap' => "Belum Lengkap"
      // - Jika semuanya 'lengkap' => "Siap Export"
      // - Jika kosong (tidak ada dokumen) => "Kelengkapan"
      if (!statusList || statusList.length === 0) return 'Kelengkapan';
      const allLower = statusList.map(s => String(s || '').toLowerCase());
      const allLengkap = allLower.every(s => s === 'lengkap' || s === 'complete' || s === 'siap export');
      return allLengkap ? 'Siap Export' : 'Belum Lengkap';
    };

    // Bangun array rekap akhir
    let autoId = 1;
    // Tentukan mapping sederhana kode_bagian -> type budaya_mutu (sesuaikan bila perlu)
    const mapKodeToType = (kode) => {
      const k = String(kode || '').toUpperCase();
      // Contoh mapping; silakan sesuaikan dengan kebutuhan riil
      if (k.startsWith('TUPOKSI') || k === 'TUPOKSI' || k.startsWith('A1')) return 'tupoksi';
      if (k.startsWith('SPMI') || k.startsWith('B')) return 'spmi';
      // Default: tidak diketahui
      return undefined;
    };

    const rekap = Array.from(groups.values()).map(g => ({
      id: autoId++,
      kode_bagian: g.kode_bagian,
      nama_bagian: g.nama_bagian,
      deskripsi: g.deskripsi || `${g.nama_bagian} - Bukti Pendukung`,
      tanggal_update: g.tanggal_update || new Date().toISOString(),
      status: mapStatus(g.statusRaw),
      // Tambahkan type agar frontend bisa kirim selectedTypes ke endpoint export
      type: mapKodeToType(g.kode_bagian) || null,
    }));

    // Jika tidak ada dokumen sama sekali, kembalikan array kosong
    return res.json(rekap);
  } catch (error) {
    console.error('Error saat mengambil rekap bukti pendukung:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil rekap', error: error.message });
  }
};
