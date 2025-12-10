import prisma from "../prismaClient.js";
import multer from "multer";
import xlsx from "xlsx";
import { createOrUpdateBuktiPendukung } from '../controllers/buktiPendukungController.js';

const upload = multer({ storage: multer.memoryStorage() });

/* =============================================
   NORMALIZATION & FILTER
============================================= */
function normalizeValue(value) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

function normalizeRow(row = {}) {
  const result = {};
  for (const key of Object.keys(row)) {
    result[key] = normalizeValue(row[key]);
  }
  return result;
}

/* =============================================
   GET DATA
============================================= */
export const getData = async (req, res) => {
  try {
    const subtab = req.query.subtab;
    const prodi = req.query.prodi; // Changed prodiFilter to prodi
    const userId = req.user.id;
    const userRole = req.user.role;
    const userProdi = req.user.prodi; // Get prodi from authenticated user

    console.log("getData: user_id:", userId, "user_role:", userRole, "user_prodi:", userProdi, "prodi_query:", prodi);

    // Build the WHERE clause
    let whereClause = { subtab }; // Use any for now to allow dynamic properties
    // Normalize userRole for robust comparison
    const normalizedUserRole = userRole ? userRole.trim().toLowerCase() : '';

    if (normalizedUserRole === 'tim akreditasi') {
      console.log("getData: Tim Akreditasi role.");
      // Tim Akreditasi can ONLY view data for their own prodi
      if (!userProdi) {
        return res.status(403).json({ success: false, message: "Prodi pengguna tidak ditemukan." });
      }
      whereClause.prodi = userProdi;
    } else if (normalizedUserRole === 'p4m') {
      console.log("getData: P4M role.");
      // P4M can view all data, but can also filter by prodi if 'prodi' query param is provided
      if (prodi) { // Use 'prodi' from query
        whereClause.prodi = prodi;
        console.log("getData: P4M filtering by prodi:", prodi);
      } else {
        console.log("getData: P4M, no prodi filter applied."); // P4M sees all data for the subtab
      }
    } else {
      console.log("getData: Non-admin role.");
      whereClause.user_id = userId; // Non-admin always filtered by their user_id

      if (!userProdi) {
        console.log("getData: Non-admin role, no user prodi found.");
        return res.json({ success: true, data: [] }); // If no prodi context, return empty
      }
      whereClause.prodi = userProdi; // Non-admin, always filter by user's prodi
      console.log("getData: Non-admin, filtering by user's prodi:", userProdi);
    }

    console.log("getData: Final whereClause:", whereClause);

    const rows = await prisma.relevansi_pendidikan.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
      select: {
        id: true,
        prodi: true, // Select prodi as a top-level field
        data: true,
      },
    });

    // kembalikan field `data` saja plus id dan prodi
    const data = rows.map(r => ({ id: r.id, prodi: r.prodi, ...r.data }));
    console.log("getData: Data sent to frontend:", data); // Added log

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data", error: err.message });
  }
};

/* =============================================
   GET DISTINCT PRODI
============================================= */
export const getDistinctProdi = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userProdi = req.user.prodi;

    let whereClause = {};
    const normalizedUserRole = userRole ? userRole.trim().toLowerCase() : '';

    if (normalizedUserRole !== 'tim akreditasi' && normalizedUserRole !== 'p4m') {
      whereClause = { user_id: userId };
      if (userProdi) {
        whereClause.prodi = userProdi;
      } else {
        return res.json({ success: true, data: [] }); // If not admin and no user prodi, return empty
      }
    }

    const distinctProdi = await prisma.relevansi_pendidikan.findMany({
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

/* =============================================
   CREATE DATA
============================================= */
export const createData = async (req, res) => {
  try {
    const { subtab, prodi, ...body } = req.body; // Extract prodi
    const userId = req.user.id;
    const userProdi = req.user.prodi;

    const finalProdi = prodi || userProdi; // Use provided prodi or user's prodi

    if (!finalProdi) {
      return res.status(400).json({ success: false, message: "Prodi tidak ditemukan" });
    }

    const cleanData = normalizeRow(body);

    const created = await prisma.relevansi_pendidikan.create({
      data: {
        subtab,
        user_id: userId,
        prodi: finalProdi, // Store prodi directly
        data: cleanData,
      },
    });

    res.json({ success: true, message: "Data berhasil ditambahkan", data: created });
  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menambahkan data", error: err.message });
  }
};

/* =============================================
   UPDATE DATA
============================================= */
export const updateData = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { prodi, ...body } = req.body; // Extract prodi

    const cleanData = normalizeRow(body);

    // Cek kepemilikan data
    const record = await prisma.relevansi_pendidikan.findUnique({
      where: { id },
      select: { user_id: true, prodi: true }, // Select prodi for ownership check
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    // Authorization check
    if (record.user_id !== userId && userRole !== 'tim-akreditasi') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk mengubah data ini" });
    }
    // If not tim-akreditasi, also ensure prodi matches
    if (userRole !== 'tim-akreditasi' && record.prodi !== req.user.prodi) {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk mengubah data prodi lain" });
    }


    const updated = await prisma.relevansi_pendidikan.update({
      where: { id },
      data: { 
        data: cleanData,
        prodi: prodi || record.prodi, // Update prodi if provided, otherwise keep existing
      },
    });

    res.json({ success: true, message: "Data berhasil diperbarui", data: updated });
  } catch (err) {
    console.error("PUT ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal memperbarui data", error: err.message });
  }
};

/* =============================================
   DELETE DATA
============================================= */
export const deleteData = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    // Cek kepemilikan data
    const record = await prisma.relevansi_pendidikan.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    if (record.user_id !== userId && userRole !== 'tim-akreditasi') {
      return res.status(403).json({ success: false, message: "Tidak memiliki akses untuk menghapus data ini" });
    }

    const deleted = await prisma.relevansi_pendidikan.delete({
      where: { id },
    });

    res.json({ success: true, message: "Data berhasil dihapus", data: deleted });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus data", error: err.message });
  }
};

/* =============================================
   IMPORT EXCEL
============================================= */
export const importExcel = [
  upload.single("file"),
  async (req, res) => {
    try {
      const subtab = req.body.subtab;
      const userId = req.user.id; // Ambil user_id dari token JWT
      const mapping = req.body.mappedData ? JSON.parse(req.body.mappedData) : {};

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

      let added = 0;
      let errors = [];
      
      for (let i = 0; i < rows.length; i++) {
        try {
          const raw = rows[i];
          const mappedData = {};
          let recordProdi = req.user.prodi; // Default to user's prodi
          console.log("data: ", mapping[0]);

          // for (const header of Object.keys(mapping)) {
          //   const dbField = mapping[header];
          //   console.log("key: ", dbField, "value: ", mapping[header]);
          //   if (dbField === 'prodi') { // If 'prodi' is explicitly mapped from Excel
          //     recordProdi = raw[header];
          //   } else if (dbField) {
          //     obj[dbField] = raw[header];
          //   }
          // }
          Object.entries(mapping[0]).forEach(([dbField, excelColumn]) => {
            if (dbField !== 'prodi' && excelColumn && raw.hasOwnProperty(excelColumn)) { // Exclude 'prodi' from data JSON
              mappedData[dbField] = raw[excelColumn];
            }
          });
          console.log("mapp: ", mappedData);

          if (!recordProdi) {
            errors.push({ row: i + 1, error: "Prodi tidak ditemukan untuk baris ini." });
            continue;
          }

          const cleanData = normalizeRow(mappedData);

          await prisma.relevansi_pendidikan.create({
            data: {
              subtab,
              user_id: userId,
              prodi: recordProdi ?? 'Teknik Informatika', // Store prodi directly
              data: cleanData,
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
        errors,
      });
    } catch (err) {
      console.error("IMPORT ERROR:", err);
      res.status(500).json({ success: false, message: "Gagal import", error: err.message });
    }
  },
];

// ======================
// 📝 SAVE DRAFT (Relevansi Pendidikan Specific with Bukti Pendukung Reference)
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
    // 1. Save/Update detailed Relevansi Pendidikan data (treating it as the draft)
    const existingRelevansiPendidikanEntry = await prisma.relevansi_pendidikan.findFirst({
      where: {
        user_id: user_id,
        prodi: user_prodi,
        subtab: type, // Using 'type' from frontend for 'subtab' field
      },
    });

    let savedRelevansiPendidikan;
    if (existingRelevansiPendidikanEntry) {
      savedRelevansiPendidikan = await prisma.relevansi_pendidikan.update({
        where: { id: existingRelevansiPendidikanEntry.id },
        data: {
          data: currentData, // Update the data field with the new draft content
          updated_at: new Date(),
        },
      });
    } else {
      savedRelevansiPendidikan = await prisma.relevansi_pendidikan.create({
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
      message: "Draft Relevansi Pendidikan berhasil disimpan dan referensi Bukti Pendukung diperbarui", 
      relevansiPendidikanDraft: savedRelevansiPendidikan,
      buktiPendukungReference: buktiPendukungEntry,
      redirect: "/dashboard/tim-akreditasi/bukti-pendukung" // Assuming this is the redirect path
    });

  } catch (err) {
    console.error("SAVE DRAFT RELEVANSI PENDIDIKAN ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan draft Relevansi Pendidikan" });
  }
};
