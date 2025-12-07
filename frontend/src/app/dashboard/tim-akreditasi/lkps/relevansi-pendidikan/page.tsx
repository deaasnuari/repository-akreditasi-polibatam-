'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { relevansiPendidikanService, SubTab, DataItem, API_BASE } from '@/services/relevansiPendidikanService';
import * as XLSX from 'xlsx';

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
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('mahasiswa');
  const [data, setData] = useState<DataItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [popup, setPopup] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [incompleteModal, setIncompleteModal] = useState<{ open: boolean; missing: string[] }>({ open: false, missing: [] });

  // --- Fungsi Popup ---
  const showPopup = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: 'success' }), 3000);
  };

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
          <button onClick={() => setPopup({ show: false, message: '', type: 'success' })} className="hover:opacity-70 transition-opacity">
            <X size={20} />
          </button>
        </div>
      </div>
    );
  };

  const handleSaveDraft = async () => {
    showPopup('Menyimpan draft...', 'info');
    try {
      await fetch(`${API_BASE}/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: `LKPS - Relevansi Pendidikan`,
          path: pathname,
          status: 'Draft',
          type: activeSubTab,
          currentData: data,
        }),
        credentials: 'include',
      });

      showPopup('Draft berhasil disimpan. Mengalihkan...', 'success');

      setTimeout(() => {
        router.push('/dashboard/tim-akreditasi/bukti-pendukung');
      }, 1500);

    } catch (error: any) {
      console.error('Gagal menyimpan draft:', error);
      showPopup(error.message || 'Gagal menyimpan draft. Lihat konsol untuk detail.', 'error');
    }
  };

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
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
  const openAdd = () => {
    setFormData({});
    setEditIndex(null);
    setShowForm(true);
  };

  const requiredFieldsBySubtab: Record<SubTab, string[]> = {
    mahasiswa: ['tahun', 'daya_tampung'],
    'keragaman-asal': ['asalMahasiswa', 'ts2', 'ts1', 'ts'],
    'kondisi-jumlah-mahasiswa': ['alasan', 'ts2', 'ts1', 'ts', 'jumlah'],
    'tabel-pembelajaran': ['mata_kuliah', 'sks', 'semester', 'profil_lulusan'],
    'pemetaan-CPL-PL': ['pl1', 'pl2'],
    'peta-pemenuhan-CPL': ['cpl', 'cpmk', 'semester1', 'semester2', 'semester3', 'semester4', 'semester5', 'semester6', 'semester7', 'semester8'],
    'rata-rata-masa-tunggu-lulusan': ['tahun', 'jumlah_lulusan', 'aktif', 'ts'],
    'kesesuaian-bidang': ['tahun', 'jumlah_lulusan', 'aktif', 'profesi_infokom', 'profesi_noninfokom', 'lingkup_internasional', 'lingkup_nasional', 'lingkup_wirausaha'],
    'kepuasan-pengguna': ['no', 'jenis_kemampuan', 'sangat_baik', 'baik', 'cukup', 'kurang', 'rencana_tindak_lanjut'],
    fleksibilitas: ['tahun', 'ts2', 'ts1', 'ts'],
    'rekognisi-apresiasi': ['sumber_rekognisi', 'jenis_pengakuan', 'ts2', 'ts1', 'ts'],
  };

  const validateRequired = (subtab: SubTab, payload: Record<string, any>): string[] => {
    const req = requiredFieldsBySubtab[subtab] || [];
    return req.filter((key) => payload[key] === undefined || payload[key] === null || String(payload[key]).trim() === '');
  };

  const performSave = async () => {
    setErrorMsg(null);
    const result = formData.id
      ? await relevansiPendidikanService.updateData(formData.id, formData, activeSubTab)
      : await relevansiPendidikanService.createData(formData, activeSubTab);

    if (result.success) {
      setShowForm(false);
      setFormData({});
      setEditIndex(null);
      fetchData();
      showPopup('Data berhasil disimpan', 'success');
    } else {
      setErrorMsg(result.message || 'Gagal menyimpan data');
      showPopup(result.message || 'Gagal menyimpan data', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const missing = validateRequired(activeSubTab, formData || {});
      if (missing.length > 0) {
        setIncompleteModal({ open: true, missing });
        return;
      }

      await performSave();
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMsg(err.message || String(err));
      showPopup(err.message || 'Gagal menyimpan data', 'error');
    }
  };

  const handleEdit = (item: DataItem) => {
    setFormData(item);
    const idx = data.findIndex((d) => d.id === item.id);
    setEditIndex(idx !== -1 ? idx : null);
    setShowForm(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      const result = await relevansiPendidikanService.deleteData(id);
      if (result.success) {
        setData(prev => prev.filter(d => d.id !== id));
        showPopup('Data berhasil dihapus', 'success');
      } else {
        showPopup('Gagal menghapus data', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showPopup('Terjadi kesalahan saat menghapus', 'error');
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

  // --- Import Excel ---
  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length < 2) {
          showPopup('File Excel harus memiliki minimal 2 baris (header dan data)', 'error');
          setImporting(false);
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];

        setPreviewHeaders(headers);
        setPreviewRows(rows.slice(0, 5));
        setPreviewFile(file);
        setShowPreviewModal(true);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error reading file:', err);
      showPopup('Gagal membaca file Excel', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewFile || !mapping) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const reverseMapping: Record<string, string> = {};
        Object.entries(mapping).forEach(([header, field]) => {
          if (field) reverseMapping[field] = header;
        });

        const mappedData = jsonData.map((row: any) => {
          const fieldMap = getFieldMappingForSubTab(activeSubTab);
          return fieldMap;
        });

        const formDataImport = new FormData();
        formDataImport.append('file', previewFile);
        formDataImport.append('subtab', activeSubTab);
        formDataImport.append('mappedData', JSON.stringify(mappedData));

        const res = await fetch(`${API_BASE}/import`, {
          method: 'POST',
          body: formDataImport,
          credentials: 'include',
        });

        const json = await res.json();
        if (res.ok) {
          fetchData();
          setShowPreviewModal(false);
          setPreviewFile(null);
          setPreviewHeaders([]);
          setPreviewRows([]);
          setMapping({});
          showPopup('Data berhasil diimport', 'success');
        } else {
          showPopup(json.message || 'Gagal import data', 'error');
        }
      };
      reader.readAsArrayBuffer(previewFile);
    } catch (err) {
      console.error('Import error:', err);
      showPopup('Gagal import data', 'error');
    } finally {
      setImporting(false);
    }
  };

  const getFieldMappingForSubTab = (subTab: SubTab): Record<string, string> => {
    switch (subTab) {
      case 'mahasiswa':
        return {
          tahun: 'Tahun (TS)',
          daya_tampung: 'Daya Tampung',
          calon_pendaftar: 'Pendaftar',
          calon_pendaftar_afirmasi: 'Pendaftar Afirmasi',
          calon_pendaftar_kebutuhan_khusus: 'Pendaftar Kebutuhan Khusus',
          baru_reguler_diterima: 'Baru Reguler Diterima',
          baru_reguler_afirmasi: 'Baru Reguler Afirmasi',
          baru_reguler_kebutuhan_khusus: 'Baru Reguler Kebutuhan Khusus',
          baru_rpl_diterima: 'Baru RPL Diterima',
          baru_rpl_afirmasi: 'Baru RPL Afirmasi',
          baru_rpl_kebutuhan_khusus: 'Baru RPL Kebutuhan Khusus',
          aktif_reguler_diterima: 'Aktif Reguler Diterima',
          aktif_reguler_afirmasi: 'Aktif Reguler Afirmasi',
          aktif_reguler_kebutuhan_khusus: 'Aktif Reguler Kebutuhan Khusus',
          aktif_rpl_diterima: 'Aktif RPL Diterima',
          aktif_rpl_afirmasi: 'Aktif RPL Afirmasi',
          aktif_rpl_kebutuhan_khusus: 'Aktif RPL Kebutuhan Khusus'
        };
      case 'keragaman-asal':
        return {
          asalMahasiswa: 'Asal Mahasiswa',
          ts2: 'TS-2',
          ts1: 'TS-1',
          ts: 'TS',
          linkBukti: 'Link Bukti'
        };
      case 'kondisi-jumlah-mahasiswa':
        return {
          alasan: 'Alasan',
          ts2: 'TS-2',
          ts1: 'TS-1',
          ts: 'TS',
          jumlah: 'Jumlah'
        };
      case 'tabel-pembelajaran':
        return {
          mata_kuliah: 'Mata Kuliah',
          sks: 'SKS',
          semester: 'Semester',
          profil_lulusan: 'Profil Lulusan'
        };
      case 'pemetaan-CPL-PL':
        return {
          pl1: 'PL1',
          pl2: 'PL2'
        };
      case 'peta-pemenuhan-CPL':
        return {
          cpl: 'CPL',
          cpmk: 'CPMK',
          semester1: 'Semester 1',
          semester2: 'Semester 2',
          semester3: 'Semester 3',
          semester4: 'Semester 4',
          semester5: 'Semester 5',
          semester6: 'Semester 6',
          semester7: 'Semester 7',
          semester8: 'Semester 8'
        };
      case 'rata-rata-masa-tunggu-lulusan':
        return {
          tahun: 'Tahun Lulus',
          jumlah_lulusan: 'Jumlah Lulusan',
          aktif: 'Jumlah Lulusan Yang Terlacak',
          ts: 'Rata-rata Waktu Tunggu (Bulan)'
        };
      case 'kesesuaian-bidang':
        return {
          tahun: 'Tahun Lulus',
          jumlah_lulusan: 'Jumlah Lulusan',
          aktif: 'Jumlah Lulusan Yang Terlacak',
          profesi_infokom: 'Profesi Kerja Bidang Infokom',
          profesi_noninfokom: 'Profesi Kerja Bidang NonInfokom',
          lingkup_internasional: 'Lingkup Kerja Internasional',
          lingkup_nasional: 'Lingkup Kerja Nasional',
          lingkup_wirausaha: 'Lingkup Kerja Wirausaha'
        };
      case 'kepuasan-pengguna':
        return {
          no: 'No',
          jenis_kemampuan: 'Jenis Kemampuan',
          sangat_baik: 'Sangat Baik',
          baik: 'Baik',
          cukup: 'Cukup',
          kurang: 'Kurang',
          rencana_tindak_lanjut: 'Rencana Tindak Lanjut UPPS/PS'
        };
      case 'fleksibilitas':
        return {
          tahun: 'Tahun Akademik',
          ts2: 'TS-2',
          ts1: 'TS-1',
          ts: 'TS',
          linkBukti: 'Link Bukti'
        };
      case 'rekognisi-apresiasi':
        return {
          sumber_rekognisi: 'Sumber Rekognisi',
          jenis_pengakuan: 'Jenis Pengakuan Lulusan (Rekognisi)',
          ts2: 'TS-2',
          ts1: 'TS-1',
          ts: 'TS',
          linkBukti: 'Link Bukti'
        };
      default:
        return {};
    }
  };

  // --- Render Table ---
  const renderTable = () => {
    const emptyColSpan = 6;
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        {activeSubTab === 'mahasiswa' ? (
          // TABEL MAHASISWA - STRUKTUR AWAL (MULTI-HEADER) TANPA WARNA
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

                      {/* Aksi */}
                      <td className="border border-gray-300 px-2 py-2 text-center sticky right-0 bg-white">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(item)} className="text-blue-700 hover:text-blue-900 p-1">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => setConfirmDelete({ open: true, id: item.id ?? null })} className="text-red-600 hover:text-red-800 p-1">
                            <Trash2 size={16} />
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
          // TABEL LAINNYA - STRUKTUR LAMA
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
                    <th className="px-4 py-3 text-left">Profil Lulusan</th>
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
                    <th className="px-4 py-3 text-center">Jumlah Lulusan Yang Terlacak</th>
                    <th className="px-4 py-3 text-left">Rata-Rata Waktu Tunggu(Bulan)</th>
                  </>
                )}
                {activeSubTab === 'kesesuaian-bidang' && (
                  <>
                    <th className="px-4 py-3 text-left">Tahun Lulus</th>
                    <th className="px-4 py-3 text-center">Jumlah Lulusan</th>
                    <th className="px-4 py-3 text-center">Jumlah Lulusan Yang Terlacak</th>
                    <th className="px-4 py-3 text-center">Profesi Kerja Bidang Infokom</th>
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
                        <button onClick={() => handleEdit(item)} className="text-blue-700 hover:text-blue-900">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => setConfirmDelete({ open: true, id: item.id ?? null })} className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
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
      <PopupNotification />
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
            <div className="flex gap-2 items-center">
              <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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

          {/* Konten */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
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

            {/* Judul Subtab & Tabel */}
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Data {activeSubTab.replace('-', ' ')}</h2>
              <p className="text-xs sm:text-sm text-gray-600">{tableTitles[activeSubTab]}</p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                <button
                  onClick={openAdd}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  <Plus size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Tambah</span> Tambah Data
                </button>
                <form onSubmit={(e) => e.preventDefault()} className="relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    id="importExcel"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImport}
                  />
                  <label
                    htmlFor="importExcel"
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <Upload size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Import</span> Import Excel
                  </label>
                </form>
              </div>
            </div>

            {/* Tabel */}
            {renderTable()}

            {/* Form Input */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  {/* Header Form */}
                  <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {editIndex !== null ? 'Edit Data' : 'Tambah Data Baru'}
                    </h2>
                    <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSubTab === 'mahasiswa' && (
                      <>
                        <div className="col-span-2">
                          <h4 className="font-semibold text-gray-700 mb-3">Informasi Dasar</h4>
                        </div>
                        <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun (TS)" className="border p-3 rounded-lg w-full" />
                        <input name="daya_tampung" type="number" value={formData.daya_tampung || ''} onChange={handleChange} placeholder="Daya Tampung" className="border p-3 rounded-lg w-full" />
                        
                        <div className="col-span-2 mt-4">
                          <h4 className="font-semibold text-gray-700 mb-3">Jumlah Calon Mahasiswa</h4>
                        </div>
                        <input name="calon_pendaftar" type="number" value={(formData as any).calon_pendaftar || ''} onChange={handleChange} placeholder="Pendaftar" className="border p-3 rounded-lg w-full" />
                        <input name="calon_pendaftar_afirmasi" type="number" value={(formData as any).calon_pendaftar_afirmasi || ''} onChange={handleChange} placeholder="Pendaftar Afirmasi" className="border p-3 rounded-lg w-full" />
                        <input name="calon_pendaftar_kebutuhan_khusus" type="number" value={(formData as any).calon_pendaftar_kebutuhan_khusus || ''} onChange={handleChange} placeholder="Pendaftar Kebutuhan Khusus" className="border p-3 rounded-lg w-full" />
                        
                        <div className="col-span-2 mt-4">
                          <h4 className="font-semibold text-gray-700 mb-3">Mahasiswa Baru - Reguler</h4>
                        </div>
                        <input name="baru_reguler_diterima" type="number" value={(formData as any).baru_reguler_diterima || ''} onChange={handleChange} placeholder="Diterima" className="border p-3 rounded-lg w-full" />
                        <input name="baru_reguler_afirmasi" type="number" value={(formData as any).baru_reguler_afirmasi || ''} onChange={handleChange} placeholder="Afirmasi" className="border p-3 rounded-lg w-full" />
                        <input name="baru_reguler_kebutuhan_khusus" type="number" value={(formData as any).baru_reguler_kebutuhan_khusus || ''} onChange={handleChange} placeholder="Kebutuhan Khusus" className="border p-3 rounded-lg w-full" />
                        
                        <div className="col-span-2 mt-4">
                          <h4 className="font-semibold text-gray-700 mb-3">Mahasiswa Baru - RPL</h4>
                        </div>
                        <input name="baru_rpl_diterima" type="number" value={(formData as any).baru_rpl_diterima || ''} onChange={handleChange} placeholder="Diterima" className="border p-3 rounded-lg w-full" />
                        <input name="baru_rpl_afirmasi" type="number" value={(formData as any).baru_rpl_afirmasi || ''} onChange={handleChange} placeholder="Afirmasi" className="border p-3 rounded-lg w-full" />
                        <input name="baru_rpl_kebutuhan_khusus" type="number" value={(formData as any).baru_rpl_kebutuhan_khusus || ''} onChange={handleChange} placeholder="Kebutuhan Khusus" className="border p-3 rounded-lg w-full" />
                        
                        <div className="col-span-2 mt-4">
                          <h4 className="font-semibold text-gray-700 mb-3">Mahasiswa Aktif - Reguler</h4>
                        </div>
                        <input name="aktif_reguler_diterima" type="number" value={(formData as any).aktif_reguler_diterima || ''} onChange={handleChange} placeholder="Diterima" className="border p-3 rounded-lg w-full" />
                        <input name="aktif_reguler_afirmasi" type="number" value={(formData as any).aktif_reguler_afirmasi || ''} onChange={handleChange} placeholder="Afirmasi" className="border p-3 rounded-lg w-full" />
                        <input name="aktif_reguler_kebutuhan_khusus" type="number" value={(formData as any).aktif_reguler_kebutuhan_khusus || ''} onChange={handleChange} placeholder="Kebutuhan Khusus" className="border p-3 rounded-lg w-full" />
                        
                        <div className="col-span-2 mt-4">
                          <h4 className="font-semibold text-gray-700 mb-3">Mahasiswa Aktif - RPL</h4>
                        </div>
                        <input name="aktif_rpl_diterima" type="number" value={(formData as any).aktif_rpl_diterima || ''} onChange={handleChange} placeholder="Diterima" className="border p-3 rounded-lg w-full" />
                        <input name="aktif_rpl_afirmasi" type="number" value={(formData as any).aktif_rpl_afirmasi || ''} onChange={handleChange} placeholder="Afirmasi" className="border p-3 rounded-lg w-full" />
                        <input name="aktif_rpl_kebutuhan_khusus" type="number" value={(formData as any).aktif_rpl_kebutuhan_khusus || ''} onChange={handleChange} placeholder="Kebutuhan Khusus" className="border p-3 rounded-lg w-full" />
                      </>
                    )}

                    {activeSubTab === 'keragaman-asal' && (
                      <>
                        <input name="asalMahasiswa" value={formData.asalMahasiswa || ''} onChange={handleChange} placeholder="Asal Mahasiswa" className="border p-3 rounded-lg w-full" />
                        <input name="ts2" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                        <input name="ts1" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                        <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                        <input name="linkBukti" value={formData.linkBukti || ''} onChange={handleChange} placeholder="Link Bukti" className="border p-3 rounded-lg w-full col-span-2" />
                      </>
                    )}

                    {activeSubTab === 'kondisi-jumlah-mahasiswa' && (
                      <>
                        <input name="alasan" value={formData.alasan || ''} onChange={handleChange} placeholder="Alasan" className="border p-3 rounded-lg w-full col-span-2" />
                        <input name="ts2" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                        <input name="ts1" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                        <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                        <input name="jumlah" type="number" value={formData.jumlah || ''} onChange={handleChange} placeholder="Jumlah" className="border p-3 rounded-lg w-full" />
                      </>
                    )}

                    {activeSubTab === 'tabel-pembelajaran' && (
                      <>
                        <input name="mata_kuliah" value={formData.mata_kuliah || ''} onChange={handleChange} placeholder="Mata Kuliah" className="border p-3 rounded-lg w-full" />
                        <input name="sks" type="number" value={formData.sks || ''} onChange={handleChange} placeholder="SKS" className="border p-3 rounded-lg w-full" />
                        <input name="semester" type="number" value={formData.semester || ''} onChange={handleChange} placeholder="Semester" className="border p-3 rounded-lg w-full" />
                        <input name="profil_lulusan" value={formData.profil_lulusan || ''} onChange={handleChange} placeholder="Profil Lulusan" className="border p-3 rounded-lg w-full" />
                      </>
                    )}

                    {activeSubTab === 'pemetaan-CPL-PL' && (
                      <>
                        <input name="pl1" value={(formData as any).pl1 || ''} onChange={handleChange} placeholder="PL1" className="border p-3 rounded-lg w-full" />
                        <input name="pl2" value={(formData as any).pl2 || ''} onChange={handleChange} placeholder="PL2" className="border p-3 rounded-lg w-full" />
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
                        <input name="jumlah_lulusan" type="number" value={formData.jumlah_lulusan || ''} onChange={handleChange} placeholder="Jumlah Lulusan" className="border p-3 rounded-lg w-full" />
                        <input name="aktif" type="number" value={formData.aktif || ''} onChange={handleChange} placeholder="Jumlah Lulusan Yang Terlacak" className="border p-3 rounded-lg w-full" />
                        <input name="ts" type="number" value={formData.ts || ''} onChange={handleChange} placeholder="Rata-rata Waktu Tunggu (Bulan)" className="border p-3 rounded-lg w-full" />
                      </>
                    )}

                    {activeSubTab === 'kesesuaian-bidang' && (
                      <>
                        <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun Lulus" className="border p-3 rounded-lg w-full" />
                        <input name="jumlah_lulusan" type="number" value={formData.jumlah_lulusan || ''} onChange={handleChange} placeholder="Jumlah Lulusan" className="border p-3 rounded-lg w-full" />
                        <input name="aktif" type="number" value={formData.aktif || ''} onChange={handleChange} placeholder="Jumlah Lulusan Yang Terlacak" className="border p-3 rounded-lg w-full" />
                        <input name="profesi_infokom" type="number" value={(formData as any).profesi_infokom || ''} onChange={handleChange} placeholder="Profesi Kerja Bidang Infokom" className="border p-3 rounded-lg w-full" />
                        <input name="profesi_noninfokom" type="number" value={(formData as any).profesi_noninfokom || ''} onChange={handleChange} placeholder="Profesi Kerja Bidang NonInfokom" className="border p-3 rounded-lg w-full" />
                        <input name="lingkup_internasional" type="number" value={(formData as any).lingkup_internasional || ''} onChange={handleChange} placeholder="Lingkup Kerja Internasional" className="border p-3 rounded-lg w-full" />
                        <input name="lingkup_nasional" type="number" value={(formData as any).lingkup_nasional || ''} onChange={handleChange} placeholder="Lingkup Kerja Nasional" className="border p-3 rounded-lg w-full" />
                        <input name="lingkup_wirausaha" type="number" value={(formData as any).lingkup_wirausaha || ''} onChange={handleChange} placeholder="Lingkup Kerja Wirausaha" className="border p-3 rounded-lg w-full" />
                      </>
                    )}

                    {activeSubTab === 'kepuasan-pengguna' && (
                      <>
                        <input name="no" type="number" value={(formData as any).no || ''} onChange={handleChange} placeholder="No" className="border p-3 rounded-lg w-full" />
                        <input name="jenis_kemampuan" value={(formData as any).jenis_kemampuan || ''} onChange={handleChange} placeholder="Jenis Kemampuan" className="border p-3 rounded-lg w-full" />
                        <input name="sangat_baik" type="number" value={(formData as any).sangat_baik || ''} onChange={handleChange} placeholder="Sangat Baik" className="border p-3 rounded-lg w-full" />
                        <input name="baik" type="number" value={(formData as any).baik || ''} onChange={handleChange} placeholder="Baik" className="border p-3 rounded-lg w-full" />
                        <input name="cukup" type="number" value={(formData as any).cukup || ''} onChange={handleChange} placeholder="Cukup" className="border p-3 rounded-lg w-full" />
                        <input name="kurang" type="number" value={(formData as any).kurang || ''} onChange={handleChange} placeholder="Kurang" className="border p-3 rounded-lg w-full" />
                        <input name="rencana_tindak_lanjut" value={(formData as any).rencana_tindak_lanjut || ''} onChange={handleChange} placeholder="Rencana Tindak Lanjut UPPS/PS" className="border p-3 rounded-lg w-full col-span-2" />
                      </>
                    )}

                    {activeSubTab === 'fleksibilitas' && (
                      <>
                        <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun Akademik" className="border p-3 rounded-lg w-full" />
                        <input name="ts2" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                        <input name="ts1" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                        <input name="ts" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                        <input name="linkBukti" value={formData.linkBukti || ''} onChange={handleChange} placeholder="Link Bukti" className="border p-3 rounded-lg w-full col-span-2" />
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

                  <div className="mt-6 flex justify-end gap-2 sticky bottom-0 bg-white pt-4 border-t">
                    {editIndex !== null && (
                      <button
                        onClick={async () => {
                          if (!formData.id) return;
                          setConfirmDelete({ open: true, id: formData.id });
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    )}
                    <button 
                      onClick={() => setShowForm(false)} 
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Batal
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800">
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Modal for Excel Import */}
            {showPreviewModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-auto">
                  <h3 className="text-lg font-semibold mb-4">Preview Excel Import</h3>
                  <p className="mb-4">Map the Excel columns to table fields for {activeSubTab.replace('-', ' ')}:</p>

                  <div className="mb-4">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border px-4 py-2 text-left">Excel Column</th>
                          <th className="border px-4 py-2 text-left">Table Field</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewHeaders.map((header, index) => (
                          <tr key={index}>
                            <td className="border px-4 py-2 font-medium">{header}</td>
                            <td className="border px-4 py-2">
                              <select
                                value={mapping[header] || ''}
                                onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                                className="border p-2 rounded w-full"
                              >
                                <option value="">Select Field</option>
                                {Object.keys(getFieldMappingForSubTab(activeSubTab)).map(field => (
                                  <option key={field} value={field}>
                                    {field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Preview First 5 Rows:</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-xs">
                        <thead>
                          <tr className="bg-gray-50">
                            {previewHeaders.map((header, index) => (
                              <th key={index} className="border px-2 py-1 text-left">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row, index) => (
                            <tr key={index}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border px-2 py-1">{String(cell)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowPreviewModal(false);
                        setPreviewFile(null);
                        setPreviewHeaders([]);
                        setPreviewRows([]);
                        setMapping({});
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      disabled={importing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {importing ? 'Importing...' : 'Confirm Import'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {confirmDelete.open && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
                <div className="p-4 border-b flex items-center gap-2">
                  <AlertCircle className="text-red-600" size={20} />
                  <h3 className="font-semibold text-gray-800">Konfirmasi Hapus</h3>
                </div>
                <div className="p-4 text-sm text-gray-700">
                  Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDelete({ open: false, id: null })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      const id = confirmDelete.id ?? undefined;
                      setConfirmDelete({ open: false, id: null });
                      await handleDelete(id);
                      setShowForm(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )}

          {incompleteModal.open && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-800">Data Tidak Lengkap</h3>
                </div>
                <div className="p-4 text-sm text-gray-700 space-y-2">
                  <p>Mohon lengkapi semua field yang wajib diisi sebelum menyimpan data.</p>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                  <button
                    onClick={() => setIncompleteModal({ open: false, missing: [] })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setIncompleteModal({ open: false, missing: [] })}
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                  >
                    Ya, Lanjutkan
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