'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { FileText, Download, Save, Edit, Trash2, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { relevansiPendidikanService, SubTab, DataItem } from '@/services/relevansiPendidikanService';
import { getReviews as fetchReviews, createReview as postReview } from '@/services/reviewService';

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
      const result = await relevansiPendidikanService.fetchData(activeSubTab);
      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  // --- Form & CRUD ---
  // openAdd (tambah data) dihilangkan — UI tombol tambah sudah dihapus

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

  // Import handler dihilangkan (UI Import dihapus)



  // --- Render Table ---
  const renderTable = () => {
    const emptyColSpan = 6;
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-700 uppercase">
              {activeSubTab === 'mahasiswa' && (
                <>
                  <th className="px-4 py-3 text-left">Tahun (TS)</th>
                  <th className="px-4 py-3 text-center">Daya Tampung</th>
                  <th className="px-4 py-3 text-center">Pendaftar</th>
                  <th className="px-4 py-3 text-center">Diterima</th>
                  <th className="px-4 py-3 text-center">Aktif</th>
                </>
              )}
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
                    <th className="px-4 py-3 text-center">Jenin Kemampuan</th>
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
                  {activeSubTab === 'mahasiswa' && (
                    <>
                      <td className="px-4 py-3">{item.tahun}</td>
                      <td className="px-4 py-3 text-center">{item.daya_tampung}</td>
                      <td className="px-4 py-3 text-center">{item.pendaftar}</td>
                      <td className="px-4 py-3 text-center">{item.diterima}</td>
                      <td className="px-4 py-3 text-center">{item.aktif}</td>
                    </>
                  )}
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
      </div>
    );
  };

  // --- Render utama ---
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Save size={16} /> Save Draft
              </button>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2">
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

          {/* Konten */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Subtab */}
            <div className="flex gap-2 border-b pb-2 mb-4">
              {['mahasiswa', 'keragaman-asal', 'kondisi-jumlah-mahasiswa', 'tabel-pembelajaran', 'pemetaan-CPL-PL', 'peta-pemenuhan-CPL', 'rata-rata-masa-tunggu-lulusan', 'kesesuaian-bidang', 'kepuasan-pengguna', 'fleksibilitas', 'rekognisi-apresiasi'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubTab(sub as SubTab)}
                  className={`px-4 py-2 text-sm rounded-t-lg ${
                    activeSubTab === sub
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sub.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Judul Subtab & Tabel */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Data {activeSubTab.replace('-', ' ')}</h2>
              <p className="text-sm text-gray-600">{tableTitles[activeSubTab]}</p>
            </div>

            {/* Tombol Tambah / Import dihilangkan sesuai permintaan */}

            {/* Tabel */}
            {renderTable()}

            {/* Form Input */}
                {showForm && (
                 <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
           
                     {/* Header Form */}
                      <div className="flex justify-between items-center mb-6">
                       <h2 className="text-lg font-semibold text-gray-800">
                        {editIndex !== null ? 'Edit Data' : 'Tambah Data Baru'}
                      </h2>
                       <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                         <X size={24} />
                        </button>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSubTab === 'keragaman-asal' && (
                      <>
                        <input name="asalMahasiswa" value={formData.asalMahasiswa || ''} onChange={handleChange} placeholder="Asal Mahasiswa" className="border p-3 rounded-lg w-full" />
                        <input name="ts2" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                        <input name="ts1" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                        <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                        <input name="linkBukti" value={formData.linkBukti || ''} onChange={handleChange} placeholder="Link Bukti" className="border p-3 rounded-lg w-full" />
                      </>
                    )}

                    {activeSubTab === 'kondisi-jumlah-mahasiswa' && (
                      <>
                        <input name="alasan" value={formData.alasan || ''} onChange={handleChange} placeholder="Alasan" className="border p-3 rounded-lg w-full" />
                        <input name="ts2" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                        <input name="ts1" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                        <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                        <input name="jumlah" value={formData.jumlah || ''} onChange={handleChange} placeholder="Jumlah" className="border p-3 rounded-lg w-full" />
                      </>
                    )}

                    {activeSubTab === 'mahasiswa' && (
                      <>
                        <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun" className="border p-3 rounded-lg w-full" />
                        <input name="daya_tampung" value={formData.daya_tampung || ''} onChange={handleChange} placeholder="Daya Tampung" className="border p-3 rounded-lg w-full" />
                        <input name="pendaftar" value={formData.pendaftar || ''} onChange={handleChange} placeholder="Pendaftar" className="border p-3 rounded-lg w-full" />
                        <input name="diterima" value={formData.diterima || ''} onChange={handleChange} placeholder="Diterima" className="border p-3 rounded-lg w-full" />
                        <input name="aktif" value={formData.aktif || ''} onChange={handleChange} placeholder="Aktif" className="border p-3 rounded-lg w-full" />
                      </>
                    )}
                    {activeSubTab === 'tabel-pembelajaran' && (
                      <>
                        <input name="mata_kuliah" value={formData.mata_kuliah || ''} onChange={handleChange} placeholder="Mata Kuliah" className="border p-3 rounded-lg w-full" />
                        <input name="sks" value={formData.sks || ''} onChange={handleChange} placeholder="SKS" className="border p-3 rounded-lg w-full" />
                        <input name="semester" value={formData.semester || ''} onChange={handleChange} placeholder="Semester" className="border p-3 rounded-lg w-full" />
                        <input name="profil_lulusan" value={formData.profil_lulusan || ''} onChange={handleChange} placeholder="Profil Lulusan" className="border p-3 rounded-lg w-full" />
                      </>
                    )}
                    {activeSubTab === 'pemetaan-CPL-PL' && (
                        <>
                          <input
                            name="profil_lulusan"
                            value={formData.profil_lulusan || ''}
                            onChange={handleChange}
                            placeholder="No"
                            className="border p-3 rounded-lg w-full"
                          />
                          <input
                            name="pl1"
                            value={(formData as any).pl1 || ''}
                            onChange={handleChange}
                            placeholder="PL1"
                            className="border p-3 rounded-lg w-full"
                          />
                          <input
                            name="pl2"
                            value={(formData as any).pl2 || ''}
                            onChange={handleChange}
                            placeholder="PL2"
                            className="border p-3 rounded-lg w-full"
                          />
                        </>
                      )}

                      {activeSubTab === 'peta-pemenuhan-CPL' && (
                        <>
                          <input name="cpl" value={(formData as any).cpl || ''} onChange={handleChange} placeholder="CPL" className="border p-3 rounded-lg w-full" />
                          <input name="cpmk" value={(formData as any).cpmk || ''} onChange={handleChange} placeholder="CPMK" className="border p-3 rounded-lg w-full" />
                          {Array.from({ length: 8 }, (_, i) => (
                            <input
                              key={i}
                              name={`semester${i + 1}`}
                              value={(formData as any)[`semester${i + 1}`] || ''}
                              onChange={handleChange}
                              placeholder={`Semester ${i + 1}`}
                              className="border p-3 rounded-lg w-full"
                            />
                          ))}
                        </>
                      )}

                      {activeSubTab === 'rata-rata-masa-tunggu-lulusan' && (
                        <>
                          <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun Lulus" className="border p-3 rounded-lg w-full" />
                          <input name="jumlah_lulusan" value={formData.jumlah_lulusan || ''} onChange={handleChange} placeholder="Jumlah Lulusan" className="border p-3 rounded-lg w-full" />
                          <input name="aktif" value={formData.aktif || ''} onChange={handleChange} placeholder="Jumlah Lulusan Yang Terlacak" className="border p-3 rounded-lg w-full" />
                          <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="Rata-rata Waktu Tunggu (Bulan)" className="border p-3 rounded-lg w-full" />
                        </>
                      )}

                      {activeSubTab === 'kesesuaian-bidang' && (
                        <>
                          <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun Lulus" className="border p-3 rounded-lg w-full" />
                          <input name="jumlah_lulusan" value={formData.jumlah_lulusan || ''} onChange={handleChange} placeholder="Jumlah Lulusan" className="border p-3 rounded-lg w-full" />
                          <input name="aktif" value={formData.aktif || ''} onChange={handleChange} placeholder="Jumlah Lulusan Yang Terlacak" className="border p-3 rounded-lg w-full" />
                          <input name="profesi_infokom" value={(formData as any).profesi_infokom || ''} onChange={handleChange} placeholder="Profesi Kerja Bidang Infokom" className="border p-3 rounded-lg w-full" />
                          <input name="profesi_noninfokom" value={(formData as any).profesi_noninfokom || ''} onChange={handleChange} placeholder="Profesi Kerja Bidang NonInfokom" className="border p-3 rounded-lg w-full" />
                          <input name="lingkup_internasional" value={(formData as any).lingkup_internasional || ''} onChange={handleChange} placeholder="Lingkup Kerja Internasional" className="border p-3 rounded-lg w-full" />
                          <input name="lingkup_nasional" value={(formData as any).lingkup_nasional || ''} onChange={handleChange} placeholder="Lingkup Kerja Nasional" className="border p-3 rounded-lg w-full" />
                          <input name="lingkup_wirausaha" value={(formData as any).lingkup_wirausaha || ''} onChange={handleChange} placeholder="Lingkup Kerja Wirausaha" className="border p-3 rounded-lg w-full" />
                        </>
                      )}

                      {activeSubTab === 'kepuasan-pengguna' && (
                        <>
                          <input name="no" value={(formData as any).no || ''} onChange={handleChange} placeholder="No" className="border p-3 rounded-lg w-full" />
                          <input name="jenis_kemampuan" value={(formData as any).jenis_kemampuan || ''} onChange={handleChange} placeholder="Jenis Kemampuan" className="border p-3 rounded-lg w-full" />
                          <input name="sangat_baik" value={(formData as any).sangat_baik || ''} onChange={handleChange} placeholder="Sangat Baik" className="border p-3 rounded-lg w-full" />
                          <input name="baik" value={(formData as any).baik || ''} onChange={handleChange} placeholder="Baik" className="border p-3 rounded-lg w-full" />
                          <input name="cukup" value={(formData as any).cukup || ''} onChange={handleChange} placeholder="Cukup" className="border p-3 rounded-lg w-full" />
                          <input name="kurang" value={(formData as any).kurang || ''} onChange={handleChange} placeholder="Kurang" className="border p-3 rounded-lg w-full" />
                          <input name="rencana_tindak_lanjut" value={(formData as any).rencana_tindak_lanjut || ''} onChange={handleChange} placeholder="Rencana Tindak Lanjut UPPS/PS" className="border p-3 rounded-lg w-full" />
                        </>
                      )}

                      {activeSubTab === 'fleksibilitas' && (
                        <>
                          <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun Akademik" className="border p-3 rounded-lg w-full" />
                          <input name="ts2" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                          <input name="ts1" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                          <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                          <input name="linkBukti" value={formData.linkBukti || ''} onChange={handleChange} placeholder="Link Bukti" className="border p-3 rounded-lg w-full" />
                        </>
                      )}

                      {activeSubTab === 'rekognisi-apresiasi' && (
                        <>
                          <input name="sumber_rekognisi" value={(formData as any).sumber_rekognisi || ''} onChange={handleChange} placeholder="Sumber Rekognisi" className="border p-3 rounded-lg w-full" />
                          <input name="jenis_pengakuan" value={(formData as any).jenis_pengakuan || ''} onChange={handleChange} placeholder="Jenis Pengakuan Lulusan (Rekognisi)" className="border p-3 rounded-lg w-full" />
                          <input name="ts2" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                          <input name="ts1" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                          <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                          <input name="linkBukti" value={formData.linkBukti || ''} onChange={handleChange} placeholder="Link Bukti" className="border p-3 rounded-lg w-full" />
                        </>
                      )}





                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                  {editIndex !== null && (
                    <button
                      onClick={async () => {
                        if (!formData.id) return;
                        if (!confirm('Yakin hapus data ini?')) return;
                        await handleDelete(formData.id);
                        setShowForm(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  )}

                  <button onClick={handleSave} className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800">
                    Simpan
                  </button>
                </div>

                </div>
              </div>
            )}

            {/* Modal Detail (View + optional note) */}
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
                            <p className="text-gray-900 whitespace-pre-wrap">{String((selectedItem as any)[k] ?? '-')}</p>
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
          </div>
        </main>
      </div>
    </div>
  );
}
