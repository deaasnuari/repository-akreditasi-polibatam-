'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


export default function ReviewerLKPS() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/p4m/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/p4m/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/p4m/lkps/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/p4m/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/p4m/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/p4m/lkps/diferensiasi-misi' },
  ];

  const subTabs = [
    { label: 'Tupoksi', href: '/dashboard/p4m/lkps/tupoksi' },
    { label: 'Pendanaan', href: '/dashboard/p4m/lkps/pendanaan' },
    { label: 'Penggunaan Dana', href: '/dashboard/p4m/lkps/penggunaan-dana' },
    { label: 'EWMP', href: '/dashboard/p4m/lkps/ewmp' },
    { label: 'KTK', href: '/dashboard/p4m/lkps/ktk' },
    { label: 'SPMI', href: '/dashboard/p4m/lkps/spmi' },
  ];

  // Render Page
  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-900" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Laporan Kinerja Program Studi (LKPS)</h1>
                <p className="text-sm text-gray-600">Kelola data kuantitatif berdasarkan kriteria akreditasi</p>
              </div>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map(tab => (
              <Link 
                key={tab.href} 
                href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  pathname === tab.href 
                    ? 'bg-blue-900 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Sub-tabs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {subTabs.map(tab => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`border-b-2 py-4 px-1 text-sm font-medium ${
                      pathname === tab.href
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Instruksi */}
            <div className="text-center py-8 text-gray-500">
              Pilih salah satu sub-tab untuk melihat data LKPS
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}