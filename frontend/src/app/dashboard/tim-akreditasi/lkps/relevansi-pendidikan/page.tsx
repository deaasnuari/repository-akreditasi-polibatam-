'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { FileText, Download, Save, Plus, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DataItem {
  id?: number;
  tahun?: string;
  daya_tampung?: number;
  pendaftar?: number;
  diterima?: number;
  aktif?: number;
  asal_daerah?: string;
  jumlah?: number;
  mata_kuliah?: string;
  sks?: number;
  semester?: number;
  profil_lulusan?: string;
}

export default function RelevansiPendidikanPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState<string>('mahasiswa');
  const [data, setData] = useState<DataItem[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<DataItem>({});
  const API_BASE = 'http://localhost:5000/api/relevansi-pendidikan';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  // =========================
  // Fetch Data
  // =========================
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}?type=${activeSubTab}`);
      if (!res.ok) throw new Error('Gagal fetch data');
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const openAdd = () => {
    setFormData({});
    setEditIndex(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const method = editIndex !== null && formData.id ? 'PUT' : 'POST';
      const url = method === 'PUT' ? `${API_BASE}/${formData.id}` : API_BASE;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: activeSubTab }),
      });
      const json = await res.json();
      if (res.ok) {
        alert('✅ Data berhasil disimpan');
        setShowForm(false);
        await fetchData();
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
        setData((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(json.message || 'Gagal menghapus');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderColumns = () => {
    switch (activeSubTab) {
      case 'mahasiswa':
        return (
          <>
            <th className="px-6 py-3">Tahun</th>
            <th className="px-6 py-3">Daya Tampung</th>
            <th className="px-6 py-3">Pendaftar</th>
            <th className="px-6 py-3">Diterima</th>
            <th className="px-6 py-3">Aktif</th>
          </>
        );
      case 'keragaman-asal':
        return (
          <>
            <th className="px-6 py-3">Tahun</th>
            <th className="px-6 py-3">Asal Daerah</th>
            <th className="px-6 py-3">Jumlah</th>
          </>
        );
      case 'isi-pembelajaran':
        return (
          <>
            <th className="px-6 py-3">Mata Kuliah</th>
            <th className="px-6 py-3">SKS</th>
            <th className="px-6 py-3">Semester</th>
            <th className="px-6 py-3">Profil Lulusan</th>
          </>
        );
    }
  };

  const renderRows = () =>
    data.length === 0 ? (
      <tr>
        <td colSpan={8} className="text-center py-6 text-gray-500">
          Belum ada data
        </td>
      </tr>
    ) : (
      data.map((item) => (
        <tr key={item.id} className="bg-white rounded-lg shadow-sm hover:bg-gray-50">
          {activeSubTab === 'mahasiswa' && (
            <>
              <td className="px-6 py-3">{item.tahun}</td>
              <td className="px-6 py-3">{item.daya_tampung}</td>
              <td className="px-6 py-3">{item.pendaftar}</td>
              <td className="px-6 py-3">{item.diterima}</td>
              <td className="px-6 py-3">{item.aktif}</td>
            </>
          )}
          {activeSubTab === 'keragaman-asal' && (
            <>
              <td className="px-6 py-3">{item.tahun}</td>
              <td className="px-6 py-3">{item.asal_daerah}</td>
              <td className="px-6 py-3">{item.jumlah}</td>
            </>
          )}
          {activeSubTab === 'isi-pembelajaran' && (
            <>
              <td className="px-6 py-3">{item.mata_kuliah}</td>
              <td className="px-6 py-3">{item.sks}</td>
              <td className="px-6 py-3">{item.semester}</td>
              <td className="px-6 py-3">{item.profil_lulusan}</td>
            </>
          )}
          <td className="px-6 py-3 text-center flex justify-center gap-2">
            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
              <Edit size={16} />
            </button>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
              <Trash2 size={16} />
            </button>
          </td>
        </tr>
      ))
    );

    // =========================
    // navbar atas
    // =========================
  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-start">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-blue-900" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Laporan Kinerja Program Studi (LKPS)
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola data kuantitatif berdasarkan kriteria akreditasi
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} /> Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Save size={16} /> Save Draft
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                <FileText size={16} /> Submit
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

          {/* Sub-tabs */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="flex gap-2 border-b pb-2 mb-4">
              {['mahasiswa', 'keragaman-asal', 'isi-pembelajaran'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubTab(sub)}
                  className={`px-4 py-2 text-sm rounded-t-lg ${
                    activeSubTab === sub
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sub.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex justify-between px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  Data {activeSubTab}
                </h3>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  <Plus size={16} /> Tambah Data
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 border-separate border-spacing-y-2">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      {renderColumns()}
                      <th className="px-6 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>{renderRows()}</tbody>
                </table>
              </div>
            </div>

            {/* Form Input */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSubTab === 'mahasiswa' && (
                      <>
                        <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun" className="border p-3 rounded-lg w-full" />
                        <input name="daya_tampung" value={formData.daya_tampung || ''} onChange={handleChange} placeholder="Daya Tampung" className="border p-3 rounded-lg w-full" />
                        <input name="pendaftar" value={formData.pendaftar || ''} onChange={handleChange} placeholder="Jumlah Pendaftar" className="border p-3 rounded-lg w-full" />
                        <input name="diterima" value={formData.diterima || ''} onChange={handleChange} placeholder="Jumlah Diterima" className="border p-3 rounded-lg w-full" />
                        <input name="aktif" value={formData.aktif || ''} onChange={handleChange} placeholder="Jumlah Aktif" className="border p-3 rounded-lg w-full" />
                      </>
                    )}
                    {activeSubTab === 'keragaman-asal' && (
                      <>
                        <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun" className="border p-3 rounded-lg w-full" />
                        <input name="asal_daerah" value={formData.asal_daerah || ''} onChange={handleChange} placeholder="Asal Daerah" className="border p-3 rounded-lg w-full" />
                        <input name="jumlah" value={formData.jumlah || ''} onChange={handleChange} placeholder="Jumlah Mahasiswa" className="border p-3 rounded-lg w-full" />
                      </>
                    )}
                    {activeSubTab === 'isi-pembelajaran' && (
                      <>
                        <input name="mata_kuliah" value={formData.mata_kuliah || ''} onChange={handleChange} placeholder="Mata Kuliah" className="border p-3 rounded-lg w-full" />
                        <input name="sks" value={formData.sks || ''} onChange={handleChange} placeholder="SKS" className="border p-3 rounded-lg w-full" />
                        <input name="semester" value={formData.semester || ''} onChange={handleChange} placeholder="Semester" className="border p-3 rounded-lg w-full" />
                        <textarea name="profil_lulusan" value={formData.profil_lulusan || ''} onChange={handleChange} placeholder="Profil Lulusan" className="border p-3 rounded-lg w-full col-span-2" />
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                      Batal
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
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
