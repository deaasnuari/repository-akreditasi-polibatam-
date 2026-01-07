'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, FileText, CheckCircle, AlertCircle, Clock, XCircle, Search, X, Check, Bell } from 'lucide-react';
import { getAllSubmittedLEDs, markLEDAsCompleted } from '@/services/ledService';
import { getReviews, deleteReview } from '@/services/reviewService';

interface P4MItem {
  id: string | number;
  judul: string;
  kategori: 'LKPS' | 'LED' | 'Bukti Pendukung';
  status: 'Draft' | 'Menunggu' | 'Diterima' | 'Perlu Revisi';
  progress: number;
  tanggalUpdate: string;
  path?: string;
  updatedAt?: string;
  nama?: string;
  userId?: number;
  tab?: string;
  reviewId?: number;
  itemId?: number;
  module?: string;
  buktiPendukungId?: number;
}

export default function P4MDashboardPage() {
  const [data, setData] = useState<P4MItem[]>([]);
  const [filteredData, setFilteredData] = useState<P4MItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua Kategori');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [showNotification, setShowNotification] = useState(false);
  const [reviewModal, setReviewModal] = useState<{show: boolean, item: P4MItem | null}>({show: false, item: null});
  const [completeModal, setCompleteModal] = useState<{show: boolean, item: P4MItem | null}>({show: false, item: null});
  const [successModal, setSuccessModal] = useState<{show: boolean, message: string}>({show: false, message: ''});

  // Module names mapping
  const moduleNames: Record<string, string> = {
    'budaya-mutu': 'Budaya Mutu',
    'relevansi-pendidikan': 'Relevansi Pendidikan',
    'relevansi-pkm': 'Relevansi PkM',
    'relevansi-penelitian': 'Relevansi Penelitian',
    'akuntabilitas': 'Akuntabilitas',
    'diferensiasi-misi': 'Diferensiasi Misi',
  };

  // Fetch data dari semua endpoint
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch semua dokumen yang sudah disubmit untuk review (LED, LKPS, Bukti Pendukung)
        const submittedDocs = await getAllSubmittedLEDs();
        
        console.log('📥 [P4M Dashboard] Fetched submitted documents:', submittedDocs);

        // Transform Submitted documents data
        const transformedDocs: P4MItem[] = (submittedDocs || []).map((item: any) => {
          // Tentukan kategori berdasarkan path
          let kategori: 'LKPS' | 'LED' | 'Bukti Pendukung' = 'Bukti Pendukung';
          let reviewPath = item.path || '#';
          
          if (item.path?.includes('/led')) {
            kategori = 'LED';
            // Extract tab dari path (contoh: /dashboard/tim-akreditasi/led?tab=budaya-mutu)
            const tabMatch = item.path?.match(/tab=([^&]+)/);
            const tab = tabMatch ? tabMatch[1] : 'unknown';
            reviewPath = `/dashboard/p4m/reviewLED?tab=${tab}&userId=${item.userId}`;
          } else if (item.path?.includes('/lkps')) {
            kategori = 'LKPS';
            reviewPath = `/dashboard/p4m/reviewLKPS?userId=${item.userId}`;
          }
          
          // Tentukan judul
          let judul = item.nama || 'Dokumen';
          if (kategori === 'LED') {
            const tabMatch = item.path?.match(/tab=([^&]+)/);
            const tab = tabMatch ? tabMatch[1] : 'unknown';
            const tabLabel = tab.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            judul = `LED ${tabLabel}`;
          } else if (kategori === 'LKPS') {
            judul = `LKPS ${item.user?.prodi || ''}`.trim();
          }
          
          return {
            id: item.id,
            judul: `${judul} - ${item.user?.nama_lengkap || item.user?.username || 'User'}`,
            kategori,
            status: item.status === 'Submitted' ? 'Menunggu' : 
                   item.status === 'Approved' ? 'Diterima' : 
                   item.status === 'NeedsRevision' ? 'Perlu Revisi' : 'Draft',
            progress: item.status === 'Submitted' ? 50 : item.status === 'Approved' ? 100 : 25,
            tanggalUpdate: new Date(item.updatedAt || new Date()).toISOString().split('T')[0],
            path: reviewPath,
            userId: item.userId,
            tab: item.path?.includes('/led') ? item.path.match(/tab=([^&]+)/)?.[1] : undefined,
            buktiPendukungId: item.id,
          };
        });

        console.log('✅ [P4M Dashboard] Transformed documents data:', transformedDocs);

        // Fetch reviewed items dari semua modul LKPS
        const modules = ['budaya-mutu', 'relevansi-pendidikan', 'relevansi-pkm', 'relevansi-penelitian', 'akuntabilitas', 'diferensiasi-misi'];
        const reviewedItems: P4MItem[] = [];
        
        for (const module of modules) {
          try {
            const reviews = await getReviews(module);
            reviews.forEach((review: any) => {
              reviewedItems.push({
                id: `review-${review.id}`,
                reviewId: review.id,
                itemId: review.item_id,
                module: module,
                judul: `${moduleNames[module]} - Item #${review.item_id}`,
                kategori: 'LKPS',
                status: review.status === 'Diterima' ? 'Diterima' : 'Perlu Revisi',
                progress: review.status === 'Diterima' ? 100 : 75,
                tanggalUpdate: new Date(review.created_at).toISOString().split('T')[0],
                path: `/dashboard/p4m/reviewLKPS/${module}`,
              });
            });
          } catch (err) {
            console.error(`Failed to fetch reviews for ${module}:`, err);
          }
        }
        
        console.log('✅ [P4M Dashboard] Fetched reviewed items:', reviewedItems);

        const allData = [...transformedDocs, ...reviewedItems];
        setData(allData);
        setFilteredData(allData);
      } catch (error) {
        console.error('❌ [P4M Dashboard] Error loading data:', error);
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotification && !target.closest('.relative')) {
        setShowNotification(false);
      }
    };

    if (showNotification) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotification]);

  // Handle complete (mark as done)
  const handleComplete = async (item: P4MItem) => {    
    try {
      let success = false;
      
      // Jika ada reviewId (untuk LKPS yang sudah direview), hapus review
      if (item.reviewId) {
        await deleteReview(item.reviewId);
        success = true;
      } 
      // Jika ada buktiPendukungId (untuk LED/dokumen lain), mark as completed
      else if (item.buktiPendukungId) {
        success = await markLEDAsCompleted(item.buktiPendukungId);
      }
      
      if (success) {
        // Refresh data - hapus item dari state
        const updatedData = data.filter(d => d.id !== item.id);
        setData(updatedData);
        setFilteredData(updatedData.filter(d => {
          let match = true;
          if (searchQuery.trim()) {
            match = match && d.judul.toLowerCase().includes(searchQuery.toLowerCase());
          }
          if (filterCategory !== 'Semua Kategori') {
            match = match && d.kategori === filterCategory;
          }
          if (filterStatus !== 'Semua Status') {
            match = match && d.status === filterStatus;
          }
          return match;
        }));
        setSuccessModal({show: true, message: 'Dokumen berhasil ditandai sebagai selesai'});
      } else {
        throw new Error('Failed to complete');
      }
    } catch (err) {
      console.error('Failed to complete:', err);
      setSuccessModal({show: true, message: 'Gagal menandai dokumen sebagai selesai'});
    }
  };

  // Filter data berdasarkan search, category, dan status
  useEffect(() => {
    let result = data;

    // Filter berdasarkan search query
    if (searchQuery.trim()) {
      result = result.filter(item =>
        item.judul.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter berdasarkan kategori
    if (filterCategory !== 'Semua Kategori') {
      result = result.filter(item => item.kategori === filterCategory);
    }

    // Filter berdasarkan status
    if (filterStatus !== 'Semua Status') {
      result = result.filter(item => item.status === filterStatus);
    }

    setFilteredData(result);
  }, [searchQuery, filterCategory, filterStatus, data]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diterima':
        return 'bg-green-100 text-green-800';
      case 'Perlu Revisi':
        return 'bg-red-100 text-red-800';
      case 'Menunggu':
        return 'bg-yellow-100 text-yellow-800';
      case 'Draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Diterima':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'Perlu Revisi':
        return <XCircle size={14} className="text-red-600" />;
      case 'Menunggu':
        return <Clock size={14} className="text-yellow-600" />;
      case 'Draft':
        return <FileText size={14} className="text-blue-600" />;
      default:
        return <FileText size={14} className="text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#183A64]">Dashboard P4M - Review Dokumen</h1>
          <p className="text-gray-600">Review dan berikan feedback untuk LED, LKPS, dan dokumen lainnya yang sudah diajukan oleh Tim Akreditasi</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Icon */}
          <div className="relative">
            <button 
              onClick={() => setShowNotification(!showNotification)}
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={24} />
              {data.filter(i => i.status === 'Menunggu').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {data.filter(i => i.status === 'Menunggu').length}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotification && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifikasi Review</h3>
                    <button 
                      onClick={() => setShowNotification(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.filter(i => i.status === 'Menunggu').length} dokumen menunggu review
                  </p>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {data.filter(i => i.status === 'Menunggu').length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <Bell size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Tidak ada notifikasi baru</p>
                    </div>
                  ) : (
                    data.filter(i => i.status === 'Menunggu').map((item) => (
                      <Link
                        key={item.id}
                        href={item.path || '#'}
                        onClick={() => setShowNotification(false)}
                        className="block px-4 py-3 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.judul}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                {item.kategori}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.tanggalUpdate}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              Klik untuk review →
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                
                {data.filter(i => i.status === 'Menunggu').length > 0 && (
                  <div className="sticky bottom-0 bg-gray-50 px-4 py-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowNotification(false);
                        setFilterStatus('Menunggu');
                      }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Lihat Semua
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - 4 cards (tanpa Draft) */}
      <div className="grid grid-cols-4 gap-4">
            <StatCard 
              title="Total Item" 
              value={data.length}
            />
            <StatCard 
              title="Diterima" 
              value={data.filter((i) => i.status === 'Diterima').length}
              icon={<CheckCircle className="text-green-600" />}
            />
            <StatCard 
              title="Menunggu" 
              value={data.filter((i) => i.status === 'Menunggu').length}
              icon={<Clock className="text-yellow-500" />}
            />
            <StatCard 
              title="Perlu Revisi" 
              value={data.filter((i) => i.status === 'Perlu Revisi').length}
              icon={<XCircle className="text-red-500" />}
            />
          </div>

          {/* Filter Section - 4 kolom grid seperti bukti pendukung */}
          <div className="bg-gray-100 rounded-xl p-4 grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Diterima">Diterima</option>
                <option value="Perlu Revisi">Perlu Revisi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)} 
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="LED">LED</option>
                <option value="LKPS">LKPS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prodi</label>
              <select 
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Pilih Program Studi</option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Teknologi Geomatika">Teknologi Geomatika</option>
                <option value="Animasi">Animasi</option>
                <option value="Teknologi Rekayasa Multimedia">Teknologi Rekayasa Multimedia</option>
                <option value="Rekayasa Keamanan Siber">Rekayasa Keamanan Siber</option>
                <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                <option value="Teknologi Permainan">Teknologi Permainan</option>
                <option value="Teknik Komputer / Rekayasa Komputer">Teknik Komputer / Rekayasa Komputer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tab</label>
              <select 
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Tab</option>
              </select>
            </div>
          </div>

          {/* Data Table - desain mirip bukti pendukung */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="px-4 py-3 font-semibold">Judul Dokumen</th>
                  <th className="px-4 py-3 font-semibold">Jenis</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">File / Path</th>
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin">⏳</div>
                        <p>Memuat data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <FileText size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Tidak ada dokumen yang perlu direview</p>
                      <p className="text-xs mt-1">Dokumen akan muncul di sini ketika Tim Akreditasi mengajukan untuk review</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                      {/* Judul Dokumen */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.judul}</p>
                      </td>

                      {/* Jenis */}
                      <td className="px-4 py-3">
                        <span className="text-gray-700">Isian Borang</span>
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {item.kategori}
                        </span>
                      </td>

                      {/* File / Path */}
                      <td className="px-4 py-3">
                        <Link 
                          href={item.path || '#'} 
                          className="text-blue-600 hover:underline text-xs"
                          target="_blank"
                        >
                          {item.path || '-'}
                        </Link>
                      </td>

                      {/* Tanggal */}
                      <td className="px-4 py-3 text-gray-600">
                        {item.tanggalUpdate}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3 text-center">
                        {item.status === 'Menunggu' ? (
                          <button
                            onClick={() => setReviewModal({show: true, item: item})}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#183A64] text-white rounded-lg transition-colors duration-200 hover:bg-[#ADE7F7] hover:text-[#183A64] text-xs font-medium"
                          >
                            <Eye size={14} />
                            Review
                          </button>
                        ) : (item.status === 'Diterima' || item.status === 'Perlu Revisi') ? (
                          <button
                            onClick={() => setCompleteModal({show: true, item: item})}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#183A64] text-white rounded-lg transition-colors duration-200 hover:bg-[#ADE7F7] hover:text-[#183A64] text-xs font-medium"
                          >
                            <Check size={14} />
                            Selesai
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          {!loading && filteredData.length > 0 && (
            <div className="text-center text-sm text-gray-500">
              Menampilkan {filteredData.length} dari {data.length} item
            </div>
          )}
      
      {/* Review Confirmation Modal */}
      {reviewModal.show && reviewModal.item && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-3 mb-4">
                <Eye className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mulai Review
              </h3>
              <p className="text-gray-600 mb-2">
                Apakah Anda ingin melakukan review untuk:
              </p>
              <p className="font-semibold text-gray-900 mb-1">{reviewModal.item.judul}</p>
              <p className="text-sm text-gray-500 mb-6">Kategori: {reviewModal.item.kategori}</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setReviewModal({show: false, item: null})}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Batal
                </button>
                <Link
                  href={reviewModal.item.path || '#'}
                  onClick={() => setReviewModal({show: false, item: null})}
                  className="flex-1 px-4 py-2 bg-[#183A64] text-white rounded-lg transition-colors duration-200 hover:bg-[#ADE7F7] hover:text-[#183A64] text-center"
                >
                  Lanjutkan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {completeModal.show && completeModal.item && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex flex-col text-left">
              <h3 className="text-base font-normal text-gray-900 mb-4">
                Tandai dokumen ini sebagai selesai dan hapus dari dashboard?
              </h3>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCompleteModal({show: false, item: null})}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleComplete(completeModal.item!);
                    setCompleteModal({show: false, item: null});
                  }}
                  className="px-6 py-2 bg-[#183A64] text-white rounded-lg transition-colors duration-200 hover:bg-[#ADE7F7] hover:text-[#183A64]"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="text-green-500 mb-3" size={48} />
              <p className="text-gray-800 font-medium mb-4">
                ✅ {successModal.message}
              </p>
              <button
                onClick={() => setSuccessModal({show: false, message: ''})}
                className="w-full bg-[#183A64] text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[#ADE7F7] hover:text-[#183A64]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon }: { title: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span>{icon}</span>}
        <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-[#183A64]">{value}</p>
    </div>
  );
}
