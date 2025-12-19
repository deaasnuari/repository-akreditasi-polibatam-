'use client';

import React, { useEffect, useState, ChangeEvent, useMemo } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Info, MessageSquare, Search, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { getReviews as fetchReviews } from '@/services/reviewService';
import {
  fetchDiferensiasiMisiData,
  createDiferensiasiMisiData,
  updateDiferensiasiMisiData,
  deleteDiferensiasiMisiData,
  importExcelDiferensiasiMisi,
  saveDiferensiasiMisiDraftToBackend,
  DataItem
} from '@/services/diferensiasiMisiService';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  nama_lengkap: string;
  prodi: string;
};

export default function DiferensiasiMisiPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<DataItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<DataItem>({});
  const [popup, setPopup] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>(
    {
      show: false,
      message: '',
      type: 'success',
    }
  );
  
  // State untuk modal konfirmasi
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const [showP4MNotes, setShowP4MNotes] = useState(false);
  const [selectedItemForNotes, setSelectedItemForNotes] = useState<any>(null);
  const [p4mNotes, setP4mNotes] = useState<any[]>([]);
  const [loadingP4mNotes, setLoadingP4mNotes] = useState(false);
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // User state
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Initialize user from sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setUserLoaded(true);
  }, []);

  // --- Fungsi Popup ---
  const showPopup = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fungsi untuk menampilkan modal konfirmasi
  const showModal = (title: string, message: string, onConfirm: () => void) => {
    setModal({ show: true, title, message, onConfirm });
  };

  const closeModal = () => {
    setModal({ show: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleModalConfirm = () => {
    modal.onConfirm();
    closeModal();
  };

  // --- Fungsi untuk melihat catatan P4M ---
  const handleViewP4mNotes = async (item: any) => {
    setSelectedItemForNotes(item);
    setShowP4MNotes(true);
    setLoadingP4mNotes(true);
    try {
      const notes = await fetchReviews('diferensiasi-misi', item.id);
      setP4mNotes(notes || []);
    } catch (err) {
      console.error('Error fetching P4M notes:', err);
      setP4mNotes([]);
      showPopup('Gagal memuat catatan P4M', 'error');
    } finally {
      setLoadingP4mNotes(false);
    }
  };

  // Komponen Modal Konfirmasi
  const ConfirmModal = () => {
    if (!modal.show) return null;

    const isDeleteAction = modal.title.includes('Hapus');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] animate-fadeIn">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scaleIn">
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isDeleteAction ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <AlertCircle className={`${
                isDeleteAction ? 'text-red-600' : 'text-yellow-600'
              }`} size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {modal.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {modal.message}
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleModalConfirm}
              className={`px-4 py-2 text-white rounded-lg transition ${
                isDeleteAction
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {isDeleteAction ? 'Hapus' : 'Ya, Lanjutkan'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PopupNotification = () => {
    if (!popup.show) return null;
    const bgColor =
      popup.type === 'success'
        ? 'bg-green-50 border-green-500'
        : popup.type === 'error'
        ? 'bg-red-50 border-red-500'
        : 'bg-blue-50 border-blue-500';
    const textColor =
      popup.type === 'success'
        ? 'text-green-800'
        : popup.type === 'error'
        ? 'text-red-800'
        : 'text-blue-800';
    const Icon =
      popup.type === 'success' ? CheckCircle : popup.type === 'error' ? AlertCircle : Info;
    return (
      <div className="fixed top-0 left-0 right-0 flex justify-center z-[60] pt-4">
        <div
          className={`${bgColor} ${textColor} border-l-4 rounded-lg shadow-2xl p-5 flex items-center gap-4 min-w-[350px] max-w-md animate-slideDown`}
        >
          <Icon
            size={28}
            className={popup.type === 'success' ? 'text-green-500' : popup.type === 'error' ? 'text-red-500' : 'text-blue-500'}
          />
          <div className="flex-1">
            <p className="font-bold text-base mb-1">
              {popup.type === 'success' ? 'Berhasil!' : popup.type === 'error' ? 'Error!' : 'Info'}
            </p>
            <p className="text-sm">{popup.message}</p>
          </div>
          <button
            onClick={() => setPopup({ show: false, message: '', type: 'success' })}
            className="hover:opacity-70 transition-opacity"
          >
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
        data, // Sending the current data state
        user?.prodi // Pass user.prodi here
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

  const handleSubmitForReview = async () => {
    showPopup('Mengajukan untuk review...', 'info');
    try {
      await saveDiferensiasiMisiDraftToBackend(
        `LKPS - Diferensiasi Misi`,
        pathname,
        'Submitted',
        'visi-misi',
        data,
        user?.prodi
      );

      showPopup('LKPS berhasil diajukan untuk review. Mengalihkan...', 'success');

      setTimeout(() => {
        router.push('/dashboard/tim-akreditasi/bukti-pendukung');
      }, 1500);
    } catch (error: any) {
      console.error('Gagal mengajukan untuk review:', error);
      showPopup(error.message || 'Gagal mengajukan untuk review. Lihat konsol untuk detail.', 'error');
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
    if (!userLoaded || !user) return; // Ensure user is loaded and not null
    const result = await fetchDiferensiasiMisiData(user.prodi); // Pass user.prodi
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
  }, [user, userLoaded]); // Added user and userLoaded to dependencies

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const filteredData = useMemo(() => {
    const base = data || [];
    if (!debouncedSearch) return base;
    const q = debouncedSearch.toLowerCase();
    return base.filter(item => [item.unit_kerja, item.tipe_data, item.konten].some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(q)));
  }, [data, debouncedSearch]);

  // --- Form & CRUD ---
  const openAdd = () => {
    setFormData({});
    setEditIndex(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      // Validasi field yang wajib diisi
      const requiredFields = ['unit_kerja', 'tipe_data', 'konten'];
      const emptyFields = requiredFields.filter(field => !formData[field as keyof DataItem]);
      
      if (emptyFields.length > 0) {
        const fieldNames: Record<string, string> = {
          unit_kerja: 'Unit Kerja',
          tipe_data: 'Tipe Data',
          konten: 'Konten'
        };
        const missingFieldNames = emptyFields.map(field => fieldNames[field]).join(', ');
        showPopup(`Field wajib diisi: ${missingFieldNames}`, 'error');
        return;
      }

      let result;

      if (formData.id) {
        result = await updateDiferensiasiMisiData(formData.id, formData);
      } else {
        result = await createDiferensiasiMisiData(formData);
      }

      if (result.success) {
        showPopup('✅ Data berhasil disimpan', 'success');
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
    if (!id) {
      showPopup('⚠️ ID data tidak valid', 'error');
      return;
    }
    
    showModal(
      'Hapus Data',
      'Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.',
      async () => {
        try {
          const result = await deleteDiferensiasiMisiData(id);
          if (result.success) {
            showPopup('✅ Data berhasil dihapus', 'success');
            setData(prev => prev.filter(d => d.id !== id));
          } else {
            showPopup(result.message || '❌ Gagal menghapus data', 'error');
          }
        } catch (err) {
          console.error('Delete error:', err);
          showPopup('❌ Terjadi kesalahan saat menghapus data', 'error');
        }
      }
    );
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

    try {
      showPopup('Mengimport file Excel...', 'info');
      const result = await importExcelDiferensiasiMisi(file, 'visi-misi');
      
      if (result.success) {
        showPopup(`${result.message}`, 'success');
        fetchData();
      } else {
        showPopup(result.message || 'Gagal import data', 'error');
      }
    } catch (err) {
      console.error('Import error:', err);
      showPopup('Terjadi kesalahan saat import data', 'error');
    }

    // Reset file input
    e.target.value = '';
  };

  // --- Download Template ---
  const downloadTemplate = () => {
    // Create a simple Excel template
    const templateData = [
      {
        unit_kerja: 'PT (Perguruan Tinggi)',
        tipe_data: 'Visi',
        konten: 'Contoh konten visi dari Perguruan Tinggi'
      },
      {
        unit_kerja: 'UPPS (Unit Pengelola Program Studi)',
        tipe_data: 'Misi',
        konten: 'Contoh konten misi dari Unit Pengelola Program Studi'
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Diferensiasi Misi');

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 40 }
    ];

    // Download
    XLSX.writeFile(wb, 'Template_Diferensiasi_Misi.xlsx');
    showPopup('Template berhasil diunduh', 'success');
  };

  // --- Render utama ---
  return (
    <div className="flex w-full bg-gray-100">
      <ConfirmModal />
      <PopupNotification />
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
                <Save size={16} /> Draft
              </button>
              <button onClick={handleSubmitForReview} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                <Send size={16} /> Ajukan untuk Review
              </button>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {tabs.map(tab => (
                <a
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === tab.href
                      ? 'bg-[#183A64] text-[#ADE7F7]' // aktif
                      : 'bg- text-[#183A64] hover:bg-[#90d8ee]'
                  }`}
                >
                  {tab.label}
                </a>
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
              <div className="flex gap-2 flex-wrap items-center">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari unit, tipe, atau konten..." className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"><X size={14} /></button>
                  )}
                </div>

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
                <button
                  onClick={() => downloadTemplate()}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-green-500 text-green-700 rounded-lg hover:bg-green-50"
                >
                  <Download size={16} /> Template
                </button>
              </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-700 uppercase">
                    <th className="px-4 py-3 text-left">Unit Kerja</th>
                    <th className="px-4 py-3 text-left">Tipe Data</th>
                    <th className="px-4 py-3 text-left">Konten</th>
                    <th className="w-24 px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500">
                        {(data||[]).length > 0 && debouncedSearch ? (<>{'Tidak ada hasil untuk "'}<span className="font-medium">{debouncedSearch}</span>{'"'}</>) : 'Belum ada data'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={item.id ?? `row-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{item.unit_kerja}</td>
                        <td className="px-4 py-3">{item.tipe_data}</td>
                        <td className="px-4 py-3">
                          <div className="max-w-md truncate">{item.konten}</div>
                        </td>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Kerja</label>
                      <select
                        name="unit_kerja"
                        value={formData.unit_kerja || ''}
                        onChange={handleChange}
                        className="border p-3 rounded-lg w-full bg-gray-50"
                      >
                        <option value="">Pilih unit kerja</option>
                        <option value="PT (Perguruan Tinggi)">PT (Perguruan Tinggi) </option>
                        <option value="UPPS (Unit Pengelola Program Studi)">UPPS (Unit Pengelola Program Studi) </option>
                        <option value="Keilmuan PS (Program Studi)">Keilmuan PS (Program Studi) </option>
                      </select>
                    </div>
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

            {/* Modal Catatan P4M */}
            {showP4MNotes && selectedItemForNotes && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Catatan dari P4M Reviewer</h2>
                    <button onClick={() => setShowP4MNotes(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                  </div>
                  {loadingP4mNotes ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                  ) : p4mNotes.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">Belum ada catatan dari P4M reviewer untuk item ini.</div>
                  ) : (
                    <div className="space-y-4">
                      {p4mNotes.map((note, index) => (
                        <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-blue-900">Catatan #{index + 1}</h4>
                            <span className="text-xs text-gray-600">{note.created_at ? new Date(note.created_at).toLocaleDateString('id-ID', {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : '-'}</span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{note.note}</p>
                          {note.reviewer_id && <p className="text-xs text-gray-600">Oleh: Reviewer #{note.reviewer_id}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button onClick={() => setShowP4MNotes(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Tutup</button>
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