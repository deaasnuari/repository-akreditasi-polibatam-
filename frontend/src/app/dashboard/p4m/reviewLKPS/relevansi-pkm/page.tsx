'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Edit, Trash2, X, Eye, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getReviews as fetchReviews, createReview as postReview } from '@/services/reviewService';
import { getAllProdi } from '@/services/userService';

export default function RelevansiPkmPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState('sarana-prasarana');
  const [data, setData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prodiList, setProdiList] = useState<string[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Diterima' | 'Perlu Revisi'>('Diterima');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const API_BASE = 'http://localhost:5000/api/relevansi-pkm';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/p4m/reviewLKPS' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/p4m/reviewLKPS/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/p4m/reviewLKPS/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/p4m/reviewLKPS/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/p4m/reviewLKPS/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/p4m/reviewLKPS/diferensiasi-misi' },
  ];

  useEffect(() => {
    fetchData();
  }, [activeSubTab, selectedProdi]);

  const fetchData = async () => {
    try {
      setErrorMsg(null);
      let url = `${API_BASE}?subtab=${activeSubTab}`;
      if (selectedProdi) {
        url += `&prodi=${selectedProdi}`;
      }
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${res.status}`);
      }
      
      const json = await res.json();
      setData(json.data ?? json ?? []);
    } catch (err: any) {
      console.error('fetchData error', err);
      setErrorMsg(err?.message || String(err));
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

  // =============== FORM ===============
  // openAdd (tambah data) dihilangkan — UI tombol tambah sudah dihapus

  const openEdit = (item: any) => {
    setFormData({ ...item });
    setEditIndex(item.id ?? null);
    setShowForm(true);
  };

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);

      const method = editIndex ? 'PUT' : 'POST';
      const url = editIndex ? `${API_BASE}/${editIndex}` : `${API_BASE}`;

      const payload = { ...formData, type: activeSubTab };
      
      console.log('🚀 Sending data:', payload); // Debug log

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      // Parse response body terlebih dahulu
      const json = await res.json();

      // Cek status response
      if (!res.ok) {
        throw new Error(json.message || json.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      alert(json.message || 'Data berhasil disimpan');
      setShowForm(false);
      setFormData({});
      setEditIndex(null);
      await fetchData();
    } catch (err: any) {
      console.error('❌ handleSubmit error:', err);
      setErrorMsg(err?.message || String(err));
      alert(`Gagal menyimpan data: ${err?.message || String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!item.id) {
      alert('ID tidak ditemukan');
      return;
    }
    
    if (!confirm('Hapus data ini?')) return;

    try {
      const res = await fetch(`${API_BASE}/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || `HTTP ${res.status}`);
      }

      alert(json.message || 'Data berhasil dihapus');
      await fetchData();
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      alert(`Gagal menghapus data: ${err?.message || String(err)}`);
    }
  };

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
      await postReview('relevansi-pkm', selectedItem.id, reviewNotes, backendStatus);
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

  const subtabFields: Record<string, Array<{ key: string; label: string }>> = {
    'sarana-prasarana': [
      { key: 'namaprasarana', label: 'Nama Prasarana' },
      { key: 'dayatampung', label: 'Daya Tampung' },
      { key: 'luasruang', label: 'Luas Ruang (m²)' },
      { key: 'miliksendiri', label: 'Milik Sendiri (M)/Sewa (W)' },
      { key: 'berlisensi', label: 'Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)' },
      { key: 'perangkat', label: 'Perangkat' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
    'pkm-hibah': [
      { key: 'no', label: 'No' },
      { key: 'namadtpr', label: 'Nama DTPR (Sebagai Ketua PkM)' },
      { key: 'judulpkm', label: 'Judul PkM' },
      { key: 'jumlahmahasiswa', label: 'Jumlah Mahasiswa yang Terlibat' },
      { key: 'jenishibah', label: 'Jenis Hibah PkM' },
      { key: 'sumberdana', label: 'Sumber Dana L/N/I' },
      { key: 'durasi', label: 'Durasi (tahun)' },
      { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp Juta)' },
      { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp Juta)' },
      { key: 'pendanaants', label: 'Pendanaan TS (Rp Juta)' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
    'kerjasama-pkm': [
      { key: 'no', label: 'No' },
      { key: 'judulkerjasama', label: 'Judul Kerjasama' },
      { key: 'mitrakerjasama', label: 'Mitra kerja sama' },
      { key: 'sumber', label: 'Sumber L/N/I' },
      { key: 'durasi', label: 'Durasi (tahun)' },
      { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp Juta)' },
      { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp Juta)' },
      { key: 'pendanaants', label: 'Pendanaan TS (Rp Juta)' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
    'diseminasi-pkm': [
      { key: 'no', label: 'No' },
      { key: 'namadtpr', label: 'Nama DTPR' },
      { key: 'juduldiseminasi', label: 'Judul Diseminasi' },
      { key: 'jenisdiseminasi', label: 'Jenis Diseminasi' },
      { key: 'tahunts2', label: 'Tahun TS-2' },
      { key: 'tahunts1', label: 'Tahun TS-1' },
      { key: 'tahunts', label: 'Tahun TS' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
    'hki-pkm': [
      { key: 'no', label: 'No' },
      { key: 'judul', label: 'Judul' },
      { key: 'jenishki', label: 'Jenis HKI' },
      { key: 'namadtpr', label: 'Nama DTPR' },
      { key: 'tahunts2', label: 'Tahun Perolehan TS-2' },
      { key: 'tahunts1', label: 'Tahun Perolehan TS-1' },
      { key: 'tahunts', label: 'Tahun Perolehan TS' },
      { key: 'linkbukti', label: 'Link Bukti' },
    ],
  };

  const renderColumns = () => (
    <tr>
      {(subtabFields[activeSubTab] ?? []).map((c) => (
        <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {c.label}
        </th>
      ))}
      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
    </tr>
  );

  const renderRows = () => {
    const cols = subtabFields[activeSubTab] ?? [];
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={cols.length + 1} className="text-center py-6 text-gray-500">Belum ada data</td>
        </tr>
      );
    }

    return data.map((item: any, index: number) => (
      <tr key={item.id ?? index} className="bg-white hover:bg-gray-50 border-b">
        {cols.map((c) => (
          <td key={c.key} className="px-6 py-4 text-gray-800">{item[c.key] ?? ''}</td>
        ))}
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === tab.href
                    ? 'bg-[#183A64] text-[#ADE7F7] shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-[#ADE7F7] hover:text-[#183A64]'
                }`}
              >
                {tab.label}
              </Link>
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
            {[
              { key: 'sarana-prasarana', label: 'Sarana & Prasarana PkM' },
              { key: 'pkm-hibah', label: 'PkM DTPR, Hibah & Pembiayaan' },
              { key: 'kerjasama-pkm', label: 'Kerjasama PkM' },
              { key: 'diseminasi-pkm', label: 'Diseminasi PkM' }, // Added this subtab
              { key: 'hki-pkm', label: 'Perolehan HKI PkM' },
            ].map((sub) => (
              <button
                key={sub.key}
                onClick={() => setActiveSubTab(sub.key)}
                className={`px-4 py-2 text-sm rounded-t-lg ${
                  activeSubTab === sub.key
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 capitalize">
                Data {activeSubTab.replace('-', ' ')}
              </h3>
              {/* Tombol Tambah dihilangkan sesuai permintaan */}
            </div>

            <div className="overflow-x-auto px-4 py-2">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 border-t border-red-100">
                  ❌ Error: {errorMsg}
                </div>
              )}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">{renderColumns()}</thead>
                <tbody className="bg-white divide-y divide-gray-200">{renderRows()}</tbody>
              </table>
            </div>
          </div>
          </div>

          {/* Modal Tambah/Edit */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {editIndex !== null ? 'Edit Data' : 'Tambah Data Baru'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setErrorMsg(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    ❌ {errorMsg}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(subtabFields[activeSubTab] || []).map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm text-gray-700 mb-1">
                        {f.label}
                      </label>
                      <input
                        name={f.key}
                        value={formData[f.key] ?? ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={f.label}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setErrorMsg(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          )}

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
        </main>
      </div>
    </div>
  );
}