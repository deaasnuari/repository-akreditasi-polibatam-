'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Edit2, FileText, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';
import { fetchData } from '@/services/api';

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
        const [lkpsData, ledData, buktiData] = await Promise.all([
          fetchData('lkps').catch(() => []),
          fetchData('led').catch(() => []),
          fetchData('bukti-pendukung').catch(() => [])
        ]);

        // Transform LKPS data
        const transformedLKPS: P4MItem[] = (lkpsData || []).map((item: any) => ({
          id: item.id,
          judul: item.nama || 'LKPS Item',
          kategori: 'LKPS' as const,
          status: item.status || 'Draft',
          progress: calculateProgress(item),
          tanggalUpdate: new Date(item.updatedAt || new Date()).toISOString().split('T')[0],
          path: `/dashboard/tim-akreditasi/lkps`,
        }));

        // Transform LED data
        const transformedLED: P4MItem[] = (ledData || []).map((item: any) => ({
          id: item.id,
          judul: item.nama || 'LED Item',
          kategori: 'LED' as const,
          status: item.status || 'Draft',
          progress: calculateProgress(item),
          tanggalUpdate: new Date(item.updatedAt || new Date()).toISOString().split('T')[0],
          path: `/dashboard/tim-akreditasi/led`,
        }));

        // Transform Bukti Pendukung data
        const transformedBukti: P4MItem[] = (buktiData || []).map((item: any) => ({
          id: item.id,
          judul: item.nama || item.judul || 'Dokumen',
          kategori: 'Bukti Pendukung' as const,
          status: item.status || 'Draft',
          progress: calculateProgress(item),
          tanggalUpdate: new Date(item.updatedAt || new Date()).toISOString().split('T')[0],
          path: `/dashboard/tim-akreditasi/bukti-pendukung`,
        }));

        const allData = [...transformedLKPS, ...transformedLED, ...transformedBukti];
        setData(allData);
        setFilteredData(allData);
      } catch (error) {
        console.error('Error loading P4M data:', error);
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

  // Hitung progress (dummy calculation)
  function calculateProgress(item: any): number {
    if (item.status === 'Diterima') return 100;
    if (item.status === 'Perlu Revisi') return 40;
    return 20; // Draft
  }

  // Stats cards
  const stats = {
    total: data.length,
    selesai: data.filter(d => d.status === 'Diterima').length,
    revisi: data.filter(d => d.status === 'Perlu Revisi').length,
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diterima':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Perlu Revisi':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Diterima':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'Perlu Revisi':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#183A64] mb-2">Dashboard P4M</h1>
        <p className="text-gray-600">Penelitian, Pengabdian, dan Mutu - Overview semua data akreditasi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Data" 
          value={stats.total} 
          icon={<FileText className="text-blue-600" size={24} />}
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Selesai / Diterima" 
          value={stats.selesai} 
          icon={<CheckCircle className="text-green-600" size={24} />}
          bgColor="bg-green-50"
        />
        <StatCard 
          title="Perlu Revisi" 
          value={stats.revisi} 
          icon={<AlertCircle className="text-red-600" size={24} />}
          bgColor="bg-red-50"
        />
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua Kategori">Semua Kategori</option>
            <option value="LKPS">LKPS</option>
            <option value="LED">LED</option>
            <option value="Bukti Pendukung">Bukti Pendukung</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Diterima">Diterima</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr className="text-left text-sm font-semibold text-gray-700">
              <th className="px-6 py-4">Judul Item</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Tanggal Update</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center">
                    <div className="animate-spin">⏳</div>
                  </div>
                  <p className="mt-2">Memuat data...</p>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Tidak ada data yang ditemukan</p>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {/* Judul */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{item.judul}</p>
                  </td>

                  {/* Kategori */}
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {item.kategori}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status}
                    </div>
                  </td>

                  {/* Progress Bar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-10 text-right">{item.progress}%</span>
                    </div>
                  </td>

                  {/* Tanggal Update */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{item.tanggalUpdate}</p>
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={item.path || '#'}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Lihat detail"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={item.path || '#'}
                        className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      {!loading && filteredData.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Menampilkan {filteredData.length} dari {data.length} item
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, bgColor }: { title: string; value: number; icon: React.ReactNode; bgColor: string }) {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </div>
  );
}
