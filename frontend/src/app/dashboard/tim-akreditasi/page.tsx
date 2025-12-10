'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Home, FileText, BookOpen, Upload, BarChart3, Download, Menu, X, Bell, User, Search, LogOut } from 'lucide-react';


export default function DashboardAkreditasi() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FileText, label: 'Laporan Kinerja Program Studi (LKPS)' },
    { icon: BookOpen, label: 'Laporan Evaluasi Diri (LED)' },
    { icon: Upload, label: 'Bukti Pendukung' },
    { icon: BarChart3, label: 'Matriks Penilaian' },
    { icon: Download, label: 'Export' }
  ];



  const notifikasi = [
    { title: 'Revisi Dokumen', desc: 'Dokumen LKPS Bagian 1 harus direvisi karena data kurang lengkap' },
    { title: 'Upload Berhasil', desc: 'Dokumen bukti pendukung berhasil diupload' }
  ];

  useEffect(() => {
    // Selalu set ke waktu sekarang setiap kali halaman dibuka
    setLastLogin(new Date().toISOString());
    
    // Close notification dropdown when clicking outside
    const handleClickOutside = (event) => {
      const target = event.target;
      if (notifOpen && !target.closest('.notification-container')) {
        setNotifOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const lastLoginText = useMemo(() => {
    if (!lastLogin) return null;
    try {
      const d = new Date(lastLogin);
      const formatter = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta'
      });
      return formatter.format(d) + ' WIB';
    } catch {
      return null;
    }
  }, [lastLogin]);

  return (
    <div className="flex w-full bg-gray-100">
      

      {/* Main Content */}
      <div className="flex-1 w-full">
        {/* Dashboard Content */}
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Info Banner with Notification */}
          <div className="bg-blue-100 border-l-4 border-blue-900 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="font-bold text-blue-900 mb-1">Repository Digital Data Akreditasi</h2>
                <p className="text-sm text-blue-800">Politeknik Negeri Batam</p>
                <p className="text-xs text-blue-700 mt-2">Sistem terintegrasi untuk mengelola dokumen akreditasi institusi dan program studi</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-blue-800">Terakhir Login</p>
                  {lastLoginText ? (
                    <p className="font-semibold text-blue-900">{lastLoginText}</p>
                  ) : (
                    <p className="text-sm text-blue-900">-</p>
                  )}
                </div>
                <div className="relative notification-container">
                  <button 
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 hover:bg-blue-200 rounded-full transition-colors"
                    aria-label="Notifikasi"
                  >
                    <Bell className="text-blue-900" size={24} />
                    {notifikasi.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-100 animate-pulse"></span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fadeIn">
                      <div className="p-4 border-b border-gray-200 bg-blue-50">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-gray-800">Notifikasi</h3>
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">{notifikasi.length}</span>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifikasi.length > 0 ? (
                          notifikasi.map((item, idx) => (
                            <div key={idx} className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm text-gray-800">{item.title}</h4>
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0 ml-2"></div>
                              </div>
                              <p className="text-xs text-gray-600">{item.desc}</p>
                              <p className="text-xs text-gray-400 mt-2">Baru saja</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                          </div>
                        )}
                      </div>
                      {notifikasi.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <button className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-medium">
                            Tandai semua sudah dibaca
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                    
                  </div>
                </div>
              </div>
            </Link>

            {/* Progress LED - Clickable */}
            <Link href="/dashboard/tim-akreditasi/led">
              <div className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-green-700" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-700">Progress LED</h3>
                </div>
                <div className="relative pt-1">
                  <div className="flex items-center justify-center">
                    
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
                <div className="text-left mt-4">
                  
                  <p className="text-xs text-gray-600 mt-1">Dokumen terupload</p>
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
               
              </div>
            </Link>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 gap-6">
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