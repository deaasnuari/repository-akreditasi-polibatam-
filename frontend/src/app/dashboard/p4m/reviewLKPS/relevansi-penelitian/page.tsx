'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Save, Eye, X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getRelevansiPenelitian,
  saveRelevansiPenelitian,
  updateRelevansiPenelitian,
  deleteRelevansiPenelitian,
  SubTab, // Import SubTab type
} from '@/services/relevansiPenelitianService';
import { getReviews as fetchReviews, createReview as postReview } from '@/services/reviewService';
import { getAllProdi } from '@/services/userService';

export default function RelevansiPenelitianPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('sarana-prasarana');
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Diterima' | 'Perlu Revisi'>('Diterima');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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
 const subtabFields: Record<string, Array<{ key: string; label: string; type: string }>> = {
   'sarana-prasarana': [
      { key: 'namaprasarana', label: 'Nama Prasarana', type: 'text' },
      { key: 'dayatampung', label: 'Daya Tampung', type: 'number' },
      { key: 'luasruang', label: 'Luas Ruang (m²)', type: 'number' },
      { key: 'miliksendiri', label: 'Milik sendiri (M)/Sewa (W)', type: 'text' },
      { key: 'berlisensi', label: 'Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)', type: 'text' },
      { key: 'perangkat', label: 'Perangkat', type: 'text' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
    'hibah-dan-pembiayaan': [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'namadtpr', label: 'Nama DTPR (Ketua)', type: 'text' },
      { key: 'judulpenelitian', label: 'Judul Penelitian', type: 'text' },
      { key: 'jumlahmahasiswa', label: 'Jumlah Mahasiswa yang Terlibat', type: 'number' },
      { key: 'jenishibah', label: 'Jenis Hibah Penelitian', type: 'text' },
      { key: 'sumber', label: 'Sumber L/N/I', type: 'text' },
      { key: 'durasi', label: 'Durasi (tahun)', type: 'number' },
      { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp juta)', type: 'number' },
      { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp juta)', type: 'number' },
      { key: 'pendanaants', label: 'Pendanaan TS (Rp juta)', type: 'number' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
    'pengembangan-dtpr': [
      { key: 'tahunakademik', label: 'Tahun Akademik', type: 'text' },
      { key: 'jumlahdosendtpr', label: 'Jumlah Dosen DTPR', type: 'number' },
      { key: 'jenispengembangan', label: 'Jenis Pengembangan DTPR', type: 'text' },
      { key: 'namadtpr', label: 'Nama DTPR', type: 'text' },
      { key: 'jumlahts2', label: 'Jumlah TS-2', type: 'number' },
      { key: 'jumlahts1', label: 'Jumlah TS-1', type: 'number' },
      { key: 'jumlahts', label: 'Jumlah TS', type: 'number' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
    'kerjasama-penelitian': [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'judulkerjasama', label: 'Judul Kerjasama', type: 'text' },
      { key: 'mitrakerjasama', label: 'Mitra Kerja Sama', type: 'text' },
      { key: 'sumber', label: 'Sumber L/N/I', type: 'text' },
      { key: 'durasi', label: 'Durasi (Tahun)', type: 'number' },
      { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp Juta)', type: 'number' },
      { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp Juta)', type: 'number' },
      { key: 'pendanaants', label: 'Pendanaan TS (Rp Juta)', type: 'number' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
    'publikasi-penelitian': [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'namadtpr', label: 'Nama DTPR', type: 'text' },
      { key: 'judulpublikasi', label: 'Judul Publikasi', type: 'text' },
      { key: 'jenispublikasi', label: 'Jenis Publikasi (IB/I/S1,S2,S3,S4,T)', type: 'text' },
      { key: 'tahunts2', label: 'Tahun Terbit TS-2', type: 'text' },
      { key: 'tahunts1', label: 'Tahun Terbit TS-1', type: 'text' },
      { key: 'tahunts', label: 'Tahun Terbit TS', type: 'text' },
      { key: 'linkbukti', label: 'Link Bukti', type: 'text' },
    ],
    'perolehan-hki': [
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

  const handleReview = async (item: any) => {
    setSelectedItem(item);
    setReviewStatus('Diterima');
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedItem?.id) return;
    if (!reviewNotes.trim()) {
      alert('Catatan review harus diisi');
      return;
    }

    setSubmittingReview(true);
    try {
      const statusMap: Record<string, string> = {
        'Diterima': 'Approved',
        'Perlu Revisi': 'NeedsRevision'
      };

      const backendStatus = statusMap[reviewStatus] || 'Approved';
      await postReview('relevansi-penelitian', selectedItem.id, reviewNotes, backendStatus);
      alert('Review berhasil disimpan');
      setShowReviewModal(false);
      setSelectedItem(null);
      await fetchData();
    } catch (err) {
      console.error('Submit review error:', err);
      alert('Gagal menyimpan review');
    } finally {
      setSubmittingReview(false);
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
            <button 
              onClick={() => handleReview(item)} 
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-1.5 text-sm" 
              title="Review Data"
            >
              <Eye size={14} />
              Review
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
            </div>
          </div>

          {/* Modal Review */}
          {showReviewModal && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Review Data</h2>
                    <p className="text-sm text-gray-600 mt-1">Berikan penilaian dan catatan untuk data ini</p>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Data Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Info size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-gray-800">Data yang Direview</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.keys(selectedItem)
                        .filter(k => k !== 'id')
                        .map(k => (
                          <div key={k} className="bg-white p-3 rounded border">
                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              {k.replace(/_/g, ' ')}
                            </label>
                            <p className="text-sm text-gray-900 mt-1 break-words">
                              {String(selectedItem[k] ?? '-')}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Status Review */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status Review <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as 'Diterima' | 'Perlu Revisi')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Diterima">✓ Diterima</option>
                      <option value="Perlu Revisi">⚠ Perlu Revisi</option>
                    </select>
                  </div>

                  {/* Catatan Review */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catatan Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Berikan catatan, komentar, atau saran perbaikan..."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Catatan ini akan dikirimkan ke Tim Akreditasi
                    </p>
                  </div>

                  {/* Info Alert */}
                  {reviewStatus === 'Perlu Revisi' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                      <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Data akan dikembalikan untuk revisi</p>
                        <p className="mt-1">Tim Akreditasi akan menerima notifikasi dan dapat memperbaiki data sesuai catatan Anda.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="border-t p-6 bg-gray-50 flex justify-end gap-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewNotes.trim()}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Simpan Review
                      </>
                    )}
                  </button>
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
              <button key={key} onClick={()=>setActiveSubTab(key as SubTab)} className={`px-4 py-2 text-sm rounded-t-lg ${activeSubTab===key?'bg-blue-100 text-blue-900 font-semibold':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{key.replace(/-/g,' ')}</button>
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
                      <input type={f.type} name={f.key} value={formData[f.key]??''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
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
