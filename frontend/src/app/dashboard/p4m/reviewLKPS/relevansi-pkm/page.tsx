'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RelevansiPkmPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState('sarana-prasarana');
  const [data, setData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const API_BASE = 'http://localhost:5000/api/relevansi-pkm';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/p4m/reviewLKPS' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/p4m/reviewLKPS/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/p4m/reviewLKPS/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/p4m/reviewLKPS/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/p4m/reviewLKPS/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/p4m/reviewLKPS/diferensiasi-misi' },
  ];

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    try {
      setErrorMsg(null);
      const res = await fetch(`${API_BASE}?type=${activeSubTab}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${res.status}`);
      }
      
      const json = await res.json();
      setData(json.data ?? json ?? []);
    } catch (err: any) {
      console.error('fetchData error', err);
      setErrorMsg(err?.message || String(err));
      setData([]);
    }
  };

  // =============== FORM ===============
  // openAdd (tambah data) dihilangkan — UI tombol tambah sudah dihapus

  const openEdit = (item: any) => {
    setFormData({ ...item });
    setEditIndex(item.id ?? null);
    setShowForm(true);
  };

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);

      const method = editIndex ? 'PUT' : 'POST';
      const url = editIndex ? `${API_BASE}/${editIndex}` : `${API_BASE}`;

      const payload = { ...formData, type: activeSubTab };
      
      console.log('🚀 Sending data:', payload); // Debug log

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Parse response body terlebih dahulu
      const json = await res.json();

      // Cek status response
      if (!res.ok) {
        throw new Error(json.message || json.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      alert(json.message || 'Data berhasil disimpan');
      setShowForm(false);
      setFormData({});
      setEditIndex(null);
      await fetchData();
    } catch (err: any) {
      console.error('❌ handleSubmit error:', err);
      setErrorMsg(err?.message || String(err));
      alert(`Gagal menyimpan data: ${err?.message || String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!item.id) {
      alert('ID tidak ditemukan');
      return;
    }
    
    if (!confirm('Hapus data ini?')) return;

    try {
      const res = await fetch(`${API_BASE}/${item.id}`, { method: 'DELETE' });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || `HTTP ${res.status}`);
      }

      alert(json.message || 'Data berhasil dihapus');
      await fetchData();
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      alert(`Gagal menghapus data: ${err?.message || String(err)}`);
    }
  };

  const subtabFields: Record<string, Array<{ key: string; label: string }>> = {
    'sarana-prasarana': [
      { key: 'namaPrasarana', label: 'Nama Sarana/Prasarana' },
      { key: 'dayaTampung', label: 'Daya Tampung' },
      { key: 'luasRuang', label: 'Luas Ruang (m²)' },
      { key: 'status', label: 'Status (M/W)' },
      { key: 'lisensi', label: 'Lisensi (L/P/T)' },
      { key: 'perangkat', label: 'Perangkat' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    'pkm-hibah': [
      { key: 'no', label: 'No' },
      { key: 'namaDtpr', label: 'Nama DTPR (Ketua)' },
      { key: 'judulPkm', label: 'Judul PkM' },
      { key: 'jumlahMahasiswa', label: 'Jumlah Mahasiswa Terlibat' },
      { key: 'jenisHibah', label: 'Jenis Hibah / Jenis Kegiatan' },
      { key: 'sumberDana', label: 'Sumber Dana' },
      { key: 'durasi', label: 'Durasi (tahun)' },
      { key: 'pendanaan', label: 'Pendanaan (Rp Juta)' },
      { key: 'tahun', label: 'Tahun' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    'kerjasama-pkm': [
      { key: 'no', label: 'No' },
      { key: 'judulKerjasama', label: 'Judul Kerjasama' },
      { key: 'mitra', label: 'Mitra' },
      { key: 'sumber', label: 'Sumber (L/N/I)' },
      { key: 'durasi', label: 'Durasi (tahun)' },
      { key: 'pendanaan', label: 'Pendanaan (Rp Juta)' },
      { key: 'tahun', label: 'Tahun' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    'hki-pkm': [
      { key: 'no', label: 'No' },
      { key: 'judul', label: 'Judul' },
      { key: 'jenisHki', label: 'Jenis HKI' },
      { key: 'namaDtpr', label: 'Nama DTPR' },
      { key: 'tahun', label: 'Tahun Perolehan' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
  };

  const renderColumns = () => (
    <tr>
      {(subtabFields[activeSubTab] ?? []).map((c) => (
        <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {c.label}
        </th>
      ))}
      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
    </tr>
  );

  const renderRows = () => {
    const cols = subtabFields[activeSubTab] ?? [];
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={cols.length + 1} className="text-center py-6 text-gray-500">Belum ada data</td>
        </tr>
      );
    }

    return data.map((item: any, index: number) => (
      <tr key={item.id ?? index} className="bg-white hover:bg-gray-50 border-b">
        {cols.map((c) => (
          <td key={c.key} className="px-6 py-4 text-gray-800">{item[c.key] ?? ''}</td>
        ))}
        <td className="px-6 py-4 text-center">
          <div className="flex gap-2 justify-center">
            <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 transition" title="Edit"><Edit size={16} /></button>
            <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800 transition" title="Hapus"><Trash2 size={16} /></button>
          </div>
        </td>
      </tr>
    ));
  };

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

          {/* Tabs utama */}
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

          {/* Subtabs */}
          <div className="flex gap-2 border-b pb-2 mb-4 overflow-x-auto">
            {[
              { key: 'sarana-prasarana', label: 'Sarana & Prasarana PkM' },
              { key: 'pkm-hibah', label: 'PkM DTPR, Hibah & Pembiayaan' },
              { key: 'kerjasama-pkm', label: 'Kerjasama PkM' },
              { key: 'hki-pkm', label: 'Perolehan HKI PkM' },
            ].map((sub) => (
              <button
                key={sub.key}
                onClick={() => setActiveSubTab(sub.key)}
                className={`px-4 py-2 text-sm rounded-t-lg ${
                  activeSubTab === sub.key
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 capitalize">
                Data {activeSubTab.replace('-', ' ')}
              </h3>
              {/* Tombol Tambah dihilangkan sesuai permintaan */}
            </div>

            <div className="overflow-x-auto px-4 py-2">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 border-t border-red-100">
                  ❌ Error: {errorMsg}
                </div>
              )}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">{renderColumns()}</thead>
                <tbody className="bg-white divide-y divide-gray-200">{renderRows()}</tbody>
              </table>
            </div>
          </div>

          {/* Modal Tambah/Edit */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {editIndex !== null ? 'Edit Data' : 'Tambah Data Baru'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setErrorMsg(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    ❌ {errorMsg}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(subtabFields[activeSubTab] || []).map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm text-gray-700 mb-1">
                        {f.label}
                      </label>
                      <input
                        name={f.key}
                        value={formData[f.key] ?? ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={f.label}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setErrorMsg(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
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