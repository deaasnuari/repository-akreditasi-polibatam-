'use client';
import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  fetchAkuntabilitasData,
  createAkuntabilitasData,
  updateAkuntabilitasData,
  deleteAkuntabilitasData,
  saveDraftAkuntabilitas,
  loadDraftAkuntabilitas,
  saveAkuntabilitasDraftToBackend
} from '@/services/akuntabilitasService';

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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
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

  const handleSaveDraft = async () => {
    showPopup('Menyimpan draft...', 'info');
    try {
      await saveAkuntabilitasDraftToBackend(
        `LKPS - Akuntabilitas`,
        pathname,
        'Draft',
        activeSubTab,
        tabData
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

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  useEffect(() => {
    const draft = loadDraftAkuntabilitas(activeSubTab);
    if (draft.length) {
      setTabData(draft);
    } else {
      fetchAkuntabilitasData(activeSubTab).then(setTabData);
    }
  }, [activeSubTab]);

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
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length < 2) {
          showPopup('File Excel harus memiliki minimal 2 baris (header dan data)', 'error');
          setImporting(false);
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];

        setPreviewHeaders(headers);
        setPreviewRows(rows.slice(0, 5)); // Show first 5 rows
        setPreviewFile(file);
        setShowPreviewModal(true);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error reading file:', err);
      showPopup('Gagal membaca file Excel', 'error');
    } finally {
      setImporting(false);
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

  const handleSave = async () => {
    let res;
    // Assuming 'prodi' is available in context or state, perhaps from user login or a selector
    const prodi = 'Teknologi Informasi'; // Placeholder for 'prodi' - Make this dynamic
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
  };

  const handleDelete = async (id: string | null | undefined) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

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
      // Need to convert mapping from { excelHeader: tableFieldKey } to { tableFieldKey: excelHeader }
      const reverseMapping: Record<string, string> = {};
      Object.entries(mapping).forEach(([excelHeader, tableFieldKey]) => {
        if (tableFieldKey) {
          reverseMapping[tableFieldKey] = excelHeader;
        }
      });
      
      const res = await importExcelAkuntabilitas(previewFile, activeSubTab, mapping);
      if (res.success) {
        // Re-fetch all data to ensure consistency with newly imported data from the database
        const updatedData = await fetchAkuntabilitasData(activeSubTab); 
        setTabData(updatedData);
        saveDraftAkuntabilitas(activeSubTab, updatedData);

        setShowPreviewModal(false);
        setPreviewFile(null);
        setPreviewHeaders([]);
        setPreviewRows([]);
        setMapping({});
        showPopup('Data berhasil diimport', 'success');
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
                  <input type="file" accept=".xlsx, .xls" id="importExcel" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImportExcel} />
                  <label htmlFor="importExcel" className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <Upload size={16} /> Import Excel
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
                            <button onClick={() => { setFormData(item.data); setEditIndex(i); setShowForm(true); }} className="text-blue-600 hover:text-blue-800 transition" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 transition" title="Hapus">
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
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Batal</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">Simpan</button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Modal for Excel Import */}
          {showPreviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-auto">
                <h3 className="text-lg font-semibold mb-4">Preview Excel Import</h3>
                <p className="mb-4">Map the Excel columns to table fields for {activeSubTab.replace('tataKelola', 'Sistem Tata Kelola').replace('sarana', 'Sarana & Prasarana')}:</p>

                <div className="mb-4">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-4 py-2 text-left">Excel Column</th>
                        <th className="border px-4 py-2 text-left">Table Field</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewHeaders.map((header, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2 font-medium">{header}</td>
                          <td className="border px-4 py-2">
                            <select
                              value={mapping[header] || ''}
                              onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                              className="border p-2 rounded w-full"
                            >
                              <option value="">Select Field</option>
                              {getFieldMappingForSubTab(activeSubTab).map(field => (
                                <option key={field.key} value={field.key}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Preview First 5 Rows:</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          {previewHeaders.map((header, index) => (
                            <th key={index} className="border px-2 py-1 text-left">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, index) => (
                          <tr key={index}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="border px-2 py-1">{String(cell)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setPreviewFile(null);
                      setPreviewHeaders([]);
                      setPreviewRows([]);
                      setMapping({});
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={importing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : 'Confirm Import'}
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
