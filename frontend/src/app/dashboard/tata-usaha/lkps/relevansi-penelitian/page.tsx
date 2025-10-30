'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getRelevansiPenelitian,
  saveRelevansiPenelitian,
  updateRelevansiPenelitian,
  deleteRelevansiPenelitian,
  previewImport,
  commitImport
} from '@/services/relevansiPenelitianService';

export default function RelevansiPenelitianPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState('sarana-prasarana');
  const [data, setData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tata-usaha/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tata-usaha/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tata-usaha/lkps/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/tata-usaha/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tata-usaha/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tata-usaha/lkps/diferensiasi-misi' },
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
  };

  const orderedFields: Record<string, Array<{ key: string; label: string }>> = subtabFields;

  useEffect(() => { fetchData(); }, [activeSubTab]);
  const fetchData = async () => {
    try {
      setErrorMsg(null);
      const json = await getRelevansiPenelitian(activeSubTab);
      setData(json);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
      setData([]);
    }
  };

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const openAdd = () => { setFormData({}); setEditIndex(null); setShowForm(true); };
  const openEdit = (item: any) => { setFormData(item); setEditIndex(item.id ?? null); setShowForm(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editIndex !== null) await updateRelevansiPenelitian(activeSubTab, editIndex, formData);
      else await saveRelevansiPenelitian(activeSubTab, formData);
      await fetchData();
      setShowForm(false);
      setFormData({});
      setEditIndex(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      await deleteRelevansiPenelitian(activeSubTab, id);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    }
  };

  const renderColumns = () => (orderedFields[activeSubTab] || []).map(c => (
    <th key={c.key} className="px-4 py-2 text-left font-medium border-b text-gray-700 bg-gray-50">{c.label}</th>
  ));

  const renderRows = () => {
    const cols = orderedFields[activeSubTab] || [];
    if (data.length === 0)
      return (
        <tr>
          <td colSpan={cols.length + 1} className="py-4 text-center text-gray-500 italic">Belum ada data</td>
        </tr>
      );

    return data.map(item => (
      <tr key={item.id ?? Math.random()} className="hover:bg-gray-50 transition">
        {cols.map(c => (
          <td key={c.key} className="px-4 py-2 border-b">{item[c.key] ?? ''}</td>
        ))}
        <td className="px-4 py-2 border-b text-center">
          <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-2"><Edit size={16} /></button>
          <button onClick={() => item.id && handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Header atas */}
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

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map(tab => (
              <Link key={tab.href} href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm transition ${pathname === tab.href ? 'bg-blue-100 text-blue-900 font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Subtab */}
          <div className="flex gap-2 border-b pb-2 mb-4 overflow-x-auto">
            {Object.keys(subtabFields).map(key => (
              <button key={key} onClick={() => setActiveSubTab(key)}
                className={`px-4 py-2 text-sm rounded-t-lg ${activeSubTab === key ? 'bg-blue-100 text-blue-900 font-semibold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {key.replace(/-/g, ' ')}
              </button>
            ))}
          </div>

          {/* === TABLE SECTION === */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 capitalize">Data {activeSubTab.replace('-', ' ')}</h3>
              <div className="flex gap-2">
                <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"><Plus size={16} /> Tambah Data</button>
                <label className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer transition">
                  <Upload size={16} /> Import Excel
                  <input onChange={() => { }} type="file" accept=".xlsx,.xls" className="hidden" />
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              {errorMsg && <div className="p-4 bg-red-50 text-red-700 border-t border-red-100">Error: {errorMsg}</div>}

              <table className="w-full text-sm text-left border border-gray-200">
                <thead>
                  <tr>{renderColumns()}<th className="px-4 py-2 text-center font-medium border-b bg-gray-50 text-gray-700">Aksi</th></tr>
                </thead>
                <tbody>{renderRows()}</tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
