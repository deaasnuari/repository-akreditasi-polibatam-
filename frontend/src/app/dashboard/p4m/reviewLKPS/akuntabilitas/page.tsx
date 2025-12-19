'use client';
import React, { useEffect, useState } from 'react';
import { FileText, Download, Save, Edit, Trash2, X, Eye, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getReviews as fetchReviews, createReview as postReview } from '@/services/reviewService';
import {
  fetchAkuntabilitasData,
  createAkuntabilitasData,
  updateAkuntabilitasData,
  deleteAkuntabilitasData,
  saveDraftAkuntabilitas,
  loadDraftAkuntabilitas
} from '@/services/akuntabilitasService';
import { getAllProdi } from '@/services/userService';

export default function AkuntabilitasPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState<'tataKelola' | 'sarana'>('tataKelola');
  const [tabData, setTabData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [prodiList, setProdiList] = useState<string[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Diterima' | 'Perlu Revisi'>('Diterima');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Handler import Excel dihilangkan. Data import tidak lagi tersedia via UI.

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/p4m/reviewLKPS' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/p4m/reviewLKPS/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/p4m/reviewLKPS/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/p4m/reviewLKPS/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/p4m/reviewLKPS/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/p4m/reviewLKPS/diferensiasi-misi' },
  ];

  const fetchData = async () => {
    const data = await fetchAkuntabilitasData(activeSubTab, selectedProdi);
    setTabData(data);
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

  useEffect(() => {
    fetchData();
  }, [activeSubTab, selectedProdi]);

  // openAdd (tambah data) dihilangkan — UI tombol tambah sudah dihapus

  const handleSave = async () => {
    let res;
    if (editIndex !== null && tabData[editIndex].id) {
      res = await updateAkuntabilitasData(tabData[editIndex].id, activeSubTab, formData, selectedProdi);
    } else {
      res = await createAkuntabilitasData(activeSubTab, formData, selectedProdi);
    }

    if (res.success) {
      fetchData();
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
      fetchData();
    } else alert(res.message);
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
      await postReview('akuntabilitas', selectedItem.id, reviewNotes, backendStatus);
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Download size={16} /> Export PDF</button>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  pathname === tab.href
                    ? 'bg-[#183A64] text-[#ADE7F7]'
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
          {/* Sub-tabs */}
          <div className="flex gap-2 border-b pb-2 mb-4">
            <button
              onClick={() => setActiveSubTab('tataKelola')}
              className={`px-4 py-2 rounded-t-lg text-sm font-semibold ${
                activeSubTab === 'tataKelola'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sistem Tata Kelola
            </button>
            <button
              onClick={() => setActiveSubTab('sarana')}
              className={`px-4 py-2 rounded-t-lg text-sm font-semibold ${
                activeSubTab === 'sarana'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

              {/* Tombol Tambah / Import dihilangkan sesuai permintaan */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prodi
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tabData.length === 0 ? (
                    <tr>
                      <td colSpan={fields.length + 2} className="text-center py-6 text-gray-500">
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
                        <td className="px-6 py-4 text-gray-800">
                          {item.prodi || '-'}
                        </td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
                      {Object.keys(selectedItem.data || selectedItem)
                        .filter(k => k !== 'id')
                        .map(k => (
                          <div key={k} className="bg-white p-3 rounded border">
                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              {k.replace(/_/g, ' ')}
                            </label>
                            <p className="text-sm text-gray-900 mt-1 break-words">
                              {String((selectedItem.data || selectedItem)[k] ?? '-')}
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
