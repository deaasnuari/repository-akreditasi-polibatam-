// app/export-akreditasi/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalBagian: number;
  siapExport: number;
  belumLengkap: number;
  kelengkapan: number;
}

interface BagianAkreditasi {
  id: number;
  kode_bagian: string;
  nama_bagian: string;
  deskripsi: string;
  tanggal_update: string;
  status: string;
}

interface Template {
  id: number;
  nama_template: string;
  jenis_template: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ExportAkreditasi() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBagian: 0,
    siapExport: 0,
    belumLengkap: 0,
    kelengkapan: 0,
  });
  const [bagianList, setBagianList] = useState<BagianAkreditasi[]>([]);
  const [filteredBagian, setFilteredBagian] = useState<BagianAkreditasi[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedBagian, setSelectedBagian] = useState<number[]>([]);
  const [exportFormat, setExportFormat] = useState<string>('PDF');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBagianData();
  }, [bagianList, filterStatus, searchQuery]);

  const fetchData = async () => {
  try {
    const [statsRes, bagianRes, templatesRes] = await Promise.all([
      fetch(`${API_URL}/akreditasi/stats`), // ✅ perbaikan disini
      fetch(`${API_URL}/akreditasi/bagian`), // sesuaikan
      fetch(`${API_URL}/akreditasi/templates`), // sesuaikan
    ]);

    const statsData = await statsRes.json();
    const bagianData = await bagianRes.json();
    const templatesData = await templatesRes.json();

    setStats(statsData);
    setBagianList(bagianData);
    setTemplates(templatesData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};


  const filterBagianData = () => {
    let filtered = [...bagianList];

    if (filterStatus) {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.nama_bagian.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.kode_bagian.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBagian(filtered);
  };

  const handleBagianToggle = (id: number) => {
    setSelectedBagian((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBagian.length === filteredBagian.length) {
      setSelectedBagian([]);
    } else {
      setSelectedBagian(filteredBagian.map((b) => b.id));
    }
  };

  const handleExport = async () => {
    if (selectedBagian.length === 0) {
      alert('Pilih minimal satu bagian untuk export');
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        exportFormat === 'PDF'
          ? '/export/pdf'
          : exportFormat === 'CSV'
          ? '/export/csv'
          : '/export/excel';

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bagianIds: selectedBagian }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension =
        exportFormat === 'PDF' ? 'pdf' : exportFormat === 'CSV' ? 'csv' : 'xlsx';
      link.setAttribute('download', `akreditasi-export.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Terjadi kesalahan saat export');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Siap Export':
        return 'bg-green-100 text-green-700';
      case 'Belum Lengkap':
        return 'bg-yellow-100 text-yellow-700';
      case 'Kelengkapan':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6">
        <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800">
              Export Data Akreditasi
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Export dan unduh data akreditasi dalam berbagai format
            </p>
          </div>
          <button className="bg-blue-600 text-white px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span className="hidden sm:inline">Upload Dokumen</span>
            <span className="inline sm:hidden">Upload</span>
          </button>
        </div>

      
        {/* Statistics Cards */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-6">
  {[
    { title: 'Total Bagian', value: stats.totalBagian, icon: 'document', bg: 'bg-gray-100', color: 'text-gray-600' },
    { title: 'Siap Export', value: stats.siapExport, icon: 'check-circle', bg: 'bg-green-100', color: 'text-green-600' },
    { title: 'Belum Lengkap', value: stats.belumLengkap, icon: 'clock', bg: 'bg-yellow-100', color: 'text-yellow-600' },
    { title: 'Kelengkapan', value: stats.kelengkapan, icon: 'x-circle', bg: 'bg-red-100', color: 'text-red-600' },
  ].map((stat) => (
    <div key={stat.title} className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-6 shadow hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
        <div className={`${stat.bg} p-2 sm:p-3 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <svg className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {/* Icon berdasarkan stat.icon */}
            {stat.icon === 'document' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            )}
            {stat.icon === 'check-circle' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            )}
            {stat.icon === 'clock' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            )}
            {stat.icon === 'x-circle' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            )}
          </svg>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-gray-600 text-xs sm:text-sm">{stat.title}</p>
          <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
        </div>
      </div>
    </div>
  ))}
</div>


       {/* Filter Bar */}
<div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm mb-4 md:mb-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">

    {/* Filter Status */}
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Filter Status
      </label>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
      >
        <option value="">Semua Status</option>
        <option value="Siap Export">Siap Export</option>
        <option value="Belum Lengkap">Belum Lengkap</option>
        <option value="Kelengkapan">Kelengkapan</option>
      </select>
    </div>

    {/* Search */}
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Cari Bagian
      </label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Cari nama atau kode..."
        className="w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
      />
    </div>

    {/* Pilih/Hapus Semua */}
    <div className="flex items-end">
      <button
        onClick={handleSelectAll}
        className={`w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border transition 
          ${selectedBagian.length === filteredBagian.length
            ? 'border-gray-400 text-gray-600 hover:bg-gray-100'
            : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
      >
        {selectedBagian.length === filteredBagian.length
          ? 'Hapus Pilihan'
          : 'Pilih Semua'}
      </button>
    </div>

  </div>
</div>


        {/* Main Content */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
  {/* Pengaturan Export */}
  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Pengaturan Export</h2>

    <div className="mb-3 sm:mb-4">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Template Export
      </label>
      <select
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
        className="w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Akreditasi Lengkap</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.nama_template}
          </option>
        ))}
      </select>
    </div>

    <div className="mb-3 sm:mb-4">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Format Export
      </label>
      <select
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value)}
        className="w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="PDF">PDF</option>
        <option value="CSV">CSV</option>
        <option value="EXCEL">Excel</option>
      </select>
    </div>

    <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg mb-3 sm:mb-4">
      <p className="text-xs sm:text-sm text-gray-600">
        <span className="font-semibold">Bagian terpilih:</span>{' '}
        {selectedBagian.length} dari {filteredBagian.length}
      </p>
    </div>

    <button
      onClick={handleExport}
      disabled={loading || selectedBagian.length === 0}
      className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
    >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export {exportFormat}
                </>
              )}
            </button>
          </div>

          {/* Pilih Bagian untuk Export */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Pilih Bagian untuk Export
            </h2>

            {filteredBagian.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 sm:h-48 md:h-64 text-gray-400">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-base sm:text-lg font-medium">Tidak ada data</p>
                <p className="text-xs sm:text-sm">Tidak ada bagian yang sesuai filter</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
  {filteredBagian.map((bagian) => (
    <div
      key={bagian.id}
      onClick={() => handleBagianToggle(bagian.id)}
      className={`border rounded-lg p-2 sm:p-3 md:p-4 transition cursor-pointer
        ${
          selectedBagian.includes(bagian.id)
            ? 'bg-[#ADE7F7] border-blue-400'
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <input
          type="checkbox"
          checked={selectedBagian.includes(bagian.id)}
          onChange={() => handleBagianToggle(bagian.id)}
          className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
            <h3 className="font-medium text-gray-800 text-xs sm:text-sm md:text-base break-words">
              {bagian.kode_bagian} - {bagian.nama_bagian}
            </h3>
            <span
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs flex items-center gap-1 flex-shrink-0 ${getStatusColor(
                bagian.status
              )}`}
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {bagian.status}
            </span>
          </div>
          <p className="text-xs sm:text-xs text-gray-600 mt-1">{bagian.deskripsi}</p>
          <p className="text-xs text-gray-500 mt-1">
            Data: {new Date(bagian.tanggal_update).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}