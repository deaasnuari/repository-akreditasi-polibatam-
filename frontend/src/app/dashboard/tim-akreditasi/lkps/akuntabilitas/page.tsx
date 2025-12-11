'use client';
import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Info, MessageSquare } from 'lucide-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getReviews as fetchReviews } from '@/services/reviewService';
import {
  fetchAkuntabilitasData,
  createAkuntabilitasData,
  updateAkuntabilitasData,
  deleteAkuntabilitasData,
  previewImportAkuntabilitas,
  commitImportAkuntabilitas,
  saveDraftAkuntabilitas,
  loadDraftAkuntabilitas,
  saveAkuntabilitasDraftToBackend
} from '@/services/akuntabilitasService';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  nama_lengkap: string;
  prodi: string;
};

export default function AkuntabilitasPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<'tataKelola' | 'sarana'>('tataKelola');
  const [tabData, setTabData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [importing, setImporting] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [popup, setPopup] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [incompleteModal, setIncompleteModal] = useState<{ open: boolean; missing: string[] }>({ open: false, missing: [] });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [showP4MNotes, setShowP4MNotes] = useState(false);
  const [selectedItemForNotes, setSelectedItemForNotes] = useState<any>(null);
  const [p4mNotes, setP4mNotes] = useState<any[]>([]);
  const [loadingP4mNotes, setLoadingP4mNotes] = useState(false);

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
  const showPopup = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: 'success' }), 3000);
  };

  // --- Fungsi untuk melihat catatan P4M ---
  const handleViewP4mNotes = async (item: any) => {
    setSelectedItemForNotes(item);
    setShowP4MNotes(true);
    setLoadingP4mNotes(true);
    try {
      const notes = await fetchReviews('akuntabilitas', item.id);
      setP4mNotes(notes || []);
    } catch (err) {
      console.error('Error fetching P4M notes:', err);
      setP4mNotes([]);
      showPopup('Gagal memuat catatan P4M', 'error');
    } finally {
      setLoadingP4mNotes(false);
    }
  };

  const handleSaveDraft = async () => {
    showPopup('Menyimpan draft...', 'info');
    try {
      await saveAkuntabilitasDraftToBackend(
        `LKPS - Akuntabilitas`,
        pathname,
        'Draft',
        activeSubTab,
        tabData,
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

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  useEffect(() => {
    if (!userLoaded || !user) return; // Ensure user is loaded and not null

    const draft = loadDraftAkuntabilitas(activeSubTab);
    if (draft.length) {
      setTabData(draft);
    } else {
      fetchAkuntabilitasData(activeSubTab, user.prodi).then(setTabData); // Pass user.prodi
    }
  }, [activeSubTab, user, userLoaded]); // Added user and userLoaded to dependencies

  const openAdd = () => {
    setFormData({});
    setEditIndex(null);
    setShowForm(true);
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const json = await previewImportAkuntabilitas(file, activeSubTab);
      setPreviewFile(file);
      setPreviewHeaders(json.headers || []);
      setPreviewRows(json.previewRows || []);
      setSuggestions(json.suggestions || {});
      const initMap: Record<string,string> = {};
      (json.headers || []).forEach(h => { initMap[h] = json.suggestions?.[h] ?? ''; });
      setMapping(initMap);
      setShowPreviewModal(true);
    } catch (err: any) {
      console.error('Error reading file:', err);
      showPopup('Gagal membaca file Excel', 'error');
    } finally {
      setImporting(false);
      try { event.target.value = ''; } catch {}
    }
  };

  const getFieldMappingForSubTab = (subTab: 'tataKelola' | 'sarana'): { key: string, label: string }[] => {
    if (subTab === 'tataKelola') {
      return [
        { key: 'jenis', label: 'Jenis Tata Kelola' },
        { key: 'nama', label: 'Nama Sistem Informasi' },
        { key: 'akses', label: 'Akses' },
        { key: 'unit', label: 'Unit Kerja' },
        { key: 'link', label: 'Link Bukti' },
      ];
    } else { // sarana
      return [
        { key: 'nama', label: 'Nama Prasarana' },
        { key: 'tampung', label: 'Daya Tampung' },
        { key: 'luas', label: 'Luas Ruang' },
        { key: 'status', label: 'Status' },
        { key: 'lisensi', label: 'Lisensi' },
        { key: 'perangkat', label: 'Perangkat' },
        { key: 'link', label: 'Link Bukti' },
      ];
    }
  };

  // Field wajib per subtab
  const requiredFieldsBySubtab: Record<'tataKelola' | 'sarana', string[]> = {
    tataKelola: ['jenis', 'nama', 'akses', 'unit'],
    sarana: ['nama', 'tampung', 'luas', 'status', 'lisensi', 'perangkat'],
  };

  const validateRequired = (subtab: 'tataKelola' | 'sarana', payload: Record<string, any>): string[] => {
    const req = requiredFieldsBySubtab[subtab] || [];
    return req.filter((key) => payload[key] === undefined || payload[key] === null || String(payload[key]).trim() === '');
  };

  const handleSave = async () => {
    try {
      const missing = validateRequired(activeSubTab, formData || {});
      if (missing.length > 0) {
        setIncompleteModal({ open: true, missing });
        return;
      }

      let res;
      const prodi = user?.prodi || 'Teknologi Informasi'; // Use user's prodi, fallback to default
      if (editIndex !== null && tabData[editIndex].id) {
        res = await updateAkuntabilitasData(tabData[editIndex].id, activeSubTab, formData, prodi);
      } else {
        res = await createAkuntabilitasData(activeSubTab, formData, prodi);
      }

      if (res.success) {
        const newData =
          editIndex !== null
            ? tabData.map((d, i) => (i === editIndex ? { ...d, data: formData } : d))
            : [...tabData, res.data];
        setTabData(newData);
        saveDraftAkuntabilitas(activeSubTab, newData);
        setShowForm(false);
        showPopup('Data berhasil disimpan', 'success');
      } else {
        showPopup(res.message || 'Gagal menyimpan data', 'error');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      showPopup(err.message || 'Gagal menyimpan data', 'error');
    }
  };

  const handleDelete = async (id: string | null | undefined) => {
    if (!id) {
      const updated = tabData.filter((d: any) => d.id !== id);
      setTabData(updated);
      saveDraftAkuntabilitas(activeSubTab, updated);
      showPopup("🗑️ Data import berhasil dihapus dari tampilan (belum ada di database).", 'info');
      return;
    }

    const res = await deleteAkuntabilitasData(id);
    if (res.success) {
      const updated = tabData.filter((d: any) => d.id !== id);
      setTabData(updated);
      saveDraftAkuntabilitas(activeSubTab, updated);
      showPopup('Data berhasil dihapus', 'success');
    } else showPopup(res.message || 'Gagal menghapus data', 'error');
  };



  const handleConfirmImport = async () => {
    if (!previewFile || !mapping) {
      showPopup('No file or mapping selected for import.', 'error');
      return;
    }

    setImporting(true);
    try {
      const res = await commitImportAkuntabilitas(previewFile, activeSubTab, mapping);
      if (res.success && res.added > 0) {
        // Re-fetch all data to ensure consistency with newly imported data from the database
        const updatedData = await fetchAkuntabilitasData(activeSubTab, user?.prodi);
        setTabData(updatedData);
        saveDraftAkuntabilitas(activeSubTab, updatedData);

        setShowPreviewModal(false);
        setPreviewFile(null);
        setPreviewHeaders([]);
        setPreviewRows([]);
        setSuggestions({});
        setMapping({});
        showPopup(`Data berhasil diimport: ${res.added} baris berhasil, ${res.failed} gagal`, 'success');
      } else if (res.success && res.added === 0) {
        showPopup(`Import gagal: ${res.failed} baris gagal. Pastikan kolom 'Prodi' dipetakan dengan benar dan nilai prodi cocok dengan akun Anda.`, 'error');
      } else {
        showPopup(res.message || 'Gagal import data', 'error');
      }
    } catch (err: any) {
      console.error('Import error:', err);
      showPopup(err.message || 'Gagal import data', 'error');
    } finally {
      setImporting(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const fields =
    activeSubTab === 'tataKelola'
      ? [
          { key: 'jenis', label: 'Jenis Tata Kelola' },
          { key: 'nama', label: 'Nama Sistem Informasi' },
          { key: 'akses', label: 'Akses' },
          { key: 'unit', label: 'Unit Kerja' },
          { key: 'link', label: 'Link Bukti' },
        ]
      : [
          { key: 'nama', label: 'Nama Prasarana' },
          { key: 'tampung', label: 'Daya Tampung' },
          { key: 'luas', label: 'Luas Ruang' },
          { key: 'status', label: 'Status' },
          { key: 'lisensi', label: 'Lisensi' },
          { key: 'perangkat', label: 'Perangkat' },
          { key: 'link', label: 'Link Bukti' },
        ];

  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6">

          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-900" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Laporan Kinerja Program Studi (LKPS)</h1>
                <p className="text-sm text-gray-600">Kelola data kuantitatif berdasarkan kriteria akreditasi</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Save size={16} /> Save Draft</button>
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
                ? 'bg-[#183A64] text-[#ADE7F7]'
                : 'bg-text-[#183A64] hover:bg-[#90d8ee]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>


          {/* Sub-tabs */}
          <div className="flex gap-2 border-b pb-2 mb-4">
            <button
              onClick={() => setActiveSubTab('tataKelola')}
              className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition ${
                activeSubTab === 'tataKelola'
                  ? 'bg-[#183A64] text-[#ADE7F7]' // aktif
                  : 'bg-[#ADE7F7] text-[#183A64] hover:bg-[#90d8ee]' // tidak aktif
              }`}
            >
              Sistem Tata Kelola
            </button>

            <button
              onClick={() => setActiveSubTab('sarana')}
              className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition ${
                activeSubTab === 'sarana'
                  ? 'bg-[#183A64] text-[#ADE7F7]' // aktif
                  : 'bg-[#ADE7F7] text-[#183A64] hover:bg-[#90d8ee]' // tidak aktif
              }`}
            >
              Sarana & Prasarana
            </button>
          </div>

          {/* Table Section - tampilan disamakan seperti Budaya Mutu */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b bg-gray-50 gap-2 md:gap-0">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {activeSubTab === 'tataKelola' ? 'Sistem Tata Kelola' : 'Sarana & Prasarana'}
              </h3>

              <div className="flex gap-2 flex-wrap">
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800">
                  <Plus size={16} /> Tambah Data
                </button>
                <form onSubmit={(e) => e.preventDefault()} className="relative">
                  <input type="file" accept=".xlsx, .xls, .csv" id="importExcel" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImportExcel} />
                  <label htmlFor="importExcel" className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <Upload size={16} /> Import Excel/CSV
                  </label>
                </form>
              </div>
            </div>

            <div className="overflow-x-auto px-4 py-2">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {fields.map((f) => (
                      <th key={f.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tabData.length === 0 ? (
                    <tr>
                      <td colSpan={fields.length + 1} className="text-center py-6 text-gray-500">
                        Belum ada data
                      </td>
                    </tr>
                  ) : (
                    tabData.map((item: any, i: number) => (
                      <tr key={i} className="bg-white rounded-lg shadow-sm hover:bg-gray-50 border-b">
                        {fields.map((f) => (
                          <td key={f.key} className="px-6 py-4 text-gray-800">
                            {item.data?.[f.key] || '-'}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => handleViewP4mNotes(item)} className="text-purple-600 hover:text-purple-800 transition" title="Lihat Catatan P4M">
                              <MessageSquare size={16} />
                            </button>
                            <button onClick={() => { setFormData(item.data); setEditIndex(i); setShowForm(true); }} className="text-blue-600 hover:text-blue-800 transition" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => setConfirmDelete({ open: true, id: item.id ?? null })} className="text-red-600 hover:text-red-800 transition" title="Hapus">
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
          </div>

          {/* Modal Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold text-lg">{editIndex !== null ? 'Edit Data' : 'Tambah Data'}</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-gray-800">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-2">
                  {fields.map((f) => (
                    <input
                      key={f.key}
                      name={f.key}
                      placeholder={f.label}
                      value={formData[f.key] || ''}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-red-300 rounded-lg hover:bg-red-100">Batal</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">Simpan</button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Modal for Excel Import */}
          {showPreviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Preview Import — mapping kolom</h3>
                  <button onClick={()=>setShowPreviewModal(false)} className="text-gray-500">Tutup</button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => {
                      const newMap: Record<string,string> = { ...mapping };
                      previewHeaders.forEach(h => { if(suggestions[h]) newMap[h] = suggestions[h]; });
                      setMapping(newMap);
                    }} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Auto Map</button>
                  </div>
                  {previewHeaders.map(h => (
                    <div key={h} className="flex gap-3 items-center">
                      <div className="min-w-[160px] text-sm font-medium">{h}</div>
                      <select value={mapping[h]??''} onChange={e=>setMapping({...mapping,[h]:e.target.value})} className="border px-2 py-1">
                        <option value="">-- tidak dipetakan --</option>
                        {getFieldMappingForSubTab(activeSubTab).map(f=> <option key={f.key} value={f.key}>{f.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                {/* Preview Rows Table */}
                {previewRows.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Preview Data (5 baris pertama)</h4>
                    <div className="overflow-x-auto border rounded">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {previewHeaders.map(h => (
                              <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewRows.map((row, index) => (
                            <tr key={index}>
                              {previewHeaders.map(h => (
                                <td key={h} className="px-4 py-2 text-sm text-gray-900">
                                  {row[h] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <button onClick={handleConfirmImport} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">{importing?'Menyimpan...':'Simpan Import'}</button>
                </div>
              </div>
            </div>
          )}
        {incompleteModal.open && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-800">Data Tidak Lengkap</h3>
                </div>
                <div className="p-4 text-sm text-gray-700 space-y-2">
                  <p>Mohon lengkapi semua field yang wajib diisi sebelum menyimpan data.</p>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                  <button
                    onClick={() => setIncompleteModal({ open: false, missing: [] })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setIncompleteModal({ open: false, missing: [] })}
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                  >
                    Ya, Lanjutkan
                  </button>
                </div>
              </div>
            </div>
          )}

          {confirmDelete.open && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
                <div className="p-4 border-b flex items-center gap-2">
                  <AlertCircle className="text-red-600" size={20} />
                  <h3 className="font-semibold text-gray-800">Konfirmasi Hapus</h3>
                </div>
                <div className="p-4 text-sm text-gray-700">
                  Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDelete({ open: false, id: null })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      const id = confirmDelete.id;
                      setConfirmDelete({ open: false, id: null });
                      await handleDelete(id as any);
                      setShowForm(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Hapus
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

          {/* Popup Notification */}
          {popup.show && (
            <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white ${
              popup.type === 'success' ? 'bg-green-500' :
              popup.type === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            }`}>
              {popup.message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
