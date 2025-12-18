import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";

const prisma = new PrismaClient();

// ======================
// GET DATA BY SUBTAB
// ======================
export const getData = async (req, res) => {
          const { subtab, prodi } = req.query;
          const userId = req.user?.id;
          const userRole = req.user?.role;
          const userProdi = req.user?.prodi;  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    let whereClause = { subtab };

    const normalizedRole = userRole ? userRole.trim().toLowerCase() : '';
    if (normalizedRole === 'tim akreditasi') {
      // Tim Akreditasi can ONLY view data for their own prodi
      if (!userProdi) {
        return res.status(403).json({ success: false, message: "Prodi pengguna tidak ditemukan." });
      }
      whereClause.prodi = userProdi;
    } else if (normalizedRole === 'p4m') {
      // P4M can view all data, but can also filter by prodi if 'prodi' query param is provided
      if (prodi) { // Use 'prodi' from query
        whereClause.prodi = prodi;
      }
    } else {
      // Other roles always filter by their prodi
      if (!userProdi) {
        return res.status(403).json({ success: false, message: "Prodi pengguna tidak ditemukan." });
      }
      whereClause.prodi = userProdi;
    }

    const rows = await prisma.akuntabilitas.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
      select: {
        id: true,
        subtab: true,
        prodi: true, // Select the prodi field
        data: true,
        created_at: true,
        updated_at: true,
      }
    });

    console.log('\ud83d\udce5 [Akuntabilitas Backend] Raw data from DB:', { 
      rowCount: rows.length, 
      sample: rows[0],
      dataType: rows[0] ? typeof rows[0].data : 'none'
    });

    // Transform data - if data field is an array (from draft), unpack it
    // Otherwise, keep the structure as-is for compatibility
    const data = [];
    rows.forEach(row => {
      if (Array.isArray(row.data)) {
        // Data is array (from draft) - unpack each item
        row.data.forEach(item => {
          data.push({
            id: item.id || row.id,
            subtab: row.subtab,
            prodi: row.prodi,
            data: item.data || item
          });
        });
      } else {
        // Data is object (normal case) - keep as-is
        data.push({
          id: row.id,
          subtab: row.subtab,
          prodi: row.prodi,
          data: row.data
        });
      }
    });

    console.log('\u2705 [Akuntabilitas Backend] Transformed data:', {
      count: data.length,
      sample: data[0]
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data" });
  }
};

/* =============================================
   GET DISTINCT PRODI
============================================= */
export const getDistinctProdi = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userProdi = req.user?.prodi;

    let whereClause = {};
    const normalizedUserRole = userRole ? userRole.trim().toLowerCase() : '';

    if (normalizedUserRole !== 'tim akreditasi' && normalizedUserRole !== 'p4m') {
      if (userProdi) {
        whereClause = { prodi: userProdi };
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const distinctProdi = await prisma.akuntabilitas.findMany({
      where: whereClause,
      distinct: ['prodi'],
      select: {
        prodi: true,
      },
    });

    const prodiOptions = distinctProdi.map(item => item.prodi).filter(Boolean);

    res.json({ success: true, data: prodiOptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil opsi prodi", error: err.message });
  }
};


// ======================
// CREATE DATA
// ======================
export const createData = async (req, res) => {
  const { subtab, data, prodi } = req.body; // Destructure prodi
  const userId = req.user?.id;
  const userProdi = req.user?.prodi;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  let finalProdi = prodi;
  if (!finalProdi && userRole !== 'tim akreditasi') {
    finalProdi = userProdi;
  }
  // If 'tim akreditasi' and no prodi is provided in body, it's an error.
  if (!finalProdi) {
    return res.status(400).json({ success: false, message: "Prodi tidak ditemukan" });
  }


  try {
    const created = await prisma.akuntabilitas.create({
      data: {
        subtab,
        data,
        user_id: userId,
        prodi: finalProdi, // Save prodi
      },
    });

    res.json({ success: true, data: created });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Gagal menyimpan data" });
  }
};

// ======================
// UPDATE DATA
// ======================
export const updateData = async (req, res) => {
  const { id } = req.params;
  const { subtab, data, prodi } = req.body; // Destructure prodi
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const userProdi = req.user?.prodi;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // Check ownership and role for authorization
    const existingRecord = await prisma.akuntabilitas.findUnique({
      where: { id: Number(id) },
      select: { user_id: true, prodi: true },
    });

    if (!existingRecord) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    const normalizedRole = userRole ? userRole.trim().toLowerCase() : '';
    if (existingRecord.user_id !== userId && normalizedRole !== 'tim akreditasi' && normalizedRole !== 'p4m') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk mengubah data ini" });
    }
    // For non-admin/non-p4m, ensure they only modify data for their prodi
    if (normalizedRole !== 'tim akreditasi' && normalizedRole !== 'p4m' && existingRecord.prodi !== userProdi) {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk mengubah data prodi lain" });
    }


    const updated = await prisma.akuntabilitas.update({
      where: { id: Number(id) },
      data: {
        subtab,
        data,
        prodi: prodi || existingRecord.prodi, // Update prodi if provided, else keep existing
        updated_at: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Gagal memperbarui data" });
  }
};

// ======================
// DELETE DATA
// ======================
export const deleteData = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const userProdi = req.user?.prodi;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const existingRecord = await prisma.akuntabilitas.findUnique({
      where: { id: Number(id) },
      select: { user_id: true, prodi: true },
    });

    if (!existingRecord) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    const normalizedRole = userRole ? userRole.trim().toLowerCase() : '';
    if (existingRecord.user_id !== userId && normalizedRole !== 'tim akreditasi' && normalizedRole !== 'p4m') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk menghapus data ini" });
    }
    // For non-admin/non-p4m, ensure they only delete data for their prodi
    if (normalizedRole !== 'tim akreditasi' && normalizedRole !== 'p4m' && existingRecord.prodi !== userProdi) {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk menghapus data prodi lain" });
    }

    await prisma.akuntabilitas.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "Data berhasil dihapus" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Gagal menghapus data" });
  }
};

// ======================
// IMPORT EXCEL
// ======================
export const importExcel = async (req, res) => {
  const { type } = req.params; // 'type' here refers to subtab
  const userId = req.user?.id;
  const userProdi = req.user?.prodi;
  const userRole = req.user?.role;
  const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
  const isPreview = req.body.preview === 'true';

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Tidak ada file yang diupload" });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });

    if (isPreview) {
      // Handle preview: return headers, preview rows, and suggestions
      const headers = sheet.length > 0 ? Object.keys(sheet[0]) : [];
      const previewRows = sheet.slice(0, 5); // First 5 rows for preview
      const suggestions = {};

      const fields = getFieldMappingForSubTab(type);
      for (const header of headers) {
        const lowerHeader = header.toLowerCase().replace(/\s+/g, '');
        for (const field of fields) {
          const lowerKey = field.key.toLowerCase();
          const lowerLabel = field.label.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '');
          if (lowerHeader.includes(lowerKey) || lowerLabel.includes(lowerHeader) || lowerHeader === lowerKey) {
            suggestions[header] = field.key;
            break;
          }
        }
      }

      return res.json({
        success: true,
        headers,
        previewRows,
        suggestions,
      });
    }

    // Proceed with actual import
    let added = 0;
    let errors = [];

    for (let i = 0; i < sheet.length; i++) {
      try {
        const rawRow = sheet[i];
        const mappedData = {};
        Object.entries(mapping).forEach(([header, fieldKey]) => {
          if (fieldKey && rawRow.hasOwnProperty(header)) {
            mappedData[fieldKey] = rawRow[header];
          }
        });

        await prisma.akuntabilitas.create({
          data: {
            subtab: type,
            data: mappedData,
            user_id: userId,
            prodi: userProdi, // Use user's prodi for all rows
          },
        });
        added++;
      } catch (e) {
        errors.push({ row: i + 1, error: e.message });
      }
    }

    res.json({
      success: true,
      message: `Import selesai: ${added} berhasil, ${errors.length} gagal`,
      added,
      failed: errors.length,
    });
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal import data" });
  }
};

// Helper function to get field mapping for subtab
const getFieldMappingForSubTab = (subTab) => {
  if (subTab === 'tataKelola') {
    return [
      { key: 'jenis', label: 'Jenis Tata Kelola' },
      { key: 'nama', label: 'Nama Sistem Informasi' },
      { key: 'akses', label: 'Akses' },
      { key: 'unit', label: 'Unit Kerja' },
      { key: 'link', label: 'Link Bukti' },
    ];
  } else { // sarana
    return [
      { key: 'nama', label: 'Nama Prasarana' },
      { key: 'tampung', label: 'Daya Tampung' },
      { key: 'luas', label: 'Luas Ruang' },
      { key: 'status', label: 'Status' },
      { key: 'lisensi', label: 'Lisensi' },
      { key: 'perangkat', label: 'Perangkat' },
      { key: 'link', label: 'Link Bukti' },
    ];
  }
};

// ======================
// 📝 SAVE DRAFT (Akuntabilitas Specific with Bukti Pendukung Reference)
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
    console.log('💾 [SAVE DRAFT Akuntabilitas] Data yang akan disimpan:', {
      type,
      user_id,
      user_prodi,
      currentDataLength: currentData?.length
    });

    // PENTING: Data sudah tersimpan melalui CREATE/UPDATE endpoint
    // Save draft hanya perlu membuat referensi di bukti_pendukung
    // JANGAN update akuntabilitas di sini karena akan menghapus data yang sudah ada!

    const existingDataCount = await prisma.akuntabilitas.count({
      where: {
        user_id: user_id,
        prodi: user_prodi,
        subtab: type,
      },
    });

    console.log(`✅ [SAVE DRAFT] Data exists: ${existingDataCount} rows`);

    // Create/Update a reference in Bukti Pendukung
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
      message: "Draft Akuntabilitas berhasil disimpan - referensi Bukti Pendukung dibuat",
      existingDataCount: existingDataCount,
      buktiPendukungReference: buktiPendukungEntry,
      redirect: "/dashboard/tim-akreditasi/bukti-pendukung"
    });

  } catch (err) {
    console.error("SAVE DRAFT AKUNTABILITAS ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan draft Akuntabilitas" });
  }
};
