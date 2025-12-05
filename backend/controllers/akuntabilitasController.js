import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ======================
// GET DATA BY SUBTAB
// ======================
export const getData = async (req, res) => {
  const { subtab, prodiFilter } = req.query;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const userProdi = req.user?.prodi;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    let whereClause = { subtab };

    if (userRole && userRole.trim().toLowerCase() === 'tim akreditasi') {
      if (prodiFilter) {
        whereClause.prodi = prodiFilter;
      }
      // No user_id filter for 'tim akreditasi'
    } else {
      whereClause.user_id = userId;
      if (prodiFilter) {
        whereClause.prodi = prodiFilter;
      } else if (userProdi) {
        whereClause.prodi = userProdi;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const data = await prisma.akuntabilitas.findMany({
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

    if (normalizedUserRole !== 'tim akreditasi') {
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

    if (existingRecord.user_id !== userId && userRole?.trim().toLowerCase() !== 'tim akreditasi') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk mengubah data ini" });
    }
    // For non-admin, ensure they only modify data for their prodi
    if (userRole?.trim().toLowerCase() !== 'tim akreditasi' && existingRecord.prodi !== userProdi) {
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

    if (existingRecord.user_id !== userId && userRole?.trim().toLowerCase() !== 'tim akreditasi') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk menghapus data ini" });
    }
    // For non-admin, ensure they only delete data for their prodi
    if (userRole?.trim().toLowerCase() !== 'tim akreditasi' && existingRecord.prodi !== userProdi) {
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


  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Tidak ada file yang diupload" });
  }

  try {
    // const filePath = path.resolve(req.file.path); // Multer memory storage, no file path
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    let added = 0;
    let errors = [];

    for (const rawRow of sheet) {
      try {
        let recordProdi = userProdi; // Default to user's prodi
        // If 'tim akreditasi' is importing and 'prodi' is mapped, use mapped prodi
        if (userRole?.trim().toLowerCase() === 'tim akreditasi' && mapping.prodi && rawRow[mapping.prodi]) {
          recordProdi = rawRow[mapping.prodi];
        } else if (userRole?.trim().toLowerCase() === 'tim akreditasi' && !mapping.prodi) {
          // If admin imports and doesn't map prodi, it's an error.
          errors.push({ row: rawRow.__rowNum__, error: "Sebagai Tim Akreditasi, kolom 'Prodi' harus dipetakan saat import." });
          continue;
        }

        if (!recordProdi) {
          errors.push({ row: rawRow.__rowNum__, error: "Prodi tidak ditemukan untuk baris ini." });
          continue;
        }

        const mappedData = {};
        Object.entries(mapping).forEach(([dbField, excelColumn]) => {
          if (dbField !== 'prodi' && excelColumn && rawRow.hasOwnProperty(excelColumn)) {
            mappedData[dbField] = rawRow[excelColumn];
          }
        });

        await prisma.akuntabilitas.create({
          data: {
            subtab: type,
            data: mappedData,
            user_id: userId,
            prodi: recordProdi, // Save prodi
          },
        });
        added++;
      } catch (e) {
        errors.push({ row: rawRow.__rowNum__, error: e.message });
      }
    }

    // fs.unlinkSync(filePath); // Not needed with memory storage

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
    // 1. Save/Update detailed Akuntabilitas data (treating it as the draft)
    const existingAkuntabilitasEntry = await prisma.akuntabilitas.findFirst({
      where: {
        user_id: user_id,
        prodi: user_prodi,
        subtab: type, // Using 'type' from frontend for 'subtab' field
      },
    });

    let savedAkuntabilitas;
    if (existingAkuntabilitasEntry) {
      savedAkuntabilitas = await prisma.akuntabilitas.update({
        where: { id: existingAkuntabilitasEntry.id },
        data: {
          data: currentData, // Update the data field with the new draft content
          updated_at: new Date(),
        },
      });
    } else {
      savedAkuntabilitas = await prisma.akuntabilitas.create({
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
      message: "Draft Akuntabilitas berhasil disimpan dan referensi Bukti Pendukung diperbarui",
      akuntabilitasDraft: savedAkuntabilitas,
      buktiPendukungReference: buktiPendukungEntry,
      redirect: "/dashboard/tim-akreditasi/bukti-pendukung" // Redirect to bukti pendukung page
    });

  } catch (err) {
    console.error("SAVE DRAFT AKUNTABILITAS ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan draft Akuntabilitas" });
  }
};
