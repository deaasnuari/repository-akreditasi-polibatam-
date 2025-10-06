'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { FileText, Download, Save, Edit, Trash2, X, Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DataItem {
  id?: number;
  tahun?: string;
  daya_tampung?: number;
  asalMahasiswa?: string;
  ts2?: number;
  ts1?: number;
  ts?: number;
  linkBukti?: string;
  pendaftar?: number;
  diterima?: number;
  aktif?: number;
  asal_daerah?: string;
  jumlah?: number;
  mata_kuliah?: string;
  sks?: number;
  semester?: number;
  profil_lulusan?: string;
  alasan?: string;
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
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
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

  // =========================
  // Form Handlers
  // =========================
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['daya_tampung','pendaftar','diterima','aktif','sks','semester','jumlah'].includes(name)
        ? Number(value)
        : value,
    });
  };

  // =========================
  // Import Excel
  // =========================
  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataImport = new FormData();
    formDataImport.append('file', file);
    formDataImport.append('type', activeSubTab);

    try {
      const res = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        body: formDataImport,
      });
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

  // =========================
  // Render Table
  // =========================
  const renderColumns = () => {
    switch (activeSubTab) {
      case 'mahasiswa':
        return (
          <>
            <th rowSpan={2} className="border px-2 py-2">TS</th>
            <th rowSpan={2} className="border px-2 py-2">Daya Tampung</th>
            <th colSpan={3} className="border px-2 py-2">Calon Mahasiswa</th>
            <th colSpan={3} className="border px-2 py-2">Mahasiswa Baru Reguler</th>
            <th colSpan={3} className="border px-2 py-2">Mahasiswa Baru RPL</th>
            <th colSpan={3} className="border px-2 py-2">Mahasiswa Aktif Reguler</th>
            <th colSpan={3} className="border px-2 py-2">Mahasiswa Aktif RPL</th>
          </>
        );
      case 'keragaman-asal':
        return (
          <>
            <th className="px-6 py-3">Asal Mahasiswa</th>
            <th className="px-6 py-3">TS-2</th>
            <th className="px-6 py-3">TS-1</th>
            <th className="px-6 py-3">TS</th>
            <th className="px-6 py-3">Link Bukti</th>
          </>
        );
      case 'kondisi-jumlah-mahasiswa':
        return (
          <>
            <th className="px-6 py-3">Alasan</th>
            <th className="px-6 py-3">TS-2</th>
            <th className="px-6 py-3">TS-1</th>
            <th className="px-6 py-3">TS</th>
            <th className="px-6 py-3">Jumlah</th>
          </>
        );
    }
  };

  const renderRows = () => {
    if (data.length === 0) {
      const colSpan =
        activeSubTab === 'mahasiswa' ? 17 :
        activeSubTab === 'keragaman-asal' ? 6 : 6;
        activeSubTab === 'kondisi-jumlah-mahasiswa' ? 6 : 1;

      return (
        <tr key="empty">
          <td colSpan={colSpan} className="text-center py-6 text-gray-500">
            Belum ada data
          </td>
        </tr>
      );
    }

    return data.map((item, index) => (
  <tr key={item.id ?? `row-${index}`} className="bg-white hover:bg-gray-50 border">
        {activeSubTab === 'mahasiswa' && (
          <>
            <td>{item.tahun}</td>
            <td>{item.daya_tampung}</td>
            <td>{item.pendaftar}</td>
            <td>{item.diterima}</td>
            <td>{item.aktif}</td>
          </>
        )}
        {activeSubTab === 'keragaman-asal' && (
          <>
            <td>{item.asalMahasiswa}</td>
            <td>{item.ts2}</td>
            <td>{item.ts1}</td>
            <td>{item.ts}</td>
            <td className="px-6 py-3">
                {item.linkBukti ? (
                  <a href={item.linkBukti} target="_blank" className="text-blue-600 hover:underline">Lihat</a>
                ) : '-'}
              </td>
          </>
        )}
        {activeSubTab === 'kondisi-jumlah-mahasiswa' && (
          <>
            <td>{item.alasan}</td>
            <td>{item.ts2}</td>
            <td>{item.ts1}</td>
            <td>{item.ts}</td>
            <td>{item.jumlah}</td>
          </>
        )}
        <td className="px-6 py-3 flex justify-center gap-2">
          <button onClick={() => handleEdit(item)} className="text-blue-700 hover:text-blue-900">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
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
          </div>

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

          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="flex gap-2 border-b pb-2 mb-4">
              {['mahasiswa', 'keragaman-asal', 'kondisi-jumlah-mahasiswa'].map((sub) => (
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

            <div className="flex justify-between items-center mb-4 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="flex gap-2">
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  <Plus size={16} /> Tambah Data
                </button>
                <form onSubmit={(e) => e.preventDefault()} className="relative">
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
                </form>
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="w-full text-sm text-left text-gray-500 border-separate border-spacing-y-2">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>{renderColumns()}<th className="px-6 py-3 text-center">Aksi</th></tr>
                </thead>
                <tbody>{renderRows()}</tbody>
              </table>
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {editIndex !== null ? 'Edit Data' : 'Tambah Data Baru'}
                    </h2>
                    <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* {activeSubTab === 'mahasiswa' && (
                      <> */}


                    {activeSubTab === 'keragaman-asal' && (
                      <>
                        <input name="asalMahasiswa" value={formData.asalMahasiswa || ''} onChange={handleChange} placeholder="Asal Mahasiswa" className="border p-3 rounded-lg w-full" />
                        <input name="ts2" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                        <input name="ts1" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                        <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                        <input name="linkBukti" value={formData.linkBukti || ''} onChange={handleChange} placeholder="Link Bukti" className="border p-3 rounded-lg w-full" />
                      </>
                    )}

                    {activeSubTab === 'kondisi-jumlah-mahasiswa' && (
                      <>
                        <input name="alasan" value={formData.alasan || ''} onChange={handleChange} placeholder="Alasan" className="border p-3 rounded-lg w-full" />
                        <input name="ts2" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                        <input name="ts1" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                        <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                        <input name="jumlah" value={formData.jumlah || ''} onChange={handleChange} placeholder="Jumlah" className="border p-3 rounded-lg w-full" />
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
