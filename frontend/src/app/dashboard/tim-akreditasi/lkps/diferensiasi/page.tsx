'use client';

import React, { useState } from 'react';
import { Home, FileText, BookOpen, Upload, BarChart3, Download, Menu, X, LogOut, Save } from 'lucide-react';

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
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex-shrink-0 sticky top-0 h-screen flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">IP</span>
            </div>
            <div>
              <h2 className="font-bold text-sm">INFRA</h2>
              <p className="text-xs text-gray-600">POLIBATAM</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 mb-3">MENU UTAMA</h3>
          <nav className="space-y-1">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.active 
                    ? 'bg-blue-50 text-blue-900 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} />
                <span className="text-left text-xs">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full">
        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="fixed top-20 left-4 z-50 p-2 bg-blue-900 text-white rounded-lg shadow-lg hover:bg-blue-800 transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

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
              <p className="text-gray-700">Konten untuk <b>Budaya Mutu</b> akan ditampilkan di sini.</p>
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
