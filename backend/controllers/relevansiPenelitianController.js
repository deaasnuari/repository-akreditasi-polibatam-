import prisma from "../prismaClient.js";
import xlsx from 'xlsx';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

/* =============================================
   FIELD TYPE CONFIG (AUTO NORMALIZATION)
============================================= */

// Integer columns
const INT_FIELDS = [
  "dayatampung",
  "jumlahmahasiswaterlibat",
  "tahun"
];

// Decimal columns
const DECIMAL_FIELDS = [
  "luasruang",
  "durasi",
  "pendanaan"
];

/* =============================================
    NORMALIZATION FUNCTION
============================================= */
function normalizeValue(key, value) {
  if (value === undefined || value === null || value === "") return null;

  // Convert INT
  if (INT_FIELDS.includes(key)) {
    const v = Number(value);
    return isNaN(v) ? null : v;
  }

  // Convert DECIMAL (must be string for Prisma.decimal)
  if (DECIMAL_FIELDS.includes(key)) {
    const v = Number(value);
    return isNaN(v) ? null : v.toString();
  }

  return value;
}

function normalizeRow(data = {}) {
  const result = {};
  for (const key of Object.keys(data)) {
    result[key] = normalizeValue(key, data[key]);
  }
  return result;
}

/* =============================================
    SAFE FILTER: remove unknown columns
============================================= */
const MODEL_FIELDS = [
  "subtab",
  "namaprasarana",
  "dayatampung",
  "luasruang",
  "status",
  "lisensi",
  "perangkat",
  "linkbukti",
  "namadtpr",
  "judulpenelitian",
  "jumlahmahasiswaterlibat",
  "jenishibah",
  "sumber",
  "durasi",
  "pendanaan",
  "tahun",
  "jenispengembangan",
  "tahunakademik",
  "judulkerjasama",
  "mitra",
  "judulpublikasi",
  "jenispublikasi",
  "judul",
  "jenishki"
];

function filterValidKeys(data) {
  const result = {};
  for (const key of Object.keys(data)) {
    if (MODEL_FIELDS.includes(key)) {
      result[key] = data[key];
    }
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
      orderBy: { id: "asc" }
    });

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mengambil data", error: err.message });
  }
};

/* =============================================
    CREATE DATA
============================================= */
export const createData = async (req, res) => {
  try {
    const { subtab, ...body } = req.body;

    let data = filterValidKeys(body);
    data = normalizeRow(data);

    const created = await prisma.relevansi_penelitian.create({
      data: { subtab, ...data },
    });

    res.json({ success: true, message: "Data berhasil ditambahkan", data: created });

  } catch (err) {
    console.log("POST ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menambahkan data", error: err.message });
  }
};

/* =============================================
    UPDATE DATA
============================================= */
export const updateData = async (req, res) => {
  try {
    const id = Number(req.params.id);

    let data = filterValidKeys(req.body);
    data = normalizeRow(data);

    const updated = await prisma.relevansi_penelitian.update({
      where: { id },
      data
    });

    res.json({ success: true, message: "Data berhasil diperbarui", data: updated });

  } catch (err) {
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
      where: { id }
    });

    res.json({ success: true, message: "Data berhasil dihapus", data: deleted });

  } catch (err) {
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

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

      const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};

      let added = 0;
      let errors = [];

      for (let idx = 0; idx < rows.length; idx++) {
        try {
          const raw = rows[idx];
          const obj = { subtab };

          for (const h of Object.keys(mapping)) {
            const dbField = mapping[h];
            if (dbField) obj[dbField] = raw[h];
          }

          let clean = filterValidKeys(obj);
          clean = normalizeRow(clean);

          await prisma.relevansi_penelitian.create({ data: clean });
          added++;

        } catch (e) {
          errors.push({ row: idx + 1, error: e.message });
        }
      }

      res.json({
        success: true,
        message: `Import selesai: ${added} berhasil, ${errors.length} gagal`,
        added,
        failed: errors.length,
        errors
      });

    } catch (err) {
      res.status(500).json({ success: false, message: "Gagal import", error: err.message });
    }
  }
];
