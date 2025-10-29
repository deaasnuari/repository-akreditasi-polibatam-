"use client";
import React, { useState } from "react";
import { Upload, CheckCircle, Clock, XCircle, Eye, Edit2 } from "lucide-react";

export default function BuktiPendukungPage() {
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");

  const dummyData = [
    {
      judul: "SK Pendirian Program Studi",
      jenis: "Surat Keputusan",
      kategori: "Umum",
      file: "SK_Pendirian_2023.pdf",
      size: "2.3 MB",
      tanggal: "2024-12-15",
      uploadBy: "TU Admin",
      status: "Diterima",
    },
    {
      judul: "Data Mahasiswa 2023",
      jenis: "Spreadsheet",
      kategori: "LKPS",
      file: "Data_Mahasiswa_2023.xlsx",
      size: "1.8 MB",
      tanggal: "2024-12-15",
      uploadBy: "TU Admin",
      status: "Menunggu",
    },
  ];

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[#183A64]">
            Bukti Pendukung
          </h1>
          <p className="text-gray-600">
            Kelola dokumen bukti pendukung akreditasi
          </p>
        </div>

        <button className="flex items-center gap-2 bg-[#183A64] hover:bg-[#2A4F85] text-white px-4 py-2 rounded-lg shadow transition">
          <Upload size={18} />
          Upload Dokumen
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Dokumen" value="2" />
        <StatCard title="Diterima" value="1" icon={<CheckCircle className="text-green-600" />} />
        <StatCard title="Menunggu" value="1" icon={<Clock className="text-yellow-500" />} />
        <StatCard title="Perlu Revisi" value="1" icon={<XCircle className="text-red-500" />} />
      </div>

      {/* Filter */}
      <div className="bg-gray-100 rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option>Semua Status</option>
            <option>Diterima</option>
            <option>Menunggu</option>
            <option>Perlu Revisi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Kategori
          </label>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option>Semua Kategori</option>
            <option>Umum</option>
            <option>LKPS</option>
          </select>
        </div>
      </div>

      {/* Tabel Dokumen */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="px-4 py-2 font-semibold">Judul Dokumen</th>
              <th className="px-4 py-2 font-semibold">Jenis</th>
              <th className="px-4 py-2 font-semibold">Kategori</th>
              <th className="px-4 py-2 font-semibold">File</th>
              <th className="px-4 py-2 font-semibold">Tanggal Upload</th>
              <th className="px-4 py-2 font-semibold">Upload By</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((item, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2">{item.judul}</td>
                <td className="px-4 py-2">{item.jenis}</td>
                <td className="px-4 py-2">
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                    {item.kategori}
                  </span>
                </td>
                <td className="px-4 py-2 text-blue-600 underline cursor-pointer">
                  {item.file} <span className="text-xs text-gray-400">({item.size})</span>
                </td>
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">{item.uploadBy}</td>
                <td className="px-4 py-2">
                  {item.status === "Diterima" && (
                    <CheckCircle className="text-green-600" size={18} />
                  )}
                  {item.status === "Menunggu" && (
                    <Clock className="text-yellow-500" size={18} />
                  )}
                  {item.status === "Perlu Revisi" && (
                    <XCircle className="text-red-500" size={18} />
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2 justify-center">
                  <button
                    title="Lihat"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    title="Edit"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* === KOMPONEN === */
function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span>{icon}</span>}
        <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-[#183A64]">{value}</p>
    </div>
  );
}
