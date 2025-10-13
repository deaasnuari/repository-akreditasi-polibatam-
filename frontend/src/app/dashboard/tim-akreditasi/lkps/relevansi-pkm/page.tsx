'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Plus, Edit, Trash2, X } from 'lucide-react';
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
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);

  const API_BASE = 'http://localhost:5000/api/relevansi-pkm';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    try {
      setErrorMsg(null);
      const res = await fetch(`${API_BASE}?type=${activeSubTab}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data ?? json ?? []);
    } catch (err: any) {
      console.error('fetchData error', err);
      setErrorMsg(err?.message || String(err));
      setData([]);
    }
  };

  // =============== FORM ===============
  const openAdd = () => {
    setFormData({});
    setEditIndex(null);
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setFormData({ ...item });
    setEditIndex(item.id ?? null);
    setShowForm(true);
  };

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Tambahan fungsi submit ke backend Express
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);

      const method = editIndex ? 'PUT' : 'POST';
      const url = editIndex
        ? `${API_BASE}/${activeSubTab}/${editIndex}`
        : `${API_BASE}/${activeSubTab}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: activeSubTab,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      alert(json.message || 'Data berhasil disimpan');
      setShowForm(false);
      setFormData({});
      setEditIndex(null);
      await fetchData();
    } catch (err: any) {
      console.error('handleSubmit error', err);
      setErrorMsg(err?.message || String(err));
    } finally {
      setSaving(false);
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
      { key: 'namaDTPR', label: 'Nama DTPR (Ketua)' },
      { key: 'judulPkM', label: 'Judul PkM' },
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
      { key: 'jenisHKI', label: 'Jenis HKI' },
      { key: 'namaDTPR', label: 'Nama DTPR' },
      { key: 'tahun', label: 'Tahun Perolehan' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
  };

  const renderColumns = () =>
    (subtabFields[activeSubTab] ?? []).map((c) => (
      <th key={c.key} className="whitespace-nowrap">{c.label}</th>
    ));

  const renderRows = () => {
    const cols = subtabFields[activeSubTab] ?? [];
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={cols.length + 1} className="text-center py-6 text-gray-500">
            Belum ada data
          </td>
        </tr>
      );
    }
    return data.map((item: any) => (
      <tr key={item.id ?? Math.random()} className="hover:bg-gray-50">
        {cols.map((c) => (
          <td key={c.key} className="px-4 py-2 border-t">
            {item[c.key] ?? ''}
          </td>
        ))}
        <td className="px-4 py-2 border-t text-center">
          <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-2">
            <Edit size={16} />
          </button>
          <button
            onClick={async () => {
              if (!item.id) return;
              if (!confirm('Hapus data ini?')) return;
              try {
                const res = await fetch(`${API_BASE}/${activeSubTab}/${item.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                await res.json();
                await fetchData();
              } catch (err) {
                console.error(err);
              }
            }}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">

          {/* Header */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-900" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Relevansi Pengabdian kepada Masyarakat (PkM)
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola data kuantitatif berdasarkan kriteria akreditasi
                </p>
              </div>
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
              <div className="flex gap-2">
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  <Plus size={16} /> Tambah Data
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 border-t border-red-100">
                  Error: {errorMsg}
                </div>
              )}
              <table className="w-full text-sm text-left text-gray-600 border-collapse table-auto">
                <thead className="bg-gray-100 text-gray-700 uppercase sticky top-0">
                  <tr>
                    {renderColumns()}
                    <th className="whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm">{renderRows()}</tbody>
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
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
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
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
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
