"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, FileText } from "lucide-react";

export default function ReviewerLKPS() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState<'struktur' | 'tupoksi'>('struktur');

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Reviewer LKPS (Laporan Kinerja Program Studi)</h1>
      <p className="text-gray-600">Kelola data kuantitatif program studi berdasarkan kriteria akreditasi</p>

      <div className="bg-blue-50 text-blue-800 text-sm rounded-lg px-4 py-3">
        <strong>Mode Reviewer:</strong> Anda dapat melihat semua data LKPS dalam mode read only.
      </div>

      {/* Tabs utama (mirip dengan tim-akreditasi) */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${pathname === tab.href ? 'bg-[#183A64] text-[#ADE7F7]' : 'bg-gray-100 text-gray-700 hover:bg-[#ADE7F7] hover:text-[#183A64]'}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Sub-tabs untuk konten dalam halaman reviewer agar selaras dengan tim-akreditasi */}
      <div className="bg-white shadow rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Laporan Kinerja Program Studi</h2>
          <div className="flex gap-2">
            <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded flex items-center gap-1 text-sm">
              <FileText size={14} /> Export
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b pb-2 mb-4">
          <button
            onClick={() => setActiveSubTab('struktur')}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold ${
              activeSubTab === 'struktur' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Struktur Organisasi
          </button>
          <button
            onClick={() => setActiveSubTab('tupoksi')}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold ${
              activeSubTab === 'tupoksi' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Data Tupoksi
          </button>
        </div>

        {/* Konten Sub-tab: Struktur Organisasi */}
        {activeSubTab === 'struktur' && (
          <div className="space-y-3">
            <h3 className="font-semibold">Struktur Organisasi</h3>
            <div className="border-2 border-dashed rounded-lg h-40 flex flex-col items-center justify-center text-gray-500">
              <Upload className="mb-2" />
              <p>Klik untuk melihat atau mengunggah file struktur organisasi</p>
              <p className="text-xs text-gray-400">PNG, JPG, atau PDF (maks. 5MB)</p>
            </div>
          </div>
        )}

        {/* Konten Sub-tab: Data Tupoksi */}
        {activeSubTab === 'tupoksi' && (
          <div className="bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Data Tupoksi</h3>
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
        )}
      </div>
    </div>
  );
}
