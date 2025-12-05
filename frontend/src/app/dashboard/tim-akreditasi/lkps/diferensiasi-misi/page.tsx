'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  fetchDiferensiasiMisiData,
  createDiferensiasiMisiData,
  updateDiferensiasiMisiData,
  deleteDiferensiasiMisiData,
  importExcelDiferensiasiMisi,
  saveDiferensiasiMisiDraftToBackend,
  DataItem
} from '@/services/diferensiasiMisiService';



export default function DiferensiasiMisiPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<DataItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<DataItem>({});
  const [popup, setPopup] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // --- Fungsi Popup ---
  const showPopup = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: 'success' }), 3000);
  };

  const PopupNotification = () => {
    if (!popup.show) return null;
    const bgColor = popup.type === 'success' ? 'bg-green-50 border-green-500' :
                    popup.type === 'error' ? 'bg-red-50 border-red-500' :
                    'bg-blue-50 border-blue-500';
    const textColor = popup.type === 'success' ? 'text-green-800' :
                      popup.type === 'error' ? 'text-red-800' :
                      'text-blue-800';
    const Icon = popup.type === 'success' ? CheckCircle :
                 popup.type === 'error' ? AlertCircle :
                 Info;
    return (
      <div className="fixed top-0 left-0 right-0 flex justify-center z-[60] pt-4">
        <div className={`${bgColor} ${textColor} border-l-4 rounded-lg shadow-2xl p-5 flex items-center gap-4 min-w-[350px] max-w-md animate-slideDown`}>
          <Icon size={28} className={popup.type === 'success' ? 'text-green-500' :
                                     popup.type === 'error' ? 'text-red-500' :
                                     'text-blue-500'} />
          <div className="flex-1">
            <p className="font-bold text-base mb-1">
              {popup.type === 'success' ? 'Berhasil!' :
               popup.type === 'error' ? 'Error!' :
               'Info'}
            </p>
            <p className="text-sm">{popup.message}</p>
          </div>
          <button onClick={() => setPopup({ show: false, message: '', type: 'success' })} className="hover:opacity-70 transition-opacity">
            <X size={20} />
          </button>
        </div>
      </div>
    );
  };

  const handleSaveDraft = async () => {
    showPopup('Menyimpan draft...', 'info');
    try {
      await saveDiferensiasiMisiDraftToBackend(
        `LKPS - Diferensiasi Misi`,
        pathname,
        'Draft',
        'visi-misi', // The subtab for Diferensiasi Misi
        data // Sending the current data state
      );

      showPopup('Draft berhasil disimpan. Mengalihkan...', 'success');

      setTimeout(() => {
        router.push('/dashboard/tim-akreditasi/bukti-pendukung');
      }, 1500);

    } catch (error: any) {
      console.error('Gagal menyimpan draft:', error);
      showPopup(error.message || 'Gagal menyimpan draft. Lihat konsol untuk detail.', 'error');
    }
  };


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
    const result = await fetchDiferensiasiMisiData();
    if (result.success) {
      setData(result.data);
    } else {
      console.error("Fetch data failed:", result.message);
      showPopup(result.message, 'error');
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
      let result;
      // Placeholder for prodi. You might get this from user context.
      const prodi = 'Teknologi Informasi'; 

      if (formData.id) {
        result = await updateDiferensiasiMisiData(formData.id, formData, prodi);
      } else {
        result = await createDiferensiasiMisiData(formData, prodi);
      }

      if (result.success) {
        showPopup('Data berhasil disimpan', 'success');
        setShowForm(false);
        fetchData();
      } else {
        showPopup(result.message || 'Gagal menyimpan data', 'error');
      }
    } catch (err) {
      console.error('Save error:', err);
      showPopup('Terjadi kesalahan saat menyimpan data', 'error');
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
      const result = await deleteDiferensiasiMisiData(id);
      if (result.success) {
        showPopup('Data berhasil dihapus', 'success');
        setData(prev => prev.filter(d => d.id !== id));
      } else {
        showPopup(result.message || 'Gagal menghapus data', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showPopup('Terjadi kesalahan saat menghapus data', 'error');
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

    // Placeholder for prodi. You might get this from user context.
    const prodi = 'Teknologi Informasi'; 
    const mapping = {}; // You might need to implement mapping logic here if your import expects it

    try {
      const result = await importExcelDiferensiasiMisi(file, mapping, prodi);
      if (result.success) {
        showPopup('Data berhasil diimport', 'success');
        fetchData();
      } else {
        showPopup(result.message || 'Gagal import data', 'error');
      }
    } catch (err) {
      console.error('Import error:', err);
      showPopup('Terjadi kesalahan saat import data', 'error');
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
              <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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