'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Save, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getRelevansiPenelitian,
  saveRelevansiPenelitian,
  updateRelevansiPenelitian,
  deleteRelevansiPenelitian,
} from '@/services/relevansiPenelitianService';
import { getReviews as fetchReviews, createReview as postReview } from '@/services/reviewService';
import { getAllProdi } from '@/services/userService';

export default function RelevansiPenelitianPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState('sarana-prasarana');
  const [data, setData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  // Import Excel functionality removed (state and handlers removed)
  const [saving, setSaving] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [prodiList, setProdiList] = useState<string[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>('');

  // --- Tabs utama ---
  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/p4m/reviewLKPS' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/p4m/reviewLKPS/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/p4m/reviewLKPS/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/p4m/reviewLKPS/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/p4m/reviewLKPS/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/p4m/reviewLKPS/diferensiasi-misi' },
  ];

  // --- Subtab fields ---
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


  // Ordered fields (untuk tabel)
  const orderedFields: Record<string, Array<{ key: string; label: string }>> = subtabFields;

  // --- Fetch data ---
  useEffect(() => {
    fetchData();
  }, [activeSubTab, selectedProdi]);

  const fetchData = async () => {
    try {
      setErrorMsg(null);
      const json = await getRelevansiPenelitian(activeSubTab, selectedProdi);
      setData(json);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
      setData([]);
    }
  };

  const fetchProdi = async () => {
    try {
      const prodi = await getAllProdi();
      setProdiList(prodi);
    } catch (error) {
      console.error('Failed to fetch prodi list', error);
    }
  };

  useEffect(() => {
    fetchProdi();
  }, []);

  // --- Form handlers ---
  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  // openAdd (tambah data) dihilangkan; fungsi tambah tidak tersedia dari UI
  const openEdit = (item: any) => { setFormData(item); setEditIndex(item.id ?? null); setShowForm(true); };

  const handleViewDetail = async (item: any) => { 
    setSelectedItem(item); 
    setReviewNote('');
    setNotes([]);
    setShowDetail(true);
    try {
      setLoadingNotes(true);
      const existing = await fetchReviews('relevansi-penelitian', item.id);
      setNotes(existing || []);
    } catch (err) {
      console.error('Fetch notes error', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSaveReview = async () => {
    if (!selectedItem?.id) return;
    try {
      await postReview('relevansi-penelitian', selectedItem.id, reviewNote || '');
      const existing = await fetchReviews('relevansi-penelitian', selectedItem.id);
      setNotes(existing || []);
      setReviewNote('');
    } catch (err) {
      console.error('Save note error', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);
      if (editIndex !== null) {
        await updateRelevansiPenelitian(editIndex, formData, activeSubTab);
      } else {
        await saveRelevansiPenelitian(formData, activeSubTab);
      }
      await fetchData();
      setShowForm(false);
      setFormData({});
      setEditIndex(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      setErrorMsg(null);
      await deleteRelevansiPenelitian(id);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    }
  };

  // Import handlers removed since UI import removed

  // --- Table render ---
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
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={cols.length + 1} className="text-center py-6 text-gray-500">Belum ada data</td>
        </tr>
      );
    }

    return data.map((item, index) => (
      <tr key={item.id ?? index} className="bg-white hover:bg-gray-50 border-b">
        {cols.map(c => <td key={c.key} className="px-6 py-4 text-gray-800">{item[c.key] ?? ''}</td>)}
        <td className="px-6 py-4 text-center">
          <div className="flex gap-2 justify-center">
            <button onClick={()=>handleViewDetail(item)} className="text-blue-700 hover:text-blue-900 inline-flex items-center gap-1" title="Lihat Detail">
              <Eye size={16} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex w-full bg-gray-100">
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

          {/* Modal Detail */}
          {showDetail && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Detail Data</h2>
                  <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="space-y-4">
                  {Object.keys(selectedItem).filter(k => k !== 'id').map(k => (
                    <div key={k} className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{k.replace(/_/g,' ')}</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{String(selectedItem[k] ?? '-')}</p>
                    </div>
                  ))}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Sebelumnya</label>
                      {loadingNotes ? (
                        <p className="text-sm text-gray-500">Memuat catatan...</p>
                      ) : notes.length === 0 ? (
                        <p className="text-sm text-gray-500">Belum ada catatan</p>
                      ) : (
                        <div className="space-y-2 max-h-44 overflow-auto">
                          {notes.map((n) => (
                            <div key={n.id} className="border rounded p-3 bg-white">
                              <div className="text-xs text-gray-500">{n.user?.nama_lengkap || n.user?.username} • {new Date(n.created_at).toLocaleString()}</div>
                              <div className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{n.note}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tambahkan Catatan Review (Optional)</label>
                      <textarea value={reviewNote} onChange={(e)=>setReviewNote(e.target.value)} placeholder="Tambahkan catatan atau komentar review di sini..." rows={4} className="border p-3 rounded-lg w-full bg-white" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setShowDetail(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Tutup</button>
                  <button onClick={handleSaveReview} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Simpan Catatan</button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map(tab => (
              <Link key={tab.href} href={tab.href} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === tab.href 
                  ? 'bg-[#183A64] text-[#ADE7F7] shadow-md scale-105' 
                  : 'bg-gray-100 text-gray-700 hover:bg-[#ADE7F7] hover:text-[#183A64]'
              }`}>{tab.label}</Link>
            ))}
          </div>
          
          {/* Info P4M */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Mode Review P4M:</strong> Anda dapat melihat dan mengevaluasi data yang diinput oleh Tim Akreditasi
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Data {activeSubTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
          <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="">Semua Prodi</option>
              {prodiList.map((prodi) => (
                <option key={prodi} value={prodi}>
                  {prodi}
                </option>
              ))}
            </select>
            </div>
            </div>

          {/* Subtabs */}
          <div className="flex gap-2 border-b pb-2 mb-4 overflow-x-auto">
            {Object.keys(subtabFields).map(key => (
              <button key={key} onClick={()=>setActiveSubTab(key)} className={`px-4 py-2 text-sm rounded-t-lg ${activeSubTab===key?'bg-blue-100 text-blue-900 font-semibold':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{key.replace(/-/g,' ')}</button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 capitalize">Data {activeSubTab.replace('-', ' ')}</h3>
              {/* Tombol Tambah / Import dihilangkan sesuai permintaan */}
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

          {/* Import preview removed along with import functionality */}
          </div>
        </main>
      </div>
    </div>
  );
}
