"use client";
import { Upload, FileText } from "lucide-react";

export default function ReviewerLKPS() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Reviewer LKPS (Laporan Kinerja Program Studi)</h1>
      <p className="text-gray-600">Kelola data kuantitatif program studi berdasarkan kriteria akreditasi</p>

      <div className="bg-blue-50 text-blue-800 text-sm rounded-lg px-4 py-3">
        <strong>Mode Reviewer:</strong> Anda dapat melihat semua data LKPS dalam mode read only.
      </div>

      {/* Tabs */}
      <div className="flex gap-2 text-sm">
        {["Budaya Mutu", "Relevansi Pendidikan", "Relevansi Penelitian", "Relevansi PKM", "Akuntabilitas", "Diferensiasi Misi"].map((tab) => (
          <button key={tab} className="px-3 py-1 border-b-2 border-transparent hover:border-blue-600">
            {tab}
          </button>
        ))}
      </div>

      {/* Struktur Organisasi */}
      <div className="bg-white shadow rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Struktur Organisasi</h2>
        <div className="border-2 border-dashed rounded-lg h-40 flex flex-col items-center justify-center text-gray-500">
          <Upload className="mb-2" />
          <p>Klik untuk upload atau drag & drop file struktur organisasi</p>
          <p className="text-xs text-gray-400">PNG, JPG, atau PDF (maks. 5MB)</p>
        </div>
      </div>

      {/* Data Tupoksi */}
      <div className="bg-white shadow rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Data Tupoksi</h2>
          <div className="flex gap-2">
            <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded flex items-center gap-1 text-sm">
              <FileText size={14} /> Export
            </button>
          </div>
        </div>

        <table className="w-full text-sm border-t">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-2">Unit Kerja</th>
              <th className="py-2 px-2">Nama Ketua</th>
              <th className="py-2 px-2">Periode</th>
              <th className="py-2 px-2">Jabatan</th>
              <th className="py-2 px-2">Pendidikan</th>
              <th className="py-2 px-2">Tupoksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-2 px-2">Program Studi Teknik Informatika</td>
              <td className="py-2 px-2">Dr. Ahmad Subagyo, Mkom</td>
              <td className="py-2 px-2">2020–2024</td>
              <td className="py-2 px-2">Ketua Program Studi</td>
              <td className="py-2 px-2">S3 Ilmu Komputer</td>
              <td className="py-2 px-2">Memimpin Penyelenggaraan Program Studi</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
