'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Poppins } from 'next/font/google';
import {
  Home,
  FileText,
  BookOpen,
  Upload,
  BarChart3,
  Download,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

// === Import font Poppins ===
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function LayoutTimAkreditasi({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ Default tertutup
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard/tim-akreditasi', icon: <Home size={18} /> },
    { name: 'LKPS', href: '/dashboard/tim-akreditasi/lkps', icon: <FileText size={18} /> },
    { name: 'LED', href: '/dashboard/tim-akreditasi/led', icon: <BookOpen size={18} /> },
    { name: 'Bukti Pendukung', href: '/dashboard/tim-akreditasi/bukti-pendukung', icon: <Upload size={18} /> },
    { name: 'Matriks Penilaian', href: '/dashboard/tim-akreditasi/matriks-penilaian', icon: <BarChart3 size={18} /> },
    { name: 'Export', href: '/dashboard/tim-akreditasi/export', icon: <Download size={18} /> },
  ];

  return (
    <div className={`flex w-full bg-gray-100 ${poppins.variable} font-sans`}>
      {/* === SIDEBAR === */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-[#183A64] text-white transition-all duration-300 overflow-hidden flex-shrink-0 sticky top-0 h-screen flex flex-col`}
      >
        {/* === Header Sidebar === */}
        <div className="p-6 border-b border-[#ADE7F7]/30 flex items-center gap-3">
          <div className="w-24 aspect-square bg-[#ADE7F7] rounded-full flex items-center justify-center text-[#183A64] font-bold text-xl shadow-md">
            ReDDA
          </div>

          <div>
            <h2 className="text-[#ADE7F7] text-lg font-bold leading-tight">
              Repository Akreditasi
            </h2>
            <p className="text-[#ADE7F7]/80 text-sm font-bold">POLIBATAM</p>
          </div>
        </div>

        {/* === Menu === */}
        <div className="flex-1 flex flex-col justify-between font-medium">
          <div className="flex flex-col h-full">
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-xs font-bold text-[#ADE7F7] mb-3 tracking-wider">
                MENU UTAMA
              </h3>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.name !== 'Dashboard' && pathname.startsWith(item.href + '/'));

                  return (
                    <Link key={item.name} href={item.href} className="block">
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                          isActive
                            ? 'bg-[#ADE7F7] text-[#183A64] font-semibold'
                            : 'hover:bg-[#ADE7F7]/30 hover:text-[#ADE7F7]'
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* === Tombol Logout === */}
          <div className="p-4 border-t border-[#FF7F00]/30">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#ADE7F7] text-[#183A64] rounded-lg font-semibold hover:bg-[#FF7F00] hover:text-white transition">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 relative">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-20 left-4 z-50 p-2 bg-[#183A64] text-white rounded-lg shadow-lg hover:bg-[#2A4F85] transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Child Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}