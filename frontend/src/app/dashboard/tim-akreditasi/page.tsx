'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, FileText, BookOpen, Upload, BarChart3, Download, Menu, X, Bell, User, Search, LogOut } from 'lucide-react';

export default function DashboardAkreditasi() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FileText, label: 'Laporan Kinerja Program Studi (LKPS)' },
    { icon: BookOpen, label: 'Laporan Evaluasi Diri (LED)' },
    { icon: Upload, label: 'Bukti Pendukung' },
    { icon: BarChart3, label: 'Matriks Penilaian' },
    { icon: Download, label: 'Export' }
  ];

  const aktivitasTerbaru = [
    { title: 'LKPS Bagian Matematika Diserahkan', time: '2 jam lalu' },
    { title: 'Dokumen Bukti Pendukung Diungggah', time: '5 jam lalu' },
    { title: 'LED sudah diselesaikan', time: '1 hari lalu' }
  ];

  const notifikasi = [
    { title: 'Revisi Dokumen', desc: 'Dokumen LKPS Bagian 1 harus direvisi karena data kurang lengkap' },
    { title: 'Upload Berhasil', desc: 'Dokumen bukti pendukung berhasil diupload' }
  ];

  return (
    <div className="flex w-full bg-gray-100">
      

      {/* Main Content */}
      <div className="flex-1 w-full">
        {/* Toggle Button - Fixed Position */}
       

        {/* Dashboard Content */}
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Info Banner */}
          <div className="bg-blue-100 border-l-4 border-blue-900 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-blue-900 mb-1">Repository Digital Data Akreditasi</h2>
                <p className="text-sm text-blue-800">Politeknik Negeri Batam</p>
                <p className="text-xs text-blue-700 mt-2">Sistem terintegrasi untuk mengelola dokumen akreditasi institusi dan program studi</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-800">Terakhir Login</p>
                <p className="font-semibold text-blue-900">Kamis, 25</p>
                <p className="text-sm text-blue-900">september 2025</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Progress LKPS - Clickable */}
            <Link href="/dashboard/tim-akreditasi/lkps">
              <div className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-blue-900" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-700">Progress LKPS</h3>
                </div>
                <div className="relative pt-1">
                  <div className="flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <svg className="transform -rotate-90 w-20 h-20">
                        <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="40" cy="40" r="36" stroke="#1e3a8a" strokeWidth="8" fill="none"
                          strokeDasharray="226" strokeDashoffset="56.5" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-900">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Progress IED - Clickable */}
            <Link href="/dashboard/tim-akreditasi/led">
              <div className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-green-700" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-700">Progress IED</h3>
                </div>
                <div className="relative pt-1">
                  <div className="flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <svg className="transform -rotate-90 w-20 h-20">
                        <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="40" cy="40" r="36" stroke="#15803d" strokeWidth="8" fill="none"
                          strokeDasharray="226" strokeDashoffset="56.5" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-green-700">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Dokumen Upload - Clickable */}
            <Link href="/dashboard/tim-akreditasi/bukti-pendukung">
              <div className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Upload className="text-orange-700" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-700">Dokumen Upload</h3>
                </div>
                <div className="text-center mt-4">
                  <div className="text-3xl font-bold text-orange-700">20</div>
                  <p className="text-xs text-gray-600 mt-1">Total dokumen terupload</p>
                </div>
              </div>
            </Link>

            {/* Status Akreditasi - Clickable */}
            <Link href="/dashboard/tim-akreditasi/matriks-penilaian">
              <div className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-purple-700" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-700">Status Akreditasi</h3>
                </div>
                <div className="text-center mt-4">
                  <div className="text-3xl font-bold text-purple-700">B</div>
                  <p className="text-xs text-gray-600 mt-1">Akreditasi Terakhir</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Aktivitas Terbaru */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-800 mb-4">Aktivitas Terbaru</h3>
              <div className="space-y-3">
                {aktivitasTerbaru.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-blue-900 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifikasi */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-800 mb-4">Notifikasi</h3>
              <div className="space-y-3">
                {notifikasi.map((item, idx) => (
                  <div key={idx} className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm text-gray-800">{item.title}</h4>
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Aksi Cepat */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-800 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/tim-akreditasi/bukti-pendukung">
                <button className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <Upload className="mx-auto mb-2 text-gray-600" size={32} />
                  <h4 className="font-semibold text-gray-800">Upload Dokumen</h4>
                  <p className="text-xs text-gray-600 mt-1">Unggah dokumen akreditasi baru</p>
                </button>
              </Link>
              
              <Link href="/dashboard/tim-akreditasi/bukti-pendukung">
                <button className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <FileText className="mx-auto mb-2 text-gray-600" size={32} />
                  <h4 className="font-semibold text-gray-800">Cari Dokumen</h4>
                  <p className="text-xs text-gray-600 mt-1">Pencarian dan unduh dengan filter</p>
                </button>
              </Link>
              
              <Link href="/dashboard/tim-akreditasi/matriks-penilaian">
                <button className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <BarChart3 className="mx-auto mb-2 text-gray-600" size={32} />
                  <h4 className="font-semibold text-gray-800">Lihat Statistik</h4>
                  <p className="text-xs text-gray-600 mt-1">Analisa laporan dari Laporan Data</p>
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}