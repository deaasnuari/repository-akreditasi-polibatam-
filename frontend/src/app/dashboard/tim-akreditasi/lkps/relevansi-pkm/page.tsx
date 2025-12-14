'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Info, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { relevansiPkmService } from '@/services/relevansiPkmService';
import { getReviews as fetchReviews } from '@/services/reviewService';
import { fetchData as apiFetch } from '@/services/api';

export default function RelevansiPkmPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState('sarana-prasarana');
  const [data, setData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [incompleteModal, setIncompleteModal] = useState<{ open: boolean; missing: string[] }>({ open: false, missing: [] });
  const [showP4MNotes, setShowP4MNotes] = useState(false);
  const [selectedItemForNotes, setSelectedItemForNotes] = useState<any>(null);
  const [p4mNotes, setP4mNotes] = useState<any[]>([]);
  const [loadingP4mNotes, setLoadingP4mNotes] = useState(false);
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
      const notes = await fetchReviews('relevansi-pkm', item.id);
      setP4mNotes(notes || []);
    } catch (err) {
      console.error('Error fetching P4M notes:', err);
      setP4mNotes([]);
      showPopup('Gagal memuat catatan P4M', 'error');
    } finally {
      setLoadingP4mNotes(false);
    }
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
      await apiFetch('bukti-pendukung', {
        method: 'POST',
        body: JSON.stringify({
          nama: 'LKPS - Relevansi PKM',
          path: pathname,
          status: 'Draft',
        }),
      });

      showPopup('Draft berhasil disimpan. Mengalihkan...', 'success');

      setTimeout(() => {
        router.push('/dashboard/tim-akreditasi/bukti-pendukung');
      }, 1500);

    } catch (error) {
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

  const subtabFields: Record<string, Array<{ key: string; label: string; type: string }>> = {
    'sarana-prasarana': [
      { key: 'namaprasarana', label: 'Nama Prasarana', type: 'text' },
      { key: 'dayatampung', label: 'Daya Tampung', type: 'number' },
      { key: 'luasruang', label: 'Luas Ruang (m²)', type: 'number' },
      { key: 'miliksendiri', label: 'Milik Sendiri (M)/Sewa (W)', type: 'text' },
      { key: 'berlisensi', label: 'Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)', type: 'text' },
      { key: 'perangkat', label: 'Perangkat', type: 'text' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
    'pkm-hibah': [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'namadtpr', label: 'Nama DTPR (Sebagai Ketua PkM)', type: 'text' },
      { key: 'judulpkm', label: 'Judul PkM', type: 'text' },
      { key: 'jumlahmahasiswa', label: 'Jumlah Mahasiswa yang Terlibat', type: 'number' },
      { key: 'jenishibah', label: 'Jenis Hibah PkM', type: 'text' },
      { key: 'sumberdana', label: 'Sumber Dana L/N/I', type: 'text' },
      { key: 'durasi', label: 'Durasi (tahun)', type: 'number' },
      { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp Juta)', type: 'number' },
      { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp Juta)', type: 'number' },
      { key: 'pendanaants', label: 'Pendanaan TS (Rp Juta)', type: 'number' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
    'kerjasama-pkm': [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'judulkerjasama', label: 'Judul Kerjasama', type: 'text' },
      { key: 'mitrakerjasama', label: 'Mitra kerja sama', type: 'text' },
      { key: 'sumber', label: 'Sumber L/N/I', type: 'text' },
      { key: 'durasi', label: 'Durasi (tahun)', type: 'number' },
      { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp Juta)', type: 'number' },
      { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp Juta)', type: 'number' },
      { key: 'pendanaants', label: 'Pendanaan TS (Rp Juta)', type: 'number' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
    'diseminasi-pkm': [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'namadtpr', label: 'Nama DTPR', type: 'text' },
      { key: 'juduldiseminasi', label: 'Judul Diseminasi', type: 'text' },
      { key: 'jenisdiseminasi', label: 'Jenis Diseminasi', type: 'text' },
      { key: 'tahunts2', label: 'Tahun TS-2', type: 'text' },
      { key: 'tahunts1', label: 'Tahun TS-1', type: 'text' },
      { key: 'tahunts', label: 'Tahun TS', type: 'text' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
    'hki-pkm': [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'judul', label: 'Judul', type: 'text' },
      { key: 'jenishki', label: 'Jenis HKI', type: 'text' },
      { key: 'namadtpr', label: 'Nama DTPR', type: 'text' },
      { key: 'tahunts2', label: 'Tahun Perolehan TS-2', type: 'text' },
      { key: 'tahunts1', label: 'Tahun Perolehan TS-1', type: 'text' },
      { key: 'tahunts', label: 'Tahun Perolehan TS', type: 'text' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // clear on subtab change
  useEffect(() => {
    setSearchQuery(''); setDebouncedSearch('');
  }, [activeSubTab]);

  const fetchData = async () => {
    try {
      setErrorMsg(null);
      const result = await relevansiPkmService.fetchData(activeSubTab);
      setData(result);
    } catch (err: any) {
      console.error('fetchData error', err);
      setErrorMsg(err?.message || String(err));
      setData([]);
    }
  };

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

  const handleSave = async () => {
    const fields = subtabFields[activeSubTab] || [];
    for (const field of fields) {
      const value = formData[field.key];
      if (!value || value.toString().trim() === '') {
        showPopup(`Field "${field.label}" harus diisi`, 'error');
        return;
      }
      if (field.type === 'number' && isNaN(Number(value))) {
        showPopup(`Field "${field.label}" harus berupa angka`, 'error');
        return;
      }
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      if (editIndex) {
        await relevansiPkmService.updateData(editIndex, formData, activeSubTab);
      } else {
        await relevansiPkmService.createData(formData, activeSubTab);
      }

      showPopup('Data berhasil disimpan', 'success');
      setShowForm(false);
      setFormData({});
      setEditIndex(null);
      await fetchData();
    } catch (err: any) {
      console.error('❌ handleSave error:', err);
      setErrorMsg(err?.message || String(err));
      showPopup(err?.message || 'Gagal menyimpan data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setErrorMsg(null);
      await relevansiPkmService.deleteData(id);
      await fetchData();
      showPopup('Data berhasil dihapus', 'success');
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      setErrorMsg(err?.message || String(err));
      showPopup(err?.message || 'Gagal menghapus data', 'error');
    }
  };

  // --- Import Excel ---
  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const json = await relevansiPkmService.previewImport(file, activeSubTab);
      setPreviewFile(file);
      setPreviewHeaders(json.headers || []);
      setPreviewRows(json.previewRows || []);
      setSuggestions(json.suggestions || {});
      const initMap: Record<string,string> = {};
      (json.headers || []).forEach(h => { initMap[h] = json.suggestions?.[h] ?? ''; });
      setMapping(initMap);
      setShowPreviewModal(true);
    } catch(err:any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally {
      setImporting(false);
      try { e.target.value = ''; } catch {}
    }
  };

  const handleCommitImport = async () => {
    if (!previewFile) return;
    try {
      setImporting(true);
      await relevansiPkmService.commitImport(previewFile, activeSubTab, mapping);
      await fetchData();
      setShowPreviewModal(false);
      setPreviewFile(null);
      showPopup('Import berhasil', 'success');
    } catch(err:any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
      showPopup(err.message || 'Gagal import data', 'error');
    } finally { setImporting(false); }
  };

  const applySuggestions = () => {
    const newMap: Record<string,string> = { ...mapping };
    previewHeaders.forEach(h => { if(suggestions[h]) newMap[h] = suggestions[h]; });
    setMapping(newMap);
  };

  const renderColumns = () => (
    <tr>
      {(subtabFields[activeSubTab] || []).map(c => (
        <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {c.label}
        </th>
      ))}
      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
    </tr>
  );

  const filteredData = useMemo(() => {
    const base = data || [];
    if (!debouncedSearch) return base;
    const q = debouncedSearch.toLowerCase();
    return base.filter(item => {
      const values = item?.data ? Object.values(item.data) : Object.values(item || {});
      return values.some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(q));
    });
  }, [data, debouncedSearch]);

  const renderRows = () => {
    const cols = subtabFields[activeSubTab] || [];
    if (filteredData.length === 0) {
      if ((data || []).length > 0 && debouncedSearch) {
        return (
          <tr>
            <td colSpan={cols.length + 1} className="text-center py-6 text-gray-500">{'Tidak ada hasil untuk "'}<span className="font-medium">{debouncedSearch}</span>{'"'}</td>
          </tr>
        );
      }
      return (
        <tr>
          <td colSpan={cols.length + 1} className="text-center py-6 text-gray-500">Belum ada data</td>
        </tr>
      );
    }

    return filteredData.map((item, index) => (
      <tr key={item.id ?? index} className="bg-white hover:bg-gray-50 border-b">
        {cols.map(c => <td key={c.key} className="px-6 py-4 text-gray-800">{item[c.key] ?? ''}</td>)}
        <td className="px-6 py-4 text-center">
          <div className="flex gap-2 justify-center">
            <button onClick={() => handleViewP4mNotes(item)} className="text-purple-600 hover:text-purple-800 transition" title="Lihat Catatan P4M"><MessageSquare size={16} /></button>
            <button onClick={()=>openEdit(item)} className="text-blue-600 hover:text-blue-800 transition" title="Edit"><Edit size={16} /></button>
            <button onClick={()=>setConfirmDelete({ open: true, id: item.id ?? null })} className="text-red-600 hover:text-red-800 transition" title="Hapus"><Trash2 size={16} /></button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex w-full bg-gray-100">
      <PopupNotification />
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-start">
            <div className="flex items-center gap-3 mb-2">
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
                  pathname === tab.href ? 'bg-[#183A64] text-[#ADE7F7]' : 'bg- text-[#183A64] hover:bg-[#90d8ee]'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Subtabs */}
          <div className="flex gap-2 border-b pb-2 mb-4 overflow-x-auto">
            {Object.keys(subtabFields).map((key) => (
              <button
                key={key}
                onClick={() => setActiveSubTab(key)}
                className={`px-4 py-2 text-sm rounded-t-lg font-medium transition whitespace-nowrap ${
                  activeSubTab === key
                    ? 'bg-[#183A64] text-[#ADE7F7]'
                    : 'bg-[#ADE7F7] text-[#183A64] hover:bg-[#90d8ee]'
                }`}
              >
                {key.replace(/-/g, ' ')}
              </button>
            ))}
          </div>

          {/* Konten */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            {/* Judul Subtab & Tabel */}
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Data {activeSubTab.replace('-', ' ')}</h2>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex gap-1.5 sm:gap-2 flex-wrap items-center">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Cari data di ${activeSubTab.replace('-', ' ')}...`} className="pl-9 pr-8 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"><X size={12} /></button>
                  )}
                </div>

                <button onClick={openAdd} className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"><Plus size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Tambah</span> Tambah Data</button>
                <form onSubmit={(e) => e.preventDefault()} className="relative">
                  <input type="file" accept=".xlsx, .xls" id="importExcel" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                  <label htmlFor="importExcel" className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"><Upload size={14} className="sm:w-4 sm:h-4" /> Import Excel</label>
                </form>
              </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              {errorMsg && <div className="p-4 bg-red-50 text-red-700 border-t border-red-100">Error: {errorMsg}</div>}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">{renderColumns()}</thead>
                <tbody className="bg-white divide-y divide-gray-200">{renderRows()}</tbody>
              </table>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">{editIndex!==null?'Edit Data':'Tambah Data Baru'}</h2>
                  <button onClick={()=>setShowForm(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(subtabFields[activeSubTab]||[]).map(f => (
                    <div key={f.key}>
                      <label className="block text-sm text-gray-700 mb-1">{f.label}</label>
                      <input name={f.key} value={formData[f.key]??''} onChange={handleChange} type={f.type} className="w-full px-3 py-2 border rounded" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                  <button onClick={()=>setShowForm(false)} className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                  <button onClick={handleSave} className="w-full sm:w-auto px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">{saving?'Menyimpan...':'Simpan'}</button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {showPreviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Preview Import — mapping kolom</h3>
                  <button onClick={()=>setShowPreviewModal(false)} className="text-gray-500">Tutup</button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex gap-2 mb-2">
                    <button onClick={applySuggestions} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Auto Map</button>
                  </div>
                  {previewHeaders.map(h => (
                    <div key={h} className="flex gap-3 items-center">
                      <div className="min-w-[160px] text-sm font-medium">{h}</div>
                      <select value={mapping[h]??''} onChange={e=>setMapping({...mapping,[h]:e.target.value})} className="border px-2 py-1">
                        <option value="">-- tidak dipetakan --</option>
                        {(subtabFields[activeSubTab]||[]).map(f=> <option key={f.key} value={f.key}>{f.key}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button onClick={handleCommitImport} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">{importing?'Menyimpan...':'Simpan Import'}</button>
                </div>
              </div>
            </div>
          )}

        </main>

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
                    if (id !== null) {
                      await handleDelete(id);
                    }
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

        <style>{`
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideDown { animation: slideDown 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
}