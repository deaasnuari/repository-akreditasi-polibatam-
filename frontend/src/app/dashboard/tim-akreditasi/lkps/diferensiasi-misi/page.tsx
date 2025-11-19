'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- Data item ---
interface DataItem {
  id?: number;
  tipe_data?: string;
  unit_kerja?: string;
  konten?: string;
}

export default function DiferensiasiMisiPage() {
  const pathname = usePathname();
  const [data, setData] = useState<DataItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<DataItem>({});
  const API_BASE = 'http://localhost:5000/api/diferensiasi-misi';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  // --- Fetch Data ---
  const fetchData = async () => {
  try {
    const res = await fetch(`${API_BASE}?type=visi-misi`);
    if (!res.ok) throw new Error('Gagal fetch data');
    const json = await res.json();
    console.log('RESPON DARI BACKEND:', json);
    setData(json.data || json || []); // ✅ fallback ke json langsung
  } catch (err) {
    console.error('Fetch error:', err);
    setData([]);
  }
};


  useEffect(() => {
    fetchData();
  }, []);

  // --- Form & CRUD ---
  const openAdd = () => {
    setFormData({});
    setEditIndex(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = method === 'PUT' ? `${API_BASE}/${formData.id}` : API_BASE;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'visi-misi' }),
      });
      const json = await res.json();
      if (res.ok) {
        alert('✅ Data berhasil disimpan');
        setShowForm(false);
        fetchData();
      } else {
        alert(json.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleEdit = (item: DataItem) => {
    setFormData(item);
    const idx = data.findIndex((d) => d.id === item.id);
    setEditIndex(idx !== -1 ? idx : null);
    setShowForm(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id || !confirm('Yakin hapus data ini?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        alert('🗑️ Data dihapus');
        setData(prev => prev.filter(d => d.id !== id));
      } else {
        alert(json.message || 'Gagal menghapus');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // --- Import Excel ---
  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataImport = new FormData();
    formDataImport.append('file', file);
    formDataImport.append('type', 'visi-misi');

    try {
      const res = await fetch(`${API_BASE}/import`, { method: 'POST', body: formDataImport });
      const json = await res.json();
      if (res.ok) {
        alert('✅ Data berhasil diimport');
        fetchData();
      } else {
        alert(json.message || 'Gagal import data');
      }
    } catch (err) {
      console.error('Import error:', err);
    }
  };

  // --- Render utama ---
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
              {tabs.map(tab => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === tab.href
                      ? 'bg-[#183A64] text-[#ADE7F7]' // aktif
                      : 'bg- text-[#183A64] hover:bg-[#90d8ee]'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>


          {/* Konten */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Judul Tabel */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Data Visi/Misi</h2>
              <p className="text-sm text-gray-600">Tabel Visi dan Misi</p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  <Plus size={16} /> Tambah Data
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    id="importExcel"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImport}
                  />
                  <label
                    htmlFor="importExcel"
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <Upload size={16} /> Import Excel
                  </label>
                </div>
              </div>
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
                        Belum ada data
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr key={item.id ?? `row-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{item.tipe_data}</td>
                        <td className="px-4 py-3">{item.unit_kerja}</td>
                        <td className="px-4 py-3">{item.konten}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleEdit(item)} className="text-blue-700 hover:text-blue-900">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Form */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
                  {/* Header Form */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {editIndex !== null ? 'Edit Data' : 'Tambah Data Visi/Misi'}
                    </h2>
                    <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">Isi form di bawah untuk menambahkan data visi atau misi baru ke tabel</p>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Data</label>
                      <select
                        name="tipe_data"
                        value={formData.tipe_data || ''}
                        onChange={handleChange}
                        className="border p-3 rounded-lg w-full bg-gray-50"
                      >
                        <option value="">Pilih tipe data</option>
                        <option value="Visi">Visi</option>
                        <option value="Misi">Misi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Kerja</label>
                      <select
                        name="unit_kerja"
                        value={formData.unit_kerja || ''}
                        onChange={handleChange}
                        className="border p-3 rounded-lg w-full bg-gray-50"
                      >
                        <option value="">Pilih unit kerja</option>
                        <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                        <option value="UPPS">UPPS</option>
                        <option value="Program Studi">Program Studi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Konten</label>
                      <textarea
                        name="konten"
                        value={formData.konten || ''}
                        onChange={handleChange}
                        placeholder="Tulis konten di sini..."
                        rows={6}
                        className="border p-3 rounded-lg w-full bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button 
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>

                    <button onClick={handleSave} className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800">
                      Simpan
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