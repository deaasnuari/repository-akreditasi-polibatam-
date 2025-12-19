'use client';
import React, { useEffect, useState } from 'react';
import { FileText, Download, Save, Eye, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getReviews as fetchReviews, createReview as postReview } from '@/services/reviewService';
import { getAllProdi } from '@/services/userService';

export default function P4MReviewBudayaMutuPage() {
  type SubTab = 'tupoksi' | 'pendanaan' | 'penggunaan-dana' | 'ewmp' | 'ktk' | 'spmi';

  const pathname = usePathname();
  const tableTitles: Record<SubTab, string> = {
    tupoksi: 'Tabel 1.A.1 Tabel Pimpinan dan Tupoksi UPPS dan PS',
    pendanaan: 'Tabel 1.A.2 Sumber Pendanaan UPPS/PS',
    'penggunaan-dana': 'Tabel 1.A.3 Penggunaan Dana UPPS/PS',
    ewmp: 'Tabel 1.A.4 Rata-rata Beban DTPR per semester (EWMP) pada TS',
    ktk: 'Tabel 1.A.5 Kualifikasi Tenaga Kependidikan',
    spmi: 'Tabel 1.B Tabel Unit SPMI dan SDM',
  };

  const [activeTab, setActiveTab] = useState('/dashboard/p4m/reviewLKPS');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('tupoksi');
  const [tabData, setTabData] = useState<Record<SubTab, any[]>>({
    tupoksi: [],
    pendanaan: [],
    'penggunaan-dana': [],
    ewmp: [],
    ktk: [],
    spmi: [],
  });
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [prodiList, setProdiList] = useState<string[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Diterima' | 'Perlu Revisi'>('Diterima');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // State untuk popup notifikasi
  const [popup, setPopup] = useState<{ 
    show: boolean; 
    message: string; 
    type: 'success' | 'error' | 'info' 
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  // State untuk struktur organisasi
  const [strukturFileUrl, setStrukturFileUrl] = useState('');
  const [strukturFileName, setStrukturFileName] = useState('');

  const API_BASE = 'http://localhost:5000/api/budaya-mutu';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/p4m/reviewLKPS' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/p4m/reviewLKPS/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/p4m/reviewLKPS/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/p4m/reviewLKPS/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/p4m/reviewLKPS/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/p4m/reviewLKPS/diferensiasi-misi' },
  ];

  // Fungsi untuk menampilkan popup
  const showPopup = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: 'success' }), 3000);
  };

  // Komponen Popup
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
          <button 
            onClick={() => setPopup({ show: false, message: '', type: 'success' })}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
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

  useEffect(() => {
    fetchStrukturOrganisasi();
  }, []);

  const fetchData = async () => {
    try {
      let url = `${API_BASE}?type=${activeSubTab}`;
      if (selectedProdi) {
        url += `&prodi=${selectedProdi}`;
      }
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        setTabData(prev => ({ ...prev, [activeSubTab]: [] }));
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response bukan JSON:', await res.text());
        setTabData(prev => ({ ...prev, [activeSubTab]: [] }));
        return;
      }

      const json = await res.json();
      
      if (json.success && Array.isArray(json.data)) {
        setTabData(prev => ({
          ...prev,
          [activeSubTab]: json.data.map(item => ({
            id: item.id,
            data: item.data
          }))
        }));
      } else {
        setTabData(prev => ({ ...prev, [activeSubTab]: [] }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setTabData(prev => ({ ...prev, [activeSubTab]: [] }));
    }
  };

  const fetchStrukturOrganisasi = async () => {
    try {
      const res = await fetch(`${API_BASE}/struktur`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const json = await res.json();

      if (json.success && json.file) {
        setStrukturFileName(json.file.fileName);
        setStrukturFileUrl(`http://localhost:5000${json.file.fileUrl}`);
      }
    } catch (err) {
      console.error('Fetch struktur error:', err);
    }
  };

  const handleViewDetail = async (item: any) => {
    setSelectedItem(item);
    setReviewNote('');
    setNotes([]);
    setShowDetail(true);
    try {
      setLoadingNotes(true);
      const existing = await fetchReviews('budaya-mutu', item.id);
      setNotes(existing || []);
    } catch (err) {
      console.error('Fetch notes error', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSaveReview = async () => {
    if (!selectedItem?.id) return showPopup('Gagal: item tidak ditemukan', 'error');
    try {
      await postReview('budaya-mutu', selectedItem.id, reviewNote || '');
      showPopup('Catatan review berhasil disimpan', 'success');
      // refresh notes
      const existing = await fetchReviews('budaya-mutu', selectedItem.id);
      setNotes(existing || []);
      setReviewNote('');
    } catch (err) {
      console.error('Save note error', err);
      showPopup('Gagal menyimpan catatan', 'error');
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedItem?.id) {
      showPopup('Item tidak ditemukan', 'error');
      return;
    }

    if (!reviewNotes.trim()) {
      showPopup('Mohon isi catatan review', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      // Simpan review dengan status
      await postReview('budaya-mutu', selectedItem.id, reviewNotes);
      
      // TODO: Update status di backend jika diperlukan
      // Untuk sekarang kita hanya simpan catatan dengan status di dalamnya
      const statusNote = `[Status: ${reviewStatus}] ${reviewNotes}`;
      
      showPopup(`Review berhasil disimpan dengan status: ${reviewStatus}`, 'success');
      setShowReviewModal(false);
      setReviewNotes('');
      setReviewStatus('Diterima');
    } catch (err) {
      console.error('Submit review error:', err);
      showPopup('Gagal menyimpan review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const subTabFields: Record<SubTab, { label: string; key: string }[]> = {
    tupoksi: [
      { key: 'unitKerja', label: 'Unit Kerja' },
      { key: 'namaKetua', label: 'Nama Ketua' },
      { key: 'periode', label: 'Periode' },
      { key: 'pendidikanTerakhir', label: 'Pendidikan Terakhir' },
      { key: 'jabatanFungsional', label: 'Jabatan Fungsional' },
      { key: 'tugasPokokDanFungsi', label: 'Tugas Pokok dan Fungsi' },
    ],
    pendanaan: [
      { key: 'sumberPendanaan', label: 'Sumber Pendanaan' },
      { key: 'ts2', label: 'TS-2' },
      { key: 'ts1', label: 'TS-1' },
      { key: 'ts', label: 'TS' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    'penggunaan-dana': [
      { key: 'penggunaanDana', label: 'Penggunaan Dana' },
      { key: 'ts2', label: 'TS-2' },
      { key: 'ts1', label: 'TS-1' },
      { key: 'ts', label: 'TS' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    ewmp: [
      { key: 'no', label: 'No' },
      { key: 'namaDTPR', label: 'Nama DTPR' },
      { key: 'psSendiri', label: 'PS Sendiri' },
      { key: 'psLainPTSendiri', label: 'PS Lain PT Sendiri' },
      { key: 'ptLain', label: 'PT Lain' },
      { key: 'sksPenelitian', label: 'SKS Penelitian' },
      { key: 'sksPengabdian', label: 'SKS Pengabdian' },
      { key: 'manajemenPTSendiri', label: 'Manajemen PT Sendiri' },
      { key: 'manajemenPTLain', label: 'Manajemen PT Lain' },
      { key: 'totalSKS', label: 'Total SKS' },
    ],
    ktk: [
      { key: 'no', label: 'No' },
      { key: 'jenisTenagaKependidikan', label: 'Jenis Tenaga Kependidikan' },
      { key: 's3', label: 'S3' },
      { key: 's2', label: 'S2' },
      { key: 's1', label: 'S1' },
      { key: 'd4', label: 'D4' },
      { key: 'd3', label: 'D3' },
      { key: 'd2', label: 'D2' },
      { key: 'd1', label: 'D1' },
      { key: 'sma', label: 'SMA' },
      { key: 'unitKerja', label: 'Unit Kerja' },
    ],
    spmi: [
      { key: 'unitSPMI', label: 'Unit SPMI' },
      { key: 'namaUnitSPMI', label: 'Nama Unit SPMI' },
      { key: 'dokumenSPMI', label: 'Dokumen SPMI' },
      { key: 'jumlahAuditorMutuInternal', label: 'Jumlah Auditor Mutu Internal' },
      { key: 'certified', label: 'Certified' },
      { key: 'nonCertified', label: 'Non Certified' },
      { key: 'frekuensiAudit', label: 'Frekuensi Audit' },
      { key: 'buktiCertifiedAuditor', label: 'Bukti Certified Auditor' },
      { key: 'laporanAudit', label: 'Laporan Audit' },
    ],
  };

  const data = tabData[activeSubTab];

  const renderColumns = () => (
    <tr>
      {subTabFields[activeSubTab].map(col => (
        <th key={col.key} className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
          {col.label}
        </th>
      ))}
      <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
    </tr>
  );

  const renderRows = () => {
    if (!data.length)
      return (
        <tr>
          <td colSpan={subTabFields[activeSubTab].length + 1} className="text-center py-6 text-gray-500">
            Belum ada data untuk direview
          </td>
        </tr>
      );

    return data.map((item, index) => (
      <tr key={item.id} className="bg-white rounded-lg shadow-sm hover:bg-gray-50 border-b">
        {subTabFields[activeSubTab].map(col => (
          <td key={col.key} className="px-3 md:px-6 py-4 text-sm text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
            {col.key === 'no' ? (
              index + 1
            ) : col.key === 'linkBukti' || col.key === 'dokumenSPMI' || col.key === 'buktiCertifiedAuditor' || col.key === 'laporanAudit' ? (
              item.data?.[col.key] ? (
                <a href={item.data[col.key]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Lihat
                </a>
              ) : (
                '-'
              )
            ) : (
              <div className="max-w-xs truncate">
                {item.data?.[col.key] ?? '-'}
              </div>
            )}
          </td>
        ))}
        <td className="px-6 py-4 text-center">
          <button 
            onClick={() => {
              setSelectedItem(item);
              setReviewStatus('Diterima');
              setReviewNotes('');
              setShowReviewModal(true);
            }} 
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 inline-flex items-center gap-1 text-xs font-medium"
            title="Review Item"
          >
            <Eye size={14} />
            Review
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex w-full bg-gray-100 min-h-screen">
      <PopupNotification />

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>

      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">

          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-900" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Review LKPS - P4M</h1>
                <p className="text-sm text-gray-600">Review data kuantitatif berdasarkan kriteria akreditasi</p>
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
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#183A64] text-[#ADE7F7] shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-[#ADE7F7] hover:text-[#183A64]'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Data {activeSubTab.replace('-', ' ')}</h2>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">{tableTitles[activeSubTab]}</p>
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
          {/* Info P4M */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Mode Review P4M:</strong> Anda dapat melihat dan mengevaluasi data yang diinput oleh Tim Akreditasi
            </p>
          </div>

          {/* Budaya Mutu Tab */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            
            {/* Struktur Organisasi - View Only */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Struktur Organisasi</h3>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center">
                {strukturFileUrl ? (
                  <div>
                    {strukturFileUrl.endsWith('.pdf') ? (
                      <iframe
                        src={strukturFileUrl}
                        className="w-full h-96 border rounded-lg"
                        title="Struktur Organisasi PDF"
                      />
                    ) : (
                      <img
                        src={strukturFileUrl}
                        alt="Struktur Organisasi"
                        className="mx-auto max-h-96 object-contain rounded-lg shadow"
                      />
                    )}
                    <p className="mt-2 text-sm text-gray-600 italic">
                      {strukturFileName}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Belum ada file struktur organisasi yang diupload.</p>
                )}
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 border-b pb-2 mb-4 overflow-x-auto">
              {['tupoksi','pendanaan','penggunaan-dana','ewmp','ktk','spmi'].map(sub => (
                <button
                  key={sub}
                  onClick={() => setActiveSubTab(sub as SubTab)}
                  className={`px-4 py-2 text-sm rounded-t-lg whitespace-nowrap font-medium transition ${
                    activeSubTab === sub
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sub.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-6 py-4 border-b bg-gray-50 gap-2 md:gap-0">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">Review Data {activeSubTab}</h3>
                <h2 className="text-sm text-gray-600">{tableTitles[activeSubTab]}</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    {renderColumns()}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {renderRows()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Review - Seperti LED */}
            {showReviewModal && selectedItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Review Data {activeSubTab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </h2>
                    <button 
                      onClick={() => setShowReviewModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Data Preview - Read Only */}
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-700 mb-3">Data yang Direview:</h3>
                    {subTabFields[activeSubTab]
                      .filter(field => field.key !== 'no')
                      .map(field => (
                        <div key={field.key} className="grid grid-cols-3 gap-2 py-2 border-b">
                          <label className="text-sm font-medium text-gray-600">
                            {field.label}:
                          </label>
                          <p className="col-span-2 text-sm text-gray-900">
                            {field.key === 'linkBukti' || 
                             field.key === 'dokumenSPMI' || 
                             field.key === 'buktiCertifiedAuditor' || 
                             field.key === 'laporanAudit' ? (
                              selectedItem.data?.[field.key] ? (
                                <a 
                                  href={selectedItem.data[field.key]} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline"
                                >
                                  Buka Link
                                </a>
                              ) : (
                                '-'
                              )
                            ) : (
                              selectedItem.data?.[field.key] || '-'
                            )}
                          </p>
                        </div>
                      ))}
                  </div>

                  {/* Form Review */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Review <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value as 'Diterima' | 'Perlu Revisi')}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Diterima">Diterima</option>
                        <option value="Perlu Revisi">Perlu Revisi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan Review <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Berikan catatan atau feedback untuk item ini..."
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      disabled={submittingReview}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewNotes.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submittingReview ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Submit Review
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Detail - Keep for viewing notes history */}
            {showDetail && selectedItem && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Detail Data {activeSubTab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </h2>
                    <button 
                      onClick={() => setShowDetail(false)} 
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {subTabFields[activeSubTab]
                      .filter(field => field.key !== 'no')
                      .map(field => (
                        <div key={field.key} className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                          </label>
                          <p className="text-gray-900">
                            {field.key === 'linkBukti' || 
                             field.key === 'dokumenSPMI' || 
                             field.key === 'buktiCertifiedAuditor' || 
                             field.key === 'laporanAudit' ? (
                              selectedItem.data?.[field.key] ? (
                                <a 
                                  href={selectedItem.data[field.key]} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline"
                                >
                                  Buka Link
                                </a>
                              ) : (
                                '-'
                              )
                            ) : (
                              selectedItem.data?.[field.key] || '-'
                            )}
                          </p>
                        </div>
                      ))}

                    {/* Area Catatan Review */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Sebelumnya</label>
                        {loadingNotes ? (
                          <p className="text-sm text-gray-500">Memuat catatan...</p>
                        ) : notes.length === 0 ? (
                          <p className="text-sm text-gray-500">Belum ada catatan</p>
                        ) : (
                          <div className="space-y-2 max-h-44 overflow-auto">
                            {notes.map((n: any) => (
                              <div key={n.id} className="border rounded p-3 bg-white">
                                <div className="text-xs text-gray-500">{n.user?.nama_lengkap || n.user?.username} • {new Date(n.created_at).toLocaleString()}</div>
                                <div className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{n.note}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tambahkan Catatan Review (Optional)
                        </label>
                        <textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Tambahkan catatan atau komentar review di sini..."
                          rows={4}
                          className="border p-3 rounded-lg w-full bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button 
                      onClick={() => setShowDetail(false)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Tutup
                    </button>
                    <button 
                      onClick={handleSaveReview}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                    >
                      Simpan Catatan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}