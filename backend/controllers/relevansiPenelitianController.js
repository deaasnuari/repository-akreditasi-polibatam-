import prisma from "../prismaClient.js";
import multer from "multer";
import xlsx from "xlsx";

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

    const rows = await prisma.relevansi_penelitian.findMany({
      where: { subtab },
      orderBy: { id: "asc" },
    });

    // kembalikan field `data` saja plus id
    const data = rows.map(r => ({ id: r.id, ...r.data }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data", error: err.message });
  }
};

/* =============================================
   CREATE DATA
============================================= */
export const createData = async (req, res) => {
  try {
    const { subtab, ...body } = req.body;
    const userId = req.user.id; // Ambil user_id dari token JWT

    const cleanData = normalizeRow(body);

    const created = await prisma.relevansi_penelitian.create({
      data: {
        subtab,
        user_id: userId,
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
    const cleanData = normalizeRow(req.body);

    const updated = await prisma.relevansi_penelitian.update({
      where: { id },
      data: { data: cleanData },
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

    const deleted = await prisma.relevansi_penelitian.delete({
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
      const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

      let added = 0;
      let errors = [];

      for (let i = 0; i < rows.length; i++) {
        try {
          const raw = rows[i];
          const obj = {};
          for (const header of Object.keys(mapping)) {
            const dbField = mapping[header];
            if (dbField) obj[dbField] = raw[header];
          }

          const cleanData = normalizeRow(obj);

          await prisma.relevansi_penelitian.create({
            data: {
              subtab,
              user_id: userId,
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
