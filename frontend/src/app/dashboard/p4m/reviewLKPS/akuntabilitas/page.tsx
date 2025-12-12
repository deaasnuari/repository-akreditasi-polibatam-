'use client';
import React, { useEffect, useState } from 'react';
import { FileText, Download, Save, Edit, Trash2, X, Eye } from 'lucide-react';
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

  const handleViewDetail = async (item: any) => { 
    setSelectedItem(item);
    setReviewNote('');
    setNotes([]);
    setShowDetail(true);
    try {
      setLoadingNotes(true);
      const existing = await fetchReviews('akuntabilitas', item.id);
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
      await postReview('akuntabilitas', selectedItem.id, reviewNote || '');
      const existing = await fetchReviews('akuntabilitas', selectedItem.id);
      setNotes(existing || []);
      setReviewNote('');
    } catch (err) {
      console.error('Save note error', err);
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Save size={16} /> Save Draft</button>
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
                                <button onClick={() => { setSelectedItem(item); setShowDetail(true); }} className="text-blue-700 hover:text-blue-900 inline-flex items-center gap-1" title="Lihat Detail">
                                  <Eye size={16} />
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

          {/* Modal Detail */}
          {showDetail && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Detail Data</h3>
                  <button onClick={() => setShowDetail(false)} className="text-gray-600 hover:text-gray-800">✕</button>
                </div>

                <div className="space-y-4">
                  {Object.keys(selectedItem.data || selectedItem).map((k) => (
                    <div key={k} className="bg-gray-50 p-4 rounded">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{k.replace(/_/g,' ')}</label>
                      <p className="text-gray-900">{String((selectedItem.data || selectedItem)[k] ?? '-')}</p>
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

                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowDetail(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Tutup</button>
                  <button onClick={handleSaveReview} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">Simpan Catatan</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
