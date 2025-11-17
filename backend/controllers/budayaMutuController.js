import { PrismaClient } from "@prisma/client";
import multer from "multer";
import xlsx from "xlsx";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

// ======================
// 🟦 GET DATA BY TYPE
// ======================
export const getData = async (req, res) => {
  const { type } = req.query;
  try {
    const data = await prisma.budaya_mutu.findMany({
      where: { type },
      orderBy: { id: "asc" },
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data" });
  }
};

// ======================
// 🟩 CREATE DATA
// ======================
export const createData = async (req, res) => {
  const { type, data } = req.body;

  try {
    const created = await prisma.budaya_mutu.create({
      data: {
        type,
        data,
      },
    });

    res.json({ success: true, data: created });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan data" });
  }
};

// ======================
// 🟧 UPDATE DATA
// ======================
export const updateData = async (req, res) => {
  const { id } = req.params;
  const { type, data } = req.body;

  try {
    const updated = await prisma.budaya_mutu.update({
      where: { id: Number(id) },
      data: {
        type,
        data,
        updated_at: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal update data" });
  }
};

// ======================
// 🟥 DELETE DATA
// ======================
export const deleteData = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.budaya_mutu.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "Data berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal hapus data" });
  }
};

// ======================
// 📤 IMPORT EXCEL
// ======================
export const importExcel = async (req, res) => {
  const { type } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Tidak ada file diupload" });
  }

  try {
    const filePath = path.resolve(req.file.path);
    const workbook = xlsx.readFile(filePath);
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    const rows = sheet.map(row => ({
      namaKetua: row.__EMPTY || row["Nama Ketua"] || "",
      periode: row.__EMPTY_1 || row["Periode Jabatan"] || "",
      pendidikanTerakhir: row.__EMPTY_2 || row["Pendidikan Terakhir"] || "",
      jabatanFungsional: row.__EMPTY_3 || row["Jabatan Fungsional"] || "",
      tugasPokokDanFungsi: row.__EMPTY_4 || row["Tugas Pokok dan Fungsi"] || "",
      unitKerja: row["Tabel 1.A.1 - Pimpinan dan Tupoksi UPPS dan PS"] || row["Unit Kerja"] || "",
    })).filter(r => r.namaKetua.toLowerCase() !== "nama ketua");

    // insert menggunakan prisma
    for (const row of rows) {
      await prisma.budaya_mutu.create({
        data: {
          type,
          data: row,
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

// ======================================================
// 🏗 STRUKTUR ORGANISASI (CRUD FILE)
// ======================================================

// UPLOAD FILE STRUKTUR
export const uploadStruktur = async (req, res) => {
  const file = req.file;

  if (!file)
    return res.status(400).json({ success: false, message: "Tidak ada file diunggah" });

  try {
    const saved = await prisma.struktur_files.create({
      data: {
        nama_file: file.originalname,
        file_path: file.path,
      },
    });

    res.json({
      success: true,
      message: "File berhasil diupload",
      fileId: saved.id,
      fileUrl: `/uploads/struktur/${path.basename(file.path)}`,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal upload file" });
  }
};

// GET TERBARU
export const getStruktur = async (req, res) => {
  try {
    const file = await prisma.struktur_files.findFirst({
      orderBy: {
        created_at: "desc",
      },
    });

    if (!file) return res.json({ success: true, file: null });

    res.json({
      success: true,
      file: {
        id: file.id,
        fileName: file.nama_file,
        fileUrl: `/uploads/struktur/${path.basename(file.file_path)}`,
        createdAt: file.created_at,
      },
    });
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil file" });
  }
};

// UPDATE FILE STRUKTUR
export const updateStruktur = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  try {
    const old = await prisma.struktur_files.findUnique({
      where: { id: Number(id) },
    });

    if (!old)
      return res.status(404).json({ success: false, message: "File tidak ditemukan" });

    if (fs.existsSync(old.file_path)) {
      fs.unlinkSync(old.file_path);
    }

    await prisma.struktur_files.update({
      where: { id: Number(id) },
      data: {
        nama_file: file.originalname,
        file_path: file.path,
        created_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: "File berhasil diupdate",
      fileUrl: `/uploads/struktur/${path.basename(file.path)}`,
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal update file" });
  }
};

// DELETE FILE
export const deleteStruktur = async (req, res) => {
  const { id } = req.params;

  try {
    const file = await prisma.struktur_files.findUnique({
      where: { id: Number(id) },
    });

    if (!file)
      return res.status(404).json({ success: false, message: "File tidak ditemukan" });

    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    await prisma.struktur_files.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "File berhasil dihapus" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus file" });
  }
};
