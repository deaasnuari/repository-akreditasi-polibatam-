import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ======================
// GET DATA BY SUBTAB
// ======================
export const getData = async (req, res) => {
  const { subtab } = req.query;
  const userId = req.user?.id; // Assuming auth middleware sets req.user

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const data = await prisma.akuntabilitas.findMany({
      where: { subtab, user_id: userId },
      orderBy: { id: "asc" },
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data" });
  }
};

// ======================
// CREATE DATA
// ======================
export const createData = async (req, res) => {
  const { subtab, data } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const created = await prisma.akuntabilitas.create({
      data: {
        subtab,
        data,
        user_id: userId,
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
  const { subtab, data } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const updated = await prisma.akuntabilitas.update({
      where: { id: Number(id), user_id: userId },
      data: {
        subtab,
        data,
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

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await prisma.akuntabilitas.delete({
      where: { id: Number(id), user_id: userId },
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
  const { type } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Tidak ada file yang diupload" });
  }

  try {
    const filePath = path.resolve(req.file.path);
    const workbook = xlsx.readFile(filePath);
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    const rows = sheet.map((row) => ({
      ...row, // semua kolom dimasukkan
    }));

    for (const r of rows) {
      await prisma.akuntabilitas.create({
        data: {
          subtab: type,
          data: r,
          user_id: userId,
        },
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: "Data berhasil diimport",
      count: rows.length,
    });
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal import data" });
  }
};
