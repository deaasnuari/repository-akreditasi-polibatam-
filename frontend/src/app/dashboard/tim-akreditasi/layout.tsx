'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Irish_Grover, Poppins } from 'next/font/google';
import { Home, FileText, BookOpen, Upload, BarChart3, Download, Menu, X, LogOut } from 'lucide-react';

// === FONT GOOGLE ===
const irishGrover = Irish_Grover({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-irish-grover',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
});

export default function LayoutTimAkreditasi({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-[#183A64] text-white transition-all duration-300 overflow-hidden flex-shrink-0 sticky top-0 h-screen flex flex-col`}
      >
        {/* Header Sidebar */}
        <div className="p-6 border-b border-[#ADE7F7]/30 flex items-center gap-2">
        <div className={`${irishGrover.variable} font-['Irish_Grover'] leading-tight`}>
          <div className="w-16 h-16 bg-[#ADE7F7] rounded-full flex items-center justify-center">
            <span className="text-[#183A64] font-bold text-lg">ReDDA</span>
          </div>
          </div>
          <div className={`${irishGrover.variable} font-['Irish_Grover'] leading-tight`}>
            <h2 className="text-[#ADE7F7] text-lg font-normal -mt-3">
              Repository Akreditasi
            </h2>
            <p className="text-[#ADE7F7] text-sm ">POLIBATAM</p>
          </div>
        </div>

        {/* === MENU === */}
       <div className={`${poppins.variable} font-bold leading-loose flex-1 flex flex-col justify-between`}>

        <div className="flex flex-col h-full">
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-[#ADE7F7] mb-3 tracking-wider">
              MENU UTAMA
            </h3>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href} className="block">
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-[#ADE7F7] text-[#183A64]'
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

          {/* === LOGOUT BUTTON === */}
          <div className="p-4 border-t border-[#FF7F00]/30">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#ADE7F7] text-[#183A64] rounded-lg font-bold hover:bg-[#FF7F00] transition">
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
