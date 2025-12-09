// app/export-akreditasi/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalBagian: number;
  siapExport: number;
  belumLengkap: number;
}

interface BagianAkreditasi {
  id: number;
  kode_bagian: string;
  nama_bagian: string;
  deskripsi: string;
  tanggal_update: string;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ExportAkreditasi() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBagian: 0,
    siapExport: 0,
    belumLengkap: 0,
  });
  const [bagianList, setBagianList] = useState<BagianAkreditasi[]>([]);
  const [filteredBagian, setFilteredBagian] = useState<BagianAkreditasi[]>([]);
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

  // Ambil data real dari bukti pendukung dan hitung statistik
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/bukti-pendukung/rekap-bagian`, { credentials: 'include' });
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.warn('Rekap-bagian bukan array, respons:', data);
        setStats({ totalBagian: 0, siapExport: 0, belumLengkap: 0 });
        setBagianList([]);
        setFilteredBagian([]);
        return;
      }

      const totalBagian = data.length;
      const siapExport = data.filter((b: BagianAkreditasi) => (b.status || '').toLowerCase() === 'siap export').length;
      const belumLengkap = data.filter((b: BagianAkreditasi) => (b.status || '').toLowerCase() === 'belum lengkap').length;

      setStats({ totalBagian, siapExport, belumLengkap });
      setBagianList(data as BagianAkreditasi[]);
      setFilteredBagian(data as BagianAkreditasi[]);
    } catch (e) {
      console.error('Gagal memuat data bukti pendukung:', e);
      setStats({ totalBagian: 0, siapExport: 0, belumLengkap: 0 });
      setBagianList([]);
      setFilteredBagian([]);
    }
  };

  const filterBagianData = () => {
    let filtered = [...bagianList];

    if (filterStatus) {
      filtered = filtered.filter((b) => (b.status || '').toLowerCase() === filterStatus.toLowerCase());
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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
      const endpoint = '/akreditasi/export';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: exportFormat, selectedIds: selectedBagian }),
      });

      if (!res.ok) throw new Error('Export gagal');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `akreditasi-export.${exportFormat === 'PDF' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat export');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'siap export':
        return 'bg-green-100 text-green-800';
      case 'belum lengkap':
        return 'bg-yellow-100 text-yellow-800';
            default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Export Data Akreditasi
          </h1>
          <p className="text-gray-600">
            Pilih bagian dan format untuk mengunduh data akreditasi
          </p>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Total Bagian */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 h-full">
              <div className="flex-shrink-0 rounded-md bg-gray-100 p-3">
                {/* Ikon dokumen stack */}
                <svg className="w-7 h-7 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h10.5a2.25 2.25 0 0 1 2.25 2.25v8.25a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V9.75A2.25 2.25 0 0 1 3.75 7.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5V6A2.25 2.25 0 0 1 9.75 3.75h10.5A2.25 2.25 0 0 1 22.5 6v8.25a2.25 2.25 0 0 1-2.25 2.25H18" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-gray-900 leading-tight">{stats.totalBagian}</div>
                <div className="text-sm text-gray-600">Total Bagian</div>
              </div>
            </div>

            {/* Siap Export */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-green-100 bg-green-50 h-full">
              <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                {/* Ikon check circle */}
                <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-green-700 leading-tight">{stats.siapExport}</div>
                <div className="text-sm text-green-700/80">Siap Export</div>
              </div>
            </div>

            {/* Belum Lengkap */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-yellow-100 bg-yellow-50 h-full">
              <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
                {/* Ikon clock */}
                <svg className="w-7 h-7 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v5.25l3.5 2.1" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-yellow-700 leading-tight">{stats.belumLengkap}</div>
                <div className="text-sm text-yellow-700/80">Belum Lengkap</div>
              </div>
            </div>

                      </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Filter & Search */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Cari & Filter Bagian
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau kode bagian..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="Siap Export">Siap Export</option>
                <option value="Belum Lengkap">Belum Lengkap</option>
                              </select>
            </div>
          </div>

          <hr className="my-6" />

          {/* Step 2: Select Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Pilih Bagian ({selectedBagian.length}/{filteredBagian.length})
              </h2>
              <button onClick={handleSelectAll} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                {selectedBagian.length === filteredBagian.length ? 'Hapus Semua' : 'Pilih Semua'}
              </button>
            </div>

            {filteredBagian.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Tidak ada bagian yang ditemukan</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {filteredBagian.map((bagian) => (
                  <label
                    key={bagian.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                      selectedBagian.includes(bagian.id)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-white border-2 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBagian.includes(bagian.id)}
                      onChange={() => handleBagianToggle(bagian.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {bagian.kode_bagian} - {bagian.nama_bagian}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(bagian.status)}`}>
                          {bagian.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{bagian.deskripsi}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Diperbarui: {new Date(bagian.tanggal_update).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <hr className="my-6" />

          {/* Step 3: Export Settings */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Pilih Format Export
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format File</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="EXCEL">Excel Spreadsheet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading || selectedBagian.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses Export...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {exportFormat} ({selectedBagian.length} Bagian)
              </>
            )}
          </button>

          {selectedBagian.length === 0 && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Pilih minimal 1 bagian untuk melakukan export
            </p>
          )}
        </div>
      </div>
    </div>
  );
}