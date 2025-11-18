'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { relevansiPenelitianService, SubTab, DataItem } from '@/services/relevansiPenelitianService';

export default function RelevansiPenelitianPage() {
  const pathname = usePathname();

  // --- State utama (top-level Hooks) ---
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('sarana-prasarana');
  const [data, setData] = useState<DataItem[]>([]);
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

  // --- Tabs & Subtabs ---
  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  const subtabFields: Record<string, Array<{ key: string; label: string }>> = {
    'sarana-prasarana': [
      { key: 'namaprasarana', label: 'Nama Prasarana' },
      { key: 'dayatampung', label: 'Daya Tampung' },
      { key: 'luasruang', label: 'Luas Ruang (m²)' },
      { key: 'status', label: 'Status (M/W)' },
      { key: 'lisensi', label: 'Lisensi (L/P/T)' },
      { key: 'perangkat', label: 'Perangkat' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
    'hibah-dan-pembiayaan': [
      { key: 'namadtpr', label: 'Nama DTPR' },
      { key: 'judulpenelitian', label: 'Judul Penelitian' },
      { key: 'jumlahmahasiswaterlibat', label: 'Jumlah Mahasiswa Terlibat' },
      { key: 'jenishibah', label: 'Jenis Hibah' },
      { key: 'sumber', label: 'Sumber' },
      { key: 'durasi', label: 'Durasi (tahun)' },
      { key: 'pendanaan', label: 'Pendanaan (Rp Juta)' },
      { key: 'tahun', label: 'Tahun' },
    ],
    'pengembangan-dtpr': [
      { key: 'namadtpr', label: 'Nama DTPR' },
      { key: 'jenispengembangan', label: 'Jenis Pengembangan' },
      { key: 'tahunakademik', label: 'Tahun Akademik' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
    'kerjasama-penelitian': [
      { key: 'judulkerjasama', label: 'Judul Kerjasama' },
      { key: 'mitra', label: 'Mitra' },
      { key: 'sumber', label: 'Sumber' },
      { key: 'durasi', label: 'Durasi (tahun)' },
      { key: 'pendanaan', label: 'Pendanaan (Rp Juta)' },
      { key: 'tahun', label: 'Tahun' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
    'publikasi-penelitian': [
      { key: 'namadtpr', label: 'Nama DTPR' },
      { key: 'judulpublikasi', label: 'Judul Publikasi' },
      { key: 'jenispublikasi', label: 'Jenis Publikasi' },
      { key: 'tahun', label: 'Tahun' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
    'perolehan-hki': [
      { key: 'judul', label: 'Judul' },
      { key: 'jenishki', label: 'Jenis HKI' },
      { key: 'namadtpr', label: 'Nama DTPR' },
      { key: 'tahun', label: 'Tahun' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
  };

  const orderedFields = subtabFields;

  // --- Fetch data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMsg(null);
        const json = await relevansiPenelitianService.fetchData(activeSubTab);
        setData(json);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || String(err));
        setData([]);
      }
    };
    fetchData();
  }, [activeSubTab]);

  // --- Form Handlers ---
  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const openAdd = () => { setFormData({}); setEditIndex(null); setShowForm(true); };
  const openEdit = (item: any) => { setFormData(item); setEditIndex(item.id ?? null); setShowForm(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);
      if (editIndex !== null) {
        await relevansiPenelitianService.updateData(editIndex, formData, activeSubTab);
      } else {
        await relevansiPenelitianService.createData(formData, activeSubTab);
      }
      const json = await relevansiPenelitianService.fetchData(activeSubTab);
      setData(json);
      setShowForm(false);
      setFormData({});
      setEditIndex(null);
      showPopup('Data berhasil disimpan', 'success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
      showPopup(err.message || 'Gagal menyimpan data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      setErrorMsg(null);
      await relevansiPenelitianService.deleteData(id);
      const json = await relevansiPenelitianService.fetchData(activeSubTab);
      setData(json);
      showPopup('Data berhasil dihapus', 'success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
      showPopup(err.message || 'Gagal menghapus data', 'error');
    }
  };

  // --- Import Excel ---
  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const json = await relevansiPenelitianService.previewImport(file, activeSubTab);
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
      await relevansiPenelitianService.commitImport(previewFile, activeSubTab, mapping);
      const json = await relevansiPenelitianService.fetchData(activeSubTab);
      setData(json);
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

  // --- Render Table ---
  const renderColumns = () => (
    <tr>
      {(orderedFields[activeSubTab] || []).map(c => (
        <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {c.label}
        </th>
      ))}
      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
    </tr>
  );

  const renderRows = () => {
    const cols = orderedFields[activeSubTab] || [];
    if (data.length === 0) return (
      <tr>
        <td colSpan={cols.length + 1} className="text-center py-6 text-gray-500">Belum ada data</td>
      </tr>
    );
    return data.map((item, index) => (
      <tr key={item.id ?? index} className="bg-white hover:bg-gray-50 border-b">
        {cols.map(c => <td key={c.key} className="px-6 py-4 text-gray-800">{item[c.key] ?? ''}</td>)}
        <td className="px-6 py-4 text-center">
          <div className="flex gap-2 justify-center">
            <button onClick={()=>openEdit(item)} className="text-blue-600 hover:text-blue-800 transition" title="Edit"><Edit size={16} /></button>
            <button onClick={()=>item.id && handleDelete(item.id)} className="text-red-600 hover:text-red-800 transition" title="Hapus"><Trash2 size={16} /></button>
          </div>
        </td>
      </tr>
    ));
  };

  // --- JSX Render ---
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Download size={16} /> Export PDF</button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Save size={16} /> Save Draft</button>
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
                onClick={() => setActiveSubTab(key as SubTab)}
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

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 capitalize">Data {activeSubTab.replace('-', ' ')}</h3>
              <div className="flex gap-2">
                <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"><Plus size={16} /> Tambah Data</button>
                <label className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-100 cursor-pointer">
                  <Upload size={16} /> {importing?'Importing...':'Import Excel'}
                  <input onChange={handleFileChange} type="file" accept=".xlsx,.xls" className="hidden" />
                </label>
              </div>
            </div>
            <div className="overflow-x-auto px-4 py-2">
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
                      <input name={f.key} value={formData[f.key]??''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
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
                        {(orderedFields[activeSubTab]||[]).map(f=> <option key={f.key} value={f.key}>{f.key}</option>)}
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
