'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, FileText, CheckCircle, AlertCircle, Clock, XCircle, Search, X } from 'lucide-react';
import { getAllSubmittedLEDs } from '@/services/ledService';

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
}

export default function P4MDashboardPage() {
  const [data, setData] = useState<P4MItem[]>([]);
  const [filteredData, setFilteredData] = useState<P4MItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua Kategori');
  const [filterStatus, setFilterStatus] = useState('Semua Status');

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
          };
        });

        console.log('✅ [P4M Dashboard] Transformed documents data:', transformedDocs);

        const allData = [...transformedDocs];
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
                    <Link
                      href={item.path || '#'}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                    >
                      <Eye size={14} />
                      Review
                    </Link>
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
