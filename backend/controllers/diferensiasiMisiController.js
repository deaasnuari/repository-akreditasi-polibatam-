import prisma from '../prismaClient.js';
import XLSX from 'xlsx';

// ========== GET ==========
export const getDiferensiasiMisi = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userProdi = req.user?.prodi;
    const { type, prodi: prodiQuery } = req.query; // Added prodi: prodiQuery
    const queryTab = type || null;

    const normalizedRole = userRole ? userRole.trim().toLowerCase() : '';

    const whereClause = {};
    if (queryTab) whereClause.subtab = queryTab;

    if (normalizedRole === 'tim akreditasi') {
      // Tim Akreditasi can ONLY view data for their own prodi
      if (!userProdi) {
        return res.status(403).json({ success: false, message: "Prodi pengguna tidak ditemukan." });
      }
      whereClause.prodi = userProdi;
    } else if (normalizedRole === 'p4m') {
      // P4M can view all data, but can also filter by prodi if 'prodi' query param is provided
      if (prodiQuery) {
        whereClause.prodi = prodiQuery;
      }
    } else {
      // Other roles (non-Tim Akreditasi, non-P4M) should only see their own records and prodi
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      whereClause.user_id = userId;
      if (!userProdi) {
        return res.status(403).json({ success: false, message: "Prodi pengguna tidak ditemukan." });
      }
      whereClause.prodi = userProdi;
    }

    const records = await prisma.diferensiasi_misi.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
    });

    // Transform JSON
    const formatted = records.map(r => ({
      id: r.id,
      unit_kerja: r.data?.unit_kerja || "",
      tipe_data: r.data?.tipe_data || "",
      konten: r.data?.konten || "",
      prodi: r.prodi,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========== ADD ==========
export const addDiferensiasiMisi = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProdi = req.user.prodi;

    const { subtab, data } = req.body;

    if (!subtab || !data) {
      return res.status(400).json({ success: false, message: "subtab dan data wajib diisi" });
    }

    const newRow = await prisma.diferensiasi_misi.create({
      data: {
        user_id: userId,
        prodi: userProdi,
        subtab,
        data: {
          unit_kerja: data.unit_kerja,
          tipe_data: data.tipe_data,
          konten: data.konten,
        }
      }
    });

    res.json({ success: true, data: newRow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========== UPDATE ==========
export const updateDiferensiasiMisi = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userProdi = req.user.prodi;
    const { subtab, data } = req.body;

    const updated = await prisma.diferensiasi_misi.updateMany({
      where: { id, user_id: userId },
      data: {
        subtab,
        prodi: userProdi,
        data: {
          unit_kerja: data.unit_kerja,
          tipe_data: data.tipe_data,
          konten: data.konten,
        }
      }
    });

    if (!updated.count) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    res.json({ success: true, message: "Update berhasil" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========== DELETE ==========
export const deleteDiferensiasiMisi = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    const deleted = await prisma.diferensiasi_misi.deleteMany({
      where: { id, user_id: userId }
    });

    if (!deleted.count) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    res.json({ success: true, message: "Hapus berhasil" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========== SAVE DRAFT ==========
export const saveDraft = async (req, res) => {
  const { nama, path, status, type, currentData } = req.body;
  const userId = req.user.id;
  const userProdi = req.user.prodi;

  if (!nama || !path || !status || !type || !currentData) {
    return res.status(400).json({ success: false, message: "Data tidak lengkap" });
  }

  try {
    // DRAFT update
    const existing = await prisma.diferensiasi_misi.findFirst({
      where: { user_id: userId, prodi: userProdi, subtab: type },
    });

    let savedDraft;

    if (existing) {
      savedDraft = await prisma.diferensiasi_misi.update({
        where: { id: existing.id },
        data: { data: currentData }
      });
    } else {
      savedDraft = await prisma.diferensiasi_misi.create({
        data: {
          user_id: userId,
          prodi: userProdi,
          subtab: type,
          data: currentData
        }
      });
    }

    // Update bukti pendukung
    const existingBukti = await prisma.buktiPendukung.findFirst({
      where: { userId, path }
    });

    let bukti;

    if (existingBukti) {
      bukti = await prisma.buktiPendukung.update({
        where: { id: existingBukti.id },
        data: { status }
      });
    } else {
      bukti = await prisma.buktiPendukung.create({
        data: { nama, path, status, userId }
      });
    }

    res.json({
      success: true,
      message: "Draft berhasil disimpan",
      diferensiasiMisiDraft: savedDraft,
      buktiPendukung: bukti,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ========== IMPORT EXCEL ==========
export const importExcelDiferensiasiMisi = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProdi = req.user.prodi;
    const { subtab } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "File tidak ditemukan" });
    }

    if (!subtab) {
      return res.status(400).json({ success: false, message: "Subtab harus diisi" });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ success: false, message: "File Excel kosong" });
    }

    // Validate and transform data
    const expectedColumns = ['tipe_data', 'unit_kerja', 'konten'];
    const missingColumns = expectedColumns.filter(col => 
      !jsonData[0].hasOwnProperty(col)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Kolom yang hilang: ${missingColumns.join(', ')}. Format kolom: ${expectedColumns.join(', ')}`
      });
    }

    // Delete old data for this subtab first (optional, based on your requirement)
    // await prisma.diferensiasi_misi.deleteMany({
    //   where: { user_id: userId, subtab }
    // });

    // Create new records
    const createdRecords = [];
    for (const row of jsonData) {
      const newRecord = await prisma.diferensiasi_misi.create({
        data: {
          user_id: userId,
          prodi: userProdi,
          subtab,
          data: {
            tipe_data: row.tipe_data || "",
            unit_kerja: row.unit_kerja || "",
            konten: row.konten || "",
          }
        }
      });
      createdRecords.push(newRecord);
    }

    res.json({
      success: true,
      message: `${createdRecords.length} data berhasil diimport`,
      data: createdRecords
    });

  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
