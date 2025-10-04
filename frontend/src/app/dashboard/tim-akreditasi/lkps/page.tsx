'use client';

import React, { useState } from 'react';
import { Home, FileText, BookOpen, Upload, BarChart3, Download, Menu, X, LogOut, Save, Plus } from 'lucide-react';

export default function LKPSPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('budaya-mutu');

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: false },
    { icon: FileText, label: 'Laporan Kinerja Program Studi (LKPS)', active: true },
    { icon: BookOpen, label: 'Laporan Evaluasi Diri (LED)' },
    { icon: Upload, label: 'Bukti Pendukung' },
    { icon: BarChart3, label: 'Matriks Penilaian' },
    { icon: Download, label: 'Export' }
  ];

  const tabs = [
    { id: 'budaya-mutu', label: 'Budaya Mutu' },
    { id: 'relevansi-pendidikan', label: 'Relevansi Pendidikan' },
    { id: 'relevansi-penelitian', label: 'Relevansi Penelitian' },
    { id: 'relevansi-pkm', label: 'Relevansi PKM' },
    { id: 'akuntabilitas', label: 'Akuntabilitas' },
    { id: 'diferensiasi-misi', label: 'Diferensiasi Misi' }
  ];

  return (
    <div className="flex w-full bg-gray-100">
     
      {/* Main Content */}
      <div className="flex-1 w-full">
        {/* Toggle Button */}
        

        {/* Content */}
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-blue-900" size={32} />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Laporan Kinerja Program Studi (LKPS)</h1>
                    <p className="text-sm text-gray-600">Kelola data kuantitatif program studi berdasarkan kriteria akreditasi</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download size={16} />
                  <span className="text-sm">Export PDF</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Save size={16} />
                  <span className="text-sm">Save Draft</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  <FileText size={16} />
                  <span className="text-sm">Submit</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Konten Tab */}
          <div className="bg-white rounded-lg shadow p-6">
           {activeTab === 'budaya-mutu' && (
  <div className="space-y-6">
    {/* Info Box */}
    <div className="bg-blue-50 border-l-4 border-blue-900 p-4 rounded">
      <h3 className="font-bold text-blue-900 mb-1">Budaya Mutu</h3>
      <p className="text-sm text-blue-800">Kelola data organisasi, pengelolaan dana, dan SDM dosen.</p>
    </div>

    {/* Struktur Organisasi */}
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Struktur Organisasi</h3>
        <button className="px-3 py-1 bg-blue-900 text-white text-sm rounded hover:bg-blue-800">
          Upload Struktur Organisasi
        </button>
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <Upload className="mx-auto text-gray-400 mb-2" size={48} />
        <p className="text-gray-500">Klik untuk upload atau drag & drop file struktur organisasi</p>
      </div>
    </div>

    {/* Tabel Pimpinan & Tupoksi */}
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Tabel Pimpinan & Tupoksi UPPS dan PS</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors">
            <Plus size={16} />
            Tambah Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold">Unit Kerja</th>
              <th className="px-6 py-3 font-semibold">Nama Ketua</th>
              <th className="px-6 py-3 font-semibold">Periode Jabatan</th>
              <th className="px-6 py-3 font-semibold">Pendidikan Terakhir</th>
              <th className="px-6 py-3 font-semibold">Jabatan Fungsional</th>
              <th className="px-6 py-3 font-semibold">Tupoksi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">Program Studi Teknik Informatika</td>
              <td className="px-6 py-4">Dr. Ahmad Subarjo, M.Kom</td>
              <td className="px-6 py-4">2020-2024</td>
              <td className="px-6 py-4">S3 Ilmu Komputer</td>
              <td className="px-6 py-4">Ketua Program Studi</td>
              <td className="px-6 py-4">Memimpin penyelenggaraan program studi</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}














            {activeTab === 'relevansi-pendidikan' && (
              <p className="text-gray-700">Konten untuk <b>Relevansi Pendidikan</b> akan ditampilkan di sini.</p>
            )}
            {activeTab === 'relevansi-penelitian' && (
              <p className="text-gray-700">Konten untuk <b>Relevansi Penelitian</b> akan ditampilkan di sini.</p>
            )}
            {activeTab === 'relevansi-pkm' && (
              <p className="text-gray-700">Konten untuk <b>Relevansi PKM</b> akan ditampilkan di sini.</p>
            )}
            {activeTab === 'akuntabilitas' && (
              <p className="text-gray-700">Konten untuk <b>Akuntabilitas</b> akan ditampilkan di sini.</p>
            )}
            {activeTab === 'diferensiasi-misi' && (
              <p className="text-gray-700">Konten untuk <b>Diferensiasi Misi</b> akan ditampilkan di sini.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
