import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ======================
// GET DATA BY TYPE
// ======================
export const getData = async (req, res) => {
  const { type } = req.query;
  try {
    const data = await prisma.akuntabilitas.findMany({
      where: { type },
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
  const { type, data } = req.body;

  try {
    const created = await prisma.akuntabilitas.create({
      data: {
        type,
        data,
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
  const { type, data } = req.body;

  try {
    const updated = await prisma.akuntabilitas.update({
      where: { id: Number(id) },
      data: {
        type,
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

  try {
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
  const { type } = req.params;

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
          type,
          data: r,
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
