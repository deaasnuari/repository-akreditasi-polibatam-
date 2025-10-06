'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, FileText, BookOpen, Upload, BarChart3, Download, Menu, X, LogOut } from 'lucide-react';

export default function LayoutTimAkreditasi({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex w-full bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex-shrink-0 sticky top-0 h-screen flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">RA</span>
            </div>
            <div>
              <h2 className="font-bold text-sm">Repository Akreditasi</h2>
              <p className="text-xs text-gray-600">POLIBATAM</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 mb-3">MENU UTAMA</h3>
          <nav className="space-y-1">
            <Link href="/dashboard/tim-akreditasi" className="block">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
                <Home size={18} />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link href="/dashboard/tim-akreditasi/lkps" className="block">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
                <FileText size={18} />
                <span>LKPS</span>
              </div>
            </Link>
            <Link href="/dashboard/tim-akreditasi/led" className="block">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
                <BookOpen size={18} />
                <span>LED</span>
              </div>
            </Link>
            <Link href="/dashboard/tim-akreditasi/bukti-pendukung" className="block">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
                <Upload size={18} />
                <span>Bukti Pendukung</span>
              </div>
            </Link>
            <Link href="/dashboard/tim-akreditasi/matriks-penilaian" className="block">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
                <BarChart3 size={18} />
                <span>Matriks Penilaian</span>
              </div>
            </Link>
            <Link href="/dashboard/tim-akreditasi/export" className="block">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
                <Download size={18} />
                <span>Export</span>
              </div>
            </Link>
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
      <div className="flex-1 relative">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-20 left-4 z-50 p-2 bg-blue-900 text-white rounded-lg shadow-lg hover:bg-blue-800 transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Child Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
