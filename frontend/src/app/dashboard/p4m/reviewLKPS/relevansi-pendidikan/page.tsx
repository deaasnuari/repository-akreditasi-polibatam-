'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { FileText, Download, Save, Edit, Trash2, Eye, X } from 'lucide-react';
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

  const handleViewDetail = async (item: DataItem) => { 
    setSelectedItem(item);
    setReviewNote('');
    setNotes([]);
    setShowDetail(true);
    try {
      setLoadingNotes(true);
      const existing = await fetchReviews('relevansi-pendidikan', item.id);
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
      await postReview('relevansi-pendidikan', selectedItem.id, reviewNote || '');
      const existing = await fetchReviews('relevansi-pendidikan', selectedItem.id);
      setNotes(existing || []);
      setReviewNote('');
    } catch (err) {
      console.error('Save note error', err);
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
                          <button onClick={() => handleViewDetail(item)} className="text-blue-700 hover:text-blue-900 p-1" title="Lihat Detail">
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
                        <button onClick={() => handleViewDetail(item)} className="text-blue-700 hover:text-blue-900 inline-flex items-center gap-1">
                          <Eye size={16} />
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Save size={16} /> Save Draft
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

            {/* Modal Detail (View + optional note) */}
            {showDetail && selectedItem && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Detail Data</h2>
                    <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {Object.keys(selectedItem).filter(k => k !== 'id').map(k => (
                      <div key={k} className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </label>
                        <p className="text-gray-900 whitespace-pre-wrap">{String((selectedItem as any)[k] ?? '-')}</p>
                      </div>
                    ))}

                    <div className="space-y-3 mt-6 pt-6 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Review Sebelumnya</label>
                        {loadingNotes ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : notes.length === 0 ? (
                          <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                            Belum ada catatan review untuk item ini
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-auto">
                            {notes.map((n) => (
                              <div key={n.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-medium text-blue-700">
                                    {n.user?.nama_lengkap || n.user?.username || 'Reviewer'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(n.created_at).toLocaleString('id-ID', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.note}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tambahkan Catatan Review
                        </label>
                        <textarea 
                          value={reviewNote} 
                          onChange={(e)=>setReviewNote(e.target.value)} 
                          placeholder="Tambahkan catatan atau komentar review di sini..." 
                          rows={4} 
                          className="border p-3 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2 sticky bottom-0 bg-white pt-4 border-t">
                    <button 
                      onClick={() => setShowDetail(false)} 
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Tutup
                    </button>
                    <button 
                      onClick={handleSaveReview} 
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                    >
                      Simpan Catatan
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