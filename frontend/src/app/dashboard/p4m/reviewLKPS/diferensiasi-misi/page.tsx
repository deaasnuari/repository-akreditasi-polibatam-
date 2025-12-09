'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getReviews as fetchReviews, createReview as postReview } from '@/services/reviewService';


// --- Data item ---
interface DataItem {
  id?: number;
  tipe_data?: string;
  unit_kerja?: string;
  konten?: string;
}

export default function P4MReviewDiferensiasiMisiPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/dashboard/p4m/reviewLKPS/diferensiasi-misi');
  const [data, setData] = useState<DataItem[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const API_BASE = 'http://localhost:5000/api/diferensiasi-misi';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/p4m/reviewLKPS' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/p4m/reviewLKPS/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/p4m/reviewLKPS/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/p4m/reviewLKPS/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/p4m/reviewLKPS/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/p4m/reviewLKPS/diferensiasi-misi' },
  ];

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}?type=visi-misi`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!res.ok) throw new Error('Gagal fetch data');
      const json = await res.json();
      console.log('RESPON DARI BACKEND:', json);
      setData(json.data || json || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- View Detail ---
  const handleViewDetail = async (item: DataItem) => {
    setSelectedItem(item);
    setReviewNote('');
    setNotes([]);
    setShowDetail(true);
    try {
      setLoadingNotes(true);
      const existing = await fetchReviews('diferensiasi-misi', item.id);
      setNotes(existing || []);
    } catch (err) {
      console.error('Fetch notes error', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSaveReview = async () => {
    if (!selectedItem?.id) return;
    try {
      await postReview('diferensiasi-misi', selectedItem.id, reviewNote || '');
      const existing = await fetchReviews('diferensiasi-misi', selectedItem.id);
      setNotes(existing || []);
      setReviewNote('');
    } catch (err) {
      console.error('Save note error', err);
    }
  };

  // --- Render utama ---
  return (
    <div className="flex w-full bg-gray-100 min-h-screen">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Header LKPS */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-start">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-blue-900" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Review LKPS - P4M</h1>
                <p className="text-sm text-gray-600">Review data kuantitatif berdasarkan kriteria akreditasi</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} /> Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Save size={16} /> Save Review
              </button>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#183A64] text-[#ADE7F7] shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-[#ADE7F7] hover:text-[#183A64]'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Konten */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Judul Tabel */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Review Data Visi/Misi</h2>
              <p className="text-sm text-gray-600">Review dan evaluasi data visi dan misi program studi</p>
            </div>

            {/* Info P4M */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Mode Review P4M:</strong> Anda dapat melihat dan mengevaluasi data yang diinput oleh Tim Akreditasi
              </p>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-700 uppercase">
                    <th className="px-4 py-3 text-left">Tipe Data</th>
                    <th className="px-4 py-3 text-left">Unit Kerja</th>
                    <th className="px-4 py-3 text-left">Konten</th>
                    <th className="w-24 px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500">
                        Belum ada data untuk direview
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr key={item.id ?? `row-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{item.tipe_data}</td>
                        <td className="px-4 py-3">{item.unit_kerja}</td>
                        <td className="px-4 py-3">
                          <div className="max-w-md truncate">
                            {item.konten}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => handleViewDetail(item)} 
                            className="text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Detail */}
            {showDetail && selectedItem && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                  {/* Header Detail */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Detail Data Visi/Misi
                    </h2>
                    <button 
                      onClick={() => setShowDetail(false)} 
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Data
                      </label>
                      <p className="text-gray-900">{selectedItem.tipe_data}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Kerja
                      </label>
                      <p className="text-gray-900">{selectedItem.unit_kerja}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konten
                      </label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedItem.konten}</p>
                    </div>

                    {/* Area Catatan Review */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Sebelumnya</label>
                        {loadingNotes ? (
                          <p className="text-sm text-gray-500">Memuat catatan...</p>
                        ) : notes.length === 0 ? (
                          <p className="text-sm text-gray-500">Belum ada catatan</p>
                        ) : (
                          <div className="space-y-2 max-h-44 overflow-auto">
                            {notes.map((n) => (
                              <div key={n.id} className="border rounded p-3 bg-white">
                                <div className="text-xs text-gray-500">{n.user?.nama_lengkap || n.user?.username} • {new Date(n.created_at).toLocaleString()}</div>
                                <div className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{n.note}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tambahkan Catatan Review (Optional)
                        </label>
                        <textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Tambahkan catatan atau komentar review di sini..."
                          rows={4}
                          className="border p-3 rounded-lg w-full bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button 
                      onClick={() => setShowDetail(false)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Tutup
                    </button>
                    <button 
                      onClick={handleSaveReview}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                    >
                      Simpan Catatan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}