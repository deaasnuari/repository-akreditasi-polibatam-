'use client';
import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  fetchAkuntabilitasData,
  createAkuntabilitasData,
  updateAkuntabilitasData,
  deleteAkuntabilitasData,
  saveDraftAkuntabilitas,
  loadDraftAkuntabilitas
} from '@/services/akuntabilitasService';

export default function AkuntabilitasPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState<'tataKelola' | 'sarana'>('tataKelola');
  const [tabData, setTabData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      const formattedData = jsonData.map((item: any) => ({
        id: null,
        data: item,
      }));

      setTabData(formattedData);
      saveDraftAkuntabilitas(activeSubTab, formattedData);
      alert('✅ Data dari Excel berhasil dimuat!');
    };

    reader.readAsArrayBuffer(file);
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

  const handleSave = async () => {
    let res;
    if (editIndex !== null && tabData[editIndex].id) {
      res = await updateAkuntabilitasData(tabData[editIndex].id, formData);
    } else {
      res = await createAkuntabilitasData(activeSubTab, formData);
    }

    if (res.success) {
      const newData =
        editIndex !== null
          ? tabData.map((d, i) => (i === editIndex ? { ...d, data: formData } : d))
          : [...tabData, res.data];
      setTabData(newData);
      saveDraftAkuntabilitas(activeSubTab, newData);
      setShowForm(false);
    } else {
      alert(res.message);
    }
  };

  const handleDelete = async (id: string | null | undefined) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

    if (!id) {
      const updated = tabData.filter((d: any) => d.id !== id);
      setTabData(updated);
      saveDraftAkuntabilitas(activeSubTab, updated);
      alert("🗑️ Data import berhasil dihapus dari tampilan (belum ada di database).");
      return;
    }

    const res = await deleteAkuntabilitasData(id);
    if (res.success) {
      const updated = tabData.filter((d: any) => d.id !== id);
      setTabData(updated);
      saveDraftAkuntabilitas(activeSubTab, updated);
    } else alert(res.message);
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
        </main>
      </div>
    </div>
  );
}
