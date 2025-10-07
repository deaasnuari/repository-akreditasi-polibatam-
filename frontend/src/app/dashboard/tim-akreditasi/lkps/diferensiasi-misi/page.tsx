'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FileText, Download, Save, Upload } from 'lucide-react';


export default function diferensiasiPage() {
  const pathname = usePathname();

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">

          {/* Header LKPS */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-start">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-blue-900" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Laporan Kinerja Program Studi (LKPS)</h1>
                <p className="text-sm text-gray-600">Kelola data kuantitatif berdasarkan kriteria akreditasi</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} /> Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Save size={16} /> Save Draft
              </button>
            </div>
          </div>

          {/* Tabs utama LKPS */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  pathname === tab.href
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Konten halaman */}
          <div className="bg-white rounded-lg shadow p-6">

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Diferensiasi Misi</h2>
            {/* Kotak Visi dan Misi */}
            <div className="grid md:grid-cols-1 gap-4 mb-8">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Visi Perguruan Tinggi</h3>
                <p className="text-gray-700">Menjadi perguruan tinggi terkemuka dalam pengembangan ilmu pengetahuan dan teknologi terapan di tingkat nasional dan internasional.</p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Visi UPPS</h3>
                <p className="text-gray-700">Menjadi unit pengelola program studi yang unggul dan berdaya saing tinggi dalam bidang teknologi informasi dan manajemen.</p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Visi Program Studi</h3>
                <p className="text-gray-700">Menghasilkan lulusan yang berkompeten, profesional, dan adaptif terhadap perkembangan teknologi informasi.</p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Misi Perguruan Tinggi</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Menyelenggarakan pendidikan tinggi yang berkualitas.</li>
                  <li>Mengembangkan penelitian terapan yang bermanfaat bagi masyarakat.</li>
                  <li>Menjalin kerja sama strategis dengan dunia industri.</li>
                </ul>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Misi UPPS</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Mengelola program studi secara efisien dan efektif.</li>
                  <li>Menjamin mutu akademik dan administrasi.</li>
                  <li>Mendukung inovasi dalam pendidikan dan riset.</li>
                </ul>
              </div>
            </div>

            {/* Upload Dokumen Pendukung */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Dokumen Pendukung</h3>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500">Klik untuk upload atau drag & drop file struktur organisasi</p>
                </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
