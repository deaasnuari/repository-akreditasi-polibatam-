'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { FileText, Download, Save, Edit, Trash2, Eye, X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { relevansiPendidikanService, SubTab, DataItem } from '@/services/relevansiPendidikanService';
import { getReviews as fetchReviews, createReview as postReview } from '@/services/reviewService';
import { getAllProdi } from '@/services/userService';

// --- Table titles ---
const tableTitles: Record<SubTab, string> = {
  mahasiswa: 'Tabel 2.A.1 Data Mahasiswa',
  'keragaman-asal': 'Tabel 2.A.2 Keragaman Asal Mahasiswa',
  'kondisi-jumlah-mahasiswa': 'Tabel 2.A.3 Kondisi Jumlah Mahasiswa',
  'tabel-pembelajaran': 'Tabel 2.B.1 Tabel Isi Pembelajaran',
  'pemetaan-CPL-PL': 'Tabel 2.B.2 Pemetaan Capaian Pembelajaran Lulusan dan Profil Lulusan',
  'peta-pemenuhan-CPL': 'Tabel 2.B.3 Peta Pemenuhan CPL',
  'rata-rata-masa-tunggu-lulusan': 'Tabel 2.B.4 Rata-rata Masa Tunggu Lulusan untuk Bekerja Pertama Kali',
  'kesesuaian-bidang': 'Tabel 2.B.5. Kesesuaian Bidang Kerja Lulusan',
  'kepuasan-pengguna': 'Tabel 2.B.6. Kepuasan Pengguna Lulusan',
  fleksibilitas: 'Tabel 2.C Fleksibilitas Dalam Proses Pembelajaran',
  'rekognisi-apresiasi': 'Tabel 2.D Rekognisi dan Apresiasi Kompetensi Lulusan',
};

export default function RelevansiPendidikanPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('mahasiswa');
  const [data, setData] = useState<DataItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<DataItem>({});
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [prodiList, setProdiList] = useState<string[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Diterima' | 'Perlu Revisi'>('Diterima');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/p4m/reviewLKPS' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/p4m/reviewLKPS/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/p4m/reviewLKPS/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/p4m/reviewLKPS/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/p4m/reviewLKPS/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/p4m/reviewLKPS/diferensiasi-misi' },
  ];

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      const result = await relevansiPendidikanService.fetchData(activeSubTab, selectedProdi);
      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
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

  useEffect(() => {
    fetchData();
  }, [activeSubTab, selectedProdi]);

  const handleSave = async () => {
    try {
      const result = formData.id
        ? await relevansiPendidikanService.updateData(formData.id, formData, activeSubTab)
        : await relevansiPendidikanService.createData(formData, activeSubTab);

      if (result.success) {
        alert('✅ Data berhasil disimpan');
        setShowForm(false);
        fetchData();
      } else {
        alert(result.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleEdit = (item: DataItem) => {
    setFormData(item);
    const idx = data.findIndex((d) => d.id === item.id);
    setEditIndex(idx !== -1 ? idx : null);
    setShowForm(true);
  };

  const handleReview = async (item: DataItem) => {
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
      await postReview('relevansi-pendidikan', selectedItem.id, reviewNotes, backendStatus);
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

  const handleDelete = async (id?: number) => {
    if (!id || !confirm('Yakin hapus data ini?')) return;
    try {
      const result = await relevansiPendidikanService.deleteData(id);
      if (result.success) {
        alert('🗑️ Data dihapus');
        setData(prev => prev.filter(d => d.id !== id));
      } else {
        alert(result.message || 'Gagal menghapus');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Terjadi kesalahan saat menghapus data');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['daya_tampung','pendaftar','diterima','aktif','sks','semester','jumlah'].includes(name)
        ? Number(value)
        : value,
    });
  };

  // --- Render Table ---
  const renderTable = () => {
    const emptyColSpan = 6;
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        {activeSubTab === 'mahasiswa' ? (
          // TABEL MAHASISWA - STRUKTUR MULTI-HEADER (SAMA DENGAN TIM AKREDITASI)
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm text-gray-700 border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                {/* Row 1 - Main Headers */}
                <tr>
                  <th rowSpan={3} className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold min-w-[80px]">TS</th>
                  <th rowSpan={3} className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold min-w-[100px]">Daya<br/>Tampung</th>
                  <th colSpan={3} className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold text-center">Jumlah Calon Mahasiswa</th>
                  <th colSpan={6} className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold text-center">Jumlah Mahasiswa Baru</th>
                  <th colSpan={6} className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold text-center">Jumlah Mahasiswa Aktif</th>
                  <th rowSpan={3} className="border border-gray-300 px-2 py-2 text-center font-semibold sticky right-0 min-w-[100px] bg-white">Aksi</th>
                </tr>

                {/* Row 2 - Sub Headers */}
                <tr>
                  <th rowSpan={2} className="border border-gray-300 px-2 py-2 font-semibold text-center text-xs">Pendaftar</th>
                  <th rowSpan={2} className="border border-gray-300 px-2 py-2 font-semibold text-center text-xs">Pendaftar<br/>Afirmasi</th>
                  <th rowSpan={2} className="border border-gray-300 px-2 py-2 font-semibold text-center text-xs">Pendaftar<br/>Kebutuhan<br/>Khusus</th>
                  
                  <th colSpan={3} className="border border-gray-300 px-2 py-2 font-semibold text-center">Reguler</th>
                  <th colSpan={3} className="border border-gray-300 px-2 py-2 font-semibold text-center">RPL</th>
                  
                  <th colSpan={3} className="border border-gray-300 px-2 py-2 font-semibold text-center">Reguler</th>
                  <th colSpan={3} className="border border-gray-300 px-2 py-2 font-semibold text-center">RPL</th>
                </tr>

                {/* Row 3 - Detail Headers */}
                <tr>
                  {/* Mahasiswa Baru - Reguler */}
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Diterima</th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Afirmasi</th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Kebutuhan<br/>Khusus</th>
                  
                  {/* Mahasiswa Baru - RPL */}
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Diterima</th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Afirmasi</th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Kebutuhan<br/>Khusus</th>
                  
                  {/* Mahasiswa Aktif - Reguler */}
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Diterima</th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Afirmasi</th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Kebutuhan<br/>Khusus</th>
                  
                  {/* Mahasiswa Aktif - RPL */}
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Diterima</th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Afirmasi</th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold">Kebutuhan<br/>Khusus</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="py-6 text-center text-gray-500">Belum ada data</td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={item.id ?? `row-${index}`} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-2 text-center font-medium">{item.tahun}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{item.daya_tampung || '-'}</td>

                      {/* Calon Mahasiswa */}
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).calon_pendaftar || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).calon_pendaftar_afirmasi || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).calon_pendaftar_kebutuhan_khusus || '-'}</td>

                      {/* Mahasiswa Baru - Reguler */}
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).baru_reguler_diterima || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).baru_reguler_afirmasi || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).baru_reguler_kebutuhan_khusus || '-'}</td>

                      {/* Mahasiswa Baru - RPL */}
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).baru_rpl_diterima || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).baru_rpl_afirmasi || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).baru_rpl_kebutuhan_khusus || '-'}</td>

                      {/* Mahasiswa Aktif - Reguler */}
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).aktif_reguler_diterima || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).aktif_reguler_afirmasi || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).aktif_reguler_kebutuhan_khusus || '-'}</td>

                      {/* Mahasiswa Aktif - RPL */}
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).aktif_rpl_diterima || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).aktif_rpl_afirmasi || '-'}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{(item as any).aktif_rpl_kebutuhan_khusus || '-'}</td>

                      {/* Aksi - HANYA VIEW (berbeda dengan Tim Akreditasi) */}
                      <td className="border border-gray-300 px-2 py-2 text-center sticky right-0 bg-white">
                        <div className="flex justify-center gap-2">
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
        ) : (
          // TABEL LAINNYA - STRUKTUR BIASA
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-700 uppercase">
                {activeSubTab === 'keragaman-asal' && (
                  <>
                    <th className="px-4 py-3 text-left">Asal Mahasiswa</th>
                    <th className="px-4 py-3 text-center">TS-2</th>
                    <th className="px-4 py-3 text-center">TS-1</th>
                    <th className="px-4 py-3 text-center">TS</th>
                    <th className="px-4 py-3 text-center">Link Bukti</th>
                  </>
                )}
                {activeSubTab === 'kondisi-jumlah-mahasiswa' && (
                  <>
                    <th className="px-4 py-3 text-left">Alasan</th>
                    <th className="px-4 py-3 text-center">TS-2</th>
                    <th className="px-4 py-3 text-center">TS-1</th>
                    <th className="px-4 py-3 text-center">TS</th>
                    <th className="px-4 py-3 text-center">Jumlah</th>
                  </>
                )}
                {activeSubTab === 'tabel-pembelajaran' && (
                  <>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-center">Mata Kuliah</th>
                    <th className="px-4 py-3 text-center">SKS</th>
                    <th className="px-4 py-3 text-center">Semester</th> 
                    <th className="px-4 py-3 text-left">Profil Lulusan </th>
                  </>
                )}
                {activeSubTab === 'pemetaan-CPL-PL' && (
                  <>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">PL1</th>
                    <th className="px-4 py-3 text-left">PL2</th>
                  </>
                )}
                {activeSubTab === 'peta-pemenuhan-CPL' && (
                  <>
                    <th className="px-4 py-3 text-left">CPL</th>
                    <th className="px-4 py-3 text-left">CPMK</th>
                    <th className="px-4 py-3 text-left">SEMESTER 1</th>
                    <th className="px-4 py-3 text-left">SEMESTER 2</th>
                    <th className="px-4 py-3 text-left">SEMESTER 3</th>
                    <th className="px-4 py-3 text-left">SEMESTER 4</th>
                    <th className="px-4 py-3 text-left">SEMESTER 5</th>
                    <th className="px-4 py-3 text-left">SEMESTER 6</th>
                    <th className="px-4 py-3 text-left">SEMESTER 7</th>
                    <th className="px-4 py-3 text-left">SEMESTER 8</th>
                  </>
                )}
                {activeSubTab === 'rata-rata-masa-tunggu-lulusan' && (
                  <>
                    <th className="px-4 py-3 text-left">Tahun Lulus</th>
                    <th className="px-4 py-3 text-center">Jumlah Lulusan</th>
                    <th className="px-4 py-3 text-center">Jumlah Lulusan Yang Terlacak </th>
                    <th className="px-4 py-3 text-left">Rata-Rata Waktu Tunggu(Bulan)</th>
                  </>
                )}
                {activeSubTab === 'kesesuaian-bidang' && (
                  <>
                    <th className="px-4 py-3 text-left">Tahun Lulus</th>
                    <th className="px-4 py-3 text-center">Jumlah Lulusan</th>
                    <th className="px-4 py-3 text-center">Jumlah Lulusan Yang Terlacak</th>
                    <th className="px-4 py-3 text-center">Profesi Kerja Bidang Infokom </th>
                    <th className="px-4 py-3 text-left">Profesi Kerja Bidang NonInfokom</th>
                    <th className="px-4 py-3 text-left">Lingkup Kerja Internasional</th>
                    <th className="px-4 py-3 text-left">Lingkup Kerja Nasional</th>
                    <th className="px-4 py-3 text-left">Lingkup Kerja Wirausaha</th>
                  </>
                )}
                {activeSubTab === 'kepuasan-pengguna' && (
                  <>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-center">Jenis Kemampuan</th>
                    <th className="px-4 py-3 text-center">Sangat Baik</th>
                    <th className="px-4 py-3 text-center">Baik</th>
                    <th className="px-4 py-3 text-left">Cukup</th>
                    <th className="px-4 py-3 text-left">Kurang</th>
                    <th className="px-4 py-3 text-left">Rencana Tindak Lanjut UPPS/PS</th>
                  </>
                )}
                {activeSubTab === 'fleksibilitas' && (
                  <>
                    <th className="px-4 py-3 text-left">Tahun Akademik</th>
                    <th className="px-4 py-3 text-left">TS-2</th>
                    <th className="px-4 py-3 text-left">TS-1</th>
                    <th className="px-4 py-3 text-left">TS</th>
                    <th className="px-4 py-3 text-left">Link Bukti</th>
                  </>
                )}
                {activeSubTab === 'rekognisi-apresiasi' && (
                  <>
                    <th className="px-4 py-3 text-left">Sumber Rekognisi</th>
                    <th className="px-4 py-3 text-left">Jenis Pengakuan Lulusan (Rekognisi)</th>
                    <th className="px-4 py-3 text-left">TS-2</th>
                    <th className="px-4 py-3 text-left">TS-1</th>
                    <th className="px-4 py-3 text-left">TS</th>
                    <th className="px-4 py-3 text-left">Link Bukti</th>
                  </>
                )}
                <th className="w-24 px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={emptyColSpan} className="py-6 text-center text-gray-500">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id ?? `row-${index}`} className="hover:bg-gray-50">
                    {activeSubTab === 'keragaman-asal' && (
                      <>
                        <td className="px-4 py-3">{item.asalMahasiswa}</td>
                        <td className="px-4 py-3 text-center">{item.ts2}</td>
                        <td className="px-4 py-3 text-center">{item.ts1}</td>
                        <td className="px-4 py-3 text-center">{item.ts}</td>
                        <td className="px-4 py-3 text-center">
                          {item.linkBukti ? (
                            <a href={item.linkBukti} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              Lihat
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </>
                    )}
                    {activeSubTab === 'kondisi-jumlah-mahasiswa' && (
                      <>
                        <td className="px-4 py-3">{item.alasan}</td>
                        <td className="px-4 py-3 text-center">{item.ts2}</td>
                        <td className="px-4 py-3 text-center">{item.ts1}</td>
                        <td className="px-4 py-3 text-center">{item.ts}</td>
                        <td className="px-4 py-3 text-center">{item.jumlah}</td>
                      </>
                    )}
                    {activeSubTab === 'tabel-pembelajaran' && (
                      <>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 text-center">{item.mata_kuliah}</td>
                        <td className="px-4 py-3 text-center">{item.sks}</td>
                        <td className="px-4 py-3 text-center">{item.semester}</td>
                        <td className="px-4 py-3">{item.profil_lulusan}</td>
                      </>
                    )}
                    {activeSubTab === 'pemetaan-CPL-PL' && (
                      <>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{(item as any).pl1}</td>
                        <td className="px-4 py-3">{(item as any).pl2}</td>
                      </>
                    )}
                    {activeSubTab === 'peta-pemenuhan-CPL' && (
                      <>
                        <td className="px-4 py-3">{(item as any).cpl}</td>
                        <td className="px-4 py-3">{(item as any).cpmk}</td>
                        {Array.from({ length: 8 }, (_, i) => (
                          <td key={i} className="px-4 py-3">{(item as any)[`semester${i + 1}`]}</td>
                        ))}
                      </>
                    )}
                    {activeSubTab === 'rata-rata-masa-tunggu-lulusan' && (
                      <>
                        <td className="px-4 py-3">{item.tahun}</td>
                        <td className="px-4 py-3 text-center">{item.jumlah_lulusan}</td>
                        <td className="px-4 py-3 text-center">{item.aktif}</td>
                        <td className="px-4 py-3">{item.ts}</td>
                      </>
                    )}
                    {activeSubTab === 'kesesuaian-bidang' && (
                      <>
                        <td className="px-4 py-3">{item.tahun}</td>
                        <td className="px-4 py-3 text-center">{item.jumlah_lulusan}</td>
                        <td className="px-4 py-3 text-center">{item.aktif}</td>
                        <td className="px-4 py-3">{(item as any).profesi_infokom}</td>
                        <td className="px-4 py-3">{(item as any).profesi_noninfokom}</td>
                        <td className="px-4 py-3">{(item as any).lingkup_internasional}</td>
                        <td className="px-4 py-3">{(item as any).lingkup_nasional}</td>
                        <td className="px-4 py-3">{(item as any).lingkup_wirausaha}</td>
                      </>
                    )}
                    {activeSubTab === 'kepuasan-pengguna' && (
                      <>
                        <td className="px-4 py-3">{(item as any).no}</td>
                        <td className="px-4 py-3">{(item as any).jenis_kemampuan}</td>
                        <td className="px-4 py-3 text-center">{(item as any).sangat_baik}</td>
                        <td className="px-4 py-3 text-center">{(item as any).baik}</td>
                        <td className="px-4 py-3">{(item as any).cukup}</td>
                        <td className="px-4 py-3">{(item as any).kurang}</td>
                        <td className="px-4 py-3">{(item as any).rencana_tindak_lanjut}</td>
                      </>
                    )}
                    {activeSubTab === 'fleksibilitas' && (
                      <>
                        <td className="px-4 py-3">{item.tahun}</td>
                        <td className="px-4 py-3">{item.ts2}</td>
                        <td className="px-4 py-3">{item.ts1}</td>
                        <td className="px-4 py-3">{item.ts}</td>
                        <td className="px-4 py-3">
                          {item.linkBukti ? (
                            <a href={item.linkBukti} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              Lihat
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </>
                    )}
                    {activeSubTab === 'rekognisi-apresiasi' && (
                      <>
                        <td className="px-4 py-3">{(item as any).sumber_rekognisi}</td>
                        <td className="px-4 py-3">{(item as any).jenis_pengakuan}</td>
                        <td className="px-4 py-3">{item.ts2}</td>
                        <td className="px-4 py-3">{item.ts1}</td>
                        <td className="px-4 py-3">{item.ts}</td>
                        <td className="px-4 py-3">
                          {item.linkBukti ? (
                            <a href={item.linkBukti} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              Lihat
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
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
        )}
      </div>
    );
  };

  // --- Render utama ---
  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-2 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Header LKPS */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 flex justify-between items-start">
            <div className="flex items-center gap-2 sm:gap-3">
              <FileText className="text-blue-900 w-6 h-6 sm:w-8 sm:h-8" />
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Laporan Kinerja Program Studi (LKPS)</h1>
                <p className="text-xs sm:text-sm text-gray-600">Kelola data kuantitatif berdasarkan kriteria akreditasi</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href; 
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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

          {/* Info P4M */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Mode Review P4M:</strong> Anda dapat melihat dan mengevaluasi data yang diinput oleh Tim Akreditasi
            </p>
          </div>

          {/* Konten */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Data {activeSubTab.replace('-', ' ')}</h2>
                <p className="text-xs sm:text-sm text-gray-600">{tableTitles[activeSubTab]}</p>
              </div>
              <select
                value={selectedProdi}
                onChange={(e) => setSelectedProdi(e.target.value)}
                className="border p-2 rounded-lg text-sm"
              >
                <option value="">Semua Prodi</option>
                {prodiList.map((prodi) => (
                  <option key={prodi} value={prodi}>
                    {prodi}
                  </option>
                ))}
              </select>
            </div>

            {/* Subtab */}
            <div className="flex gap-1 sm:gap-2 border-b pb-2 mb-3 sm:mb-4 overflow-x-auto">
              {[
                'mahasiswa',
                'keragaman-asal',
                'kondisi-jumlah-mahasiswa',
                'tabel-pembelajaran',
                'pemetaan-CPL-PL',
                'peta-pemenuhan-CPL',
                'rata-rata-masa-tunggu-lulusan',
                'kesesuaian-bidang',
                'kepuasan-pengguna',
                'fleksibilitas',
                'rekognisi-apresiasi',
              ].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubTab(sub as SubTab)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-t-lg font-semibold transition-all duration-200 whitespace-nowrap
                    ${
                      activeSubTab === sub
                        ? 'bg-[#183A64] text-[#ADE7F7]'
                        : 'bg-[#ADE7F7] text-[#183A64] hover:bg-[#90d8ee] hover:text-[#102b4d]'
                    }`}
                >
                  {sub
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Tabel */}
            {renderTable()}

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
                                {String((selectedItem as any)[k] ?? '-')}
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
          </div>
        </main>
      </div>
    </div>
  );
}