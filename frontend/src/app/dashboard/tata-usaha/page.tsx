'use client';

import React from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';

export default function DashboardTataUsaha() {
  const notifikasi = [
    { title: 'User Baru', desc: 'Pengguna baru telah didaftarkan dalam sistem' },
    { title: 'Update Profil', desc: 'Profil Anda telah diperbarui' }
  ];

  return (
    <div className="w-full">
      {/* Dashboard Content */}
      <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Main Dashboard Cards - 2 Wide Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card 1: Manajemen Akun - Clickable */}
          <Link href="/dashboard/tata-usaha/manajemen-akun">
            <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="text-blue-900" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">Manajemen Akun</h3>
                  <p className="text-sm text-gray-600">Kelola data pengguna sistem</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 mt-4 space-y-2">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-900 rounded-full"></span>
                  Tambah, edit, dan hapus akun pengguna
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-900 rounded-full"></span>
                  Atur role dan status pengguna
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-900 rounded-full"></span>
                  Kelola akses dan permission sistem
                </p>
              </div>
              <button className="w-full mt-6 px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                Kelola Akun
              </button>
            </div>
          </Link>
        </div>

      </main>
    </div>
  );
}


