'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Save, Eye, CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getReviews as fetchReviews, createReview as postReview } from '@/services/reviewService';
import { getAllProdi } from '@/services/userService';

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
  const [prodiList, setProdiList] = useState<string[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>('');
  const API_BASE = 'http://localhost:5000/api/diferensiasi-misi';
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Diterima' | 'Perlu Revisi'>('Diterima');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsMap, setReviewsMap] = useState<Record<number, any>>({});

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
      let url = `${API_BASE}?type=visi-misi`;
      if (selectedProdi) {
        url += `&prodi=${selectedProdi}`;
      }
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!res.ok) throw new Error('Gagal fetch data');
      const json = await res.json();
      console.log('RESPON DARI BACKEND:', json);
      const fetchedData = json.data || json || [];
      
      // Fetch reviews untuk modul ini
      try {
        const reviews = await fetchReviews('diferensiasi-misi');
        const reviewMap: Record<number, any> = {};
        const reviewedIds = new Set<number>();
        
        reviews.forEach((review: any) => {
          reviewMap[review.item_id] = review;
          reviewedIds.add(review.item_id);
        });
        
        setReviewsMap(reviewMap);
        
        // Filter: hanya tampilkan data yang belum direview
        const unreviewed = fetchedData.filter((item: any) => !reviewedIds.has(item.id));
        setData(unreviewed);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        // Jika gagal fetch review, tampilkan semua data
        setData(fetchedData);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setData([]);
    }
  };

  const fetchProdi = async () => {
    try {
      const prodi = await getAllProdi();
      setProdiList(prodi);
    } catch (error) {
      console.error('Failed to fetch prodi list', error);
    }
  };

  useEffect(() => {
    fetchProdi();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedProdi]);

  // --- Export PDF handler ---
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup diblokir. Mohon izinkan popup untuk export PDF.');
      return;
    }

    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Review LKPS - Diferensiasi Misi</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #183A64;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #183A64;
            font-size: 24px;
            margin-bottom: 8px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .info-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #183A64;
          }
          .info-box p {
            font-size: 13px;
            color: #555;
            line-height: 1.5;
          }
          .info-box strong {
            color: #183A64;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th {
            background-color: #183A64;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
            vertical-align: top;
          }
          tr:hover {
            background-color: #f9fafb;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: right;
            font-size: 12px;
            color: #666;
          }
          .no-data {
            text-align: center;
            padding: 40px;
            color: #999;
            font-style: italic;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Review LKPS - Diferensiasi Misi</h1>
          <p>Review Data Visi/Misi Program Studi</p>
          <p style="margin-top: 5px; font-size: 12px;">Dicetak pada: ${currentDate}</p>
        </div>

        <div class="info-box">
          <p><strong>Filter Prodi:</strong> ${selectedProdi || 'Semua Prodi'}</p>
          <p><strong>Total Data:</strong> ${data.length} item</p>
          <p><strong>Status:</strong> Data yang belum direview</p>
        </div>

        ${data.length === 0 ? `
          <div class="no-data">
            <p>Tidak ada data yang perlu direview</p>
          </div>
        ` : `
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">No</th>
                <th style="width: 20%;">Tipe Data</th>
                <th style="width: 25%;">Unit Kerja</th>
                <th style="width: 40%;">Konten</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.tipe_data || '-'}</td>
                  <td>${item.unit_kerja || '-'}</td>
                  <td>${item.konten || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}

        <div class="footer">
          <p><strong>ReDDA POLIBATAM</strong></p>
          <p>Repository Akreditasi - Dashboard P4M</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- Review handlers ---
  const handleReview = async (item: DataItem) => {
    setSelectedItem(item);
    setReviewStatus('Diterima');
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedItem?.id) return;
    if (!reviewNotes.trim()) {
      alert('Catatan review harus diisi');
      return;
    }

    setSubmittingReview(true);
    try {
      await postReview('diferensiasi-misi', selectedItem.id, reviewNotes, reviewStatus);
      alert('Review berhasil disimpan');
      setShowReviewModal(false);
      setSelectedItem(null);
      await fetchData();
    } catch (err) {
      console.error('Submit review error:', err);
      alert('Gagal menyimpan review');
    } finally {
      setSubmittingReview(false);
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
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={16} /> Export PDF
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


          {/* Info P4M */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Mode Review P4M:</strong> Anda dapat melihat dan mengevaluasi data yang diinput oleh Tim Akreditasi
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Judul Tabel */}
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Review Data Visi/Misi</h2>
                <p className="text-sm text-gray-600">Review dan evaluasi data visi dan misi program studi</p>
              </div>
              <select
                value={selectedProdi}
                onChange={(e) => setSelectedProdi(e.target.value)}
                className="border p-2 rounded-lg"
              >
                <option value="">Semua Prodi</option>
                {prodiList.map((prodi) => (
                  <option key={prodi} value={prodi}>
                    {prodi}
                  </option>
                ))}
              </select>
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
                            onClick={() => handleReview(item)} 
                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-1.5 text-sm"
                            title="Review Data"
                          >
                            <Eye size={14} />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </div>

            {/* Modal Review */}
            {showReviewModal && selectedItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center p-6 border-b">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Review Data</h2>
                      <p className="text-sm text-gray-600 mt-1">Berikan penilaian dan catatan untuk data ini</p>
                    </div>
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Data Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Info size={18} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-800">Data yang Direview</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Tipe Data
                          </label>
                          <p className="text-sm text-gray-900 mt-1">{selectedItem.tipe_data}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Unit Kerja
                          </label>
                          <p className="text-sm text-gray-900 mt-1">{selectedItem.unit_kerja}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Konten
                          </label>
                          <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedItem.konten}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Review */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status Review <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value as 'Diterima' | 'Perlu Revisi')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Diterima">✓ Diterima</option>
                        <option value="Perlu Revisi">⚠ Perlu Revisi</option>
                      </select>
                    </div>

                    {/* Catatan Review */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Catatan Review <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Berikan catatan, komentar, atau saran perbaikan..."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Catatan ini akan dikirimkan ke Tim Akreditasi
                      </p>
                    </div>

                    {/* Info Alert */}
                    {reviewStatus === 'Perlu Revisi' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Data akan dikembalikan untuk revisi</p>
                          <p className="mt-1">Tim Akreditasi akan menerima notifikasi dan dapat memperbaiki data sesuai catatan Anda.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t p-6 bg-gray-50 flex justify-end gap-3">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewNotes.trim()}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                    >
                      {submittingReview ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Simpan Review
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}