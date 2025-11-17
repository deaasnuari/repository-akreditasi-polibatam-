import prisma from "../prismaClient.js";
import xlsx from "xlsx";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// ==========================
// 🔹 HELPER: Convert camelCase to snake_case
// ==========================
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const convertKeysToSnake = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[camelToSnake(key)] = obj[key];
    }
  }
  return result;
};

const convertKeysFromSnake = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
  }
  return result;
};

// ==========================
// 🔹 GET data per subtab
// ==========================
export const getData = async (req, res) => {
  try {
    const subtab = req.query.type;
    
    if (!subtab) {
      return res.status(400).json({ 
        success: false, 
        message: "Parameter 'type' wajib diisi" 
      });
    }

    const rows = await prisma.relevansi_pkm.findMany({
      where: { subtab },
      orderBy: { id: 'asc' }
    });

    const dataWithCamelCase = rows.map(row => convertKeysFromSnake(row));
    res.json({ success: true, data: dataWithCamelCase, count: dataWithCamelCase.length });
  } catch (err) {
    console.error("❌ GET error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Gagal mengambil data", 
      error: err.message 
    });
  }
};

// ==========================
// 🔹 POST — tambah data baru
// ==========================
export const createData = async (req, res) => {
  try {
    const subtab = req.body.type;
    
    if (!subtab) {
      return res.status(400).json({ 
        success: false, 
        message: "Field 'type' wajib diisi" 
      });
    }

    let data = { ...req.body };
    delete data.type;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Data kosong, tidak ada yang disimpan" 
      });
    }

    // Convert camelCase dari frontend ke snake_case untuk database
    data = convertKeysToSnake(data);

    const saved = await prisma.relevansi_pkm.create({
      data: {
        subtab,
        ...data
      }
    });

    const savedData = convertKeysFromSnake(saved);
    res.status(201).json({ 
      success: true, 
      message: '✅ Data berhasil ditambahkan', 
      data: savedData 
    });
  } catch (err) {
    console.error("❌ POST error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Gagal menambahkan data", 
      error: err.message 
    });
  }
};

// ==========================
// 🔹 PUT — update data
// ==========================
export const updateData = async (req, res) => {
  try {
    const idRaw = req.params.id;
    const id = Number(idRaw);
    
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "ID tidak valid" 
      });
    }

    let data = { ...req.body };
    delete data.type; // Hapus field 'type' jika ada
    delete data.id;   // Hapus field 'id' jika ada

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Tidak ada data untuk diperbarui" 
      });
    }

    // Convert camelCase ke snake_case
    data = convertKeysToSnake(data);

    const updated = await prisma.relevansi_pkm.update({
      where: { id },
      data: data
    });

    const updatedData = convertKeysFromSnake(updated);
    res.json({ 
      success: true, 
      message: '✅ Data berhasil diperbarui', 
      data: updatedData 
    });
  } catch (err) {
    console.error("❌ PUT error:", err);
    
    // Prisma error P2025 = Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Data tidak ditemukan' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Gagal memperbarui data", 
      error: err.message 
    });
  }
};

// ==========================
// 🔹 DELETE — hapus data
// ==========================
export const deleteData = async (req, res) => {
  try {
    const idRaw = req.params.id;
    const id = Number(idRaw);
    
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "ID tidak valid" 
      });
    }

    const deleted = await prisma.relevansi_pkm.delete({
      where: { id }
    });

    res.json({ 
      success: true, 
      message: '🗑️ Data berhasil dihapus', 
      data: deleted 
    });
  } catch (err) {
    console.error("❌ DELETE error:", err);
    
    // Prisma error P2025 = Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        message: 'Data tidak ditemukan' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Gagal menghapus data", 
      error: err.message 
    });
  }
};

// ==========================
// 🔹 IMPORT Excel
// ==========================
export const importExcel = [
  upload.single("file"),
  async (req, res) => {
    try {
      const subtab = req.body.type;
      
      if (!subtab) {
        return res.status(400).json({ 
          success: false, 
          message: "Parameter 'type' wajib diisi" 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "File tidak ditemukan. Upload file Excel terlebih dahulu." 
        });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "File Excel kosong atau tidak memiliki data" 
        });
      }

      // Preview mode - kirim 10 baris pertama
      if (req.body.preview === "true") {
        return res.json({
          success: true,
          message: "Preview import berhasil",
          previewRows: rows.slice(0, 10),
          headers: Object.keys(rows[0]),
          totalRows: rows.length,
        });
      }

      // Commit import - simpan ke database
      let added = 0;
      let failed = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        try {
          const row = rows[i];
          
          // Convert keys ke snake_case
          const snakeRow = convertKeysToSnake(row);
          
          await prisma.relevansi_pkm.create({
            data: {
              subtab,
              ...snakeRow
            }
          });
          
          added++;
        } catch (err) {
          failed++;
          errors.push({ 
            row: i + 1, 
            error: err.message 
          });
          console.error(`Error row ${i + 1}:`, err.message);
        }
      }

      res.json({ 
        success: true, 
        message: `✅ Import selesai: ${added} berhasil, ${failed} gagal`, 
        added,
        failed,
        errors: failed > 0 ? errors : undefined
      });
    } catch (err) {
      console.error("❌ Import error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Gagal mengimpor file", 
        error: err.message 
      });
    }
  },
];

// ==========================
// 🔹 GET ALL (tanpa filter subtab)
// ==========================
export const getAllData = async (req, res) => {
  try {
    const result = await prisma.relevansi_pkm.findMany({
      orderBy: [
        { subtab: 'asc' },
        { id: 'asc' }
      ]
    });

    const dataWithCamelCase = result.map(row => convertKeysFromSnake(row));

    res.json({ 
      success: true, 
      data: dataWithCamelCase,
      count: dataWithCamelCase.length 
    });
  } catch (err) {
    console.error("❌ GET ALL error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Gagal mengambil semua data", 
      error: err.message 
    });
  }
};