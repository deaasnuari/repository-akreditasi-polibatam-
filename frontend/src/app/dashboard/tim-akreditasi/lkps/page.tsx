'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function LKPSPage() {
  type SubTab = 'tupoksi' | 'pendanaan' | 'penggunaan-dana' | 'ewmp' | 'ktk' | 'spmi';

  const tableTitles: Record<SubTab, string> = {
    tupoksi: 'Tabel 1.A.1 Tabel Pimpinan dan Tupoksi UPPS dan PS',
    pendanaan: 'Tabel 1.A.2 Sumber Pendanaan UPPS/PS',
    'penggunaan-dana': 'Tabel 1.A.3 Penggunaan Dana UPPS/PS',
    ewmp: 'Tabel 1.A.4 Rata-rata Beban DTPR per semester (EWMP) pada TS',
    ktk: 'Tabel 1.A.5 Kualifikasi Tenaga Kependidikan',
    spmi: 'Tabel 1.B Tabel Unit SPMI dan SDM',
  };

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('tupoksi');
  const [tabData, setTabData] = useState<Record<SubTab, any[]>>({
    tupoksi: [],
    pendanaan: [],
    'penggunaan-dana': [],
    ewmp: [],
    ktk: [],
    spmi: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

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

  // State untuk modal konfirmasi
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // State untuk struktur organisasi
  const [strukturFileName, setStrukturFileName] = useState('');
  const [strukturFileId, setStrukturFileId] = useState<string | null>(null);
  const [strukturFileUrl, setStrukturFileUrl] = useState('');

  const API_BASE = 'http://localhost:5000/api/budaya-mutu';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  // Fungsi untuk menampilkan popup
  const showPopup = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fungsi untuk menampilkan modal konfirmasi
  const showModal = (title: string, message: string, onConfirm: () => void) => {
    setModal({ show: true, title, message, onConfirm });
  };

  const closeModal = () => {
    setModal({ show: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleModalConfirm = () => {
    modal.onConfirm();
    closeModal();
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

  // Komponen Modal Konfirmasi
  const ConfirmModal = () => {
    if (!modal.show) return null;

    const isDeleteAction = modal.title.includes('Hapus');
    const isImportAction = modal.title.includes('Import');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] animate-fadeIn">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scaleIn">
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isDeleteAction ? 'bg-red-100' : isImportAction ? 'bg-blue-100' : 'bg-yellow-100'
            }`}>
              <AlertCircle className={`${
                isDeleteAction ? 'text-red-600' : isImportAction ? 'text-blue-600' : 'text-yellow-600'
              }`} size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {modal.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {modal.message}
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleModalConfirm}
              className={`px-4 py-2 text-white rounded-lg transition ${
                isDeleteAction 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : isImportAction 
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {isDeleteAction ? 'Hapus' : isImportAction ? 'Import' : 'Ya, Lanjutkan'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  // Fetch struktur organisasi saat component mount
  useEffect(() => {
    fetchStrukturOrganisasi();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}?type=${activeSubTab}`);
      
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

  // Fetch struktur organisasi dari backend
  const fetchStrukturOrganisasi = async () => {
    try {
      const res = await fetch(`${API_BASE}/struktur`);
      const json = await res.json();

      if (json.success && json.file) {
        setStrukturFileName(json.file.fileName);
        setStrukturFileUrl(`http://localhost:5000${json.file.fileUrl}`);
        setStrukturFileId(json.file.id);
      }
    } catch (err) {
      console.error('Fetch struktur error:', err);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showModal(
      'Konfirmasi Import Excel',
      `Apakah Anda yakin ingin mengimport file "${file.name}"? Data yang ada akan diganti dengan data dari file Excel.`,
      async () => {
        const fd = new FormData();
        fd.append('file', file);

        try {
          const res = await fetch(`${API_BASE}/import/${activeSubTab}`, { method: 'POST', body: fd });
          
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            showPopup('Server error - bukan JSON response', 'error');
            console.error('Response:', await res.text());
            return;
          }

          const json = await res.json();

          if (res.ok && json.success) {
            showPopup(`Import ${activeSubTab} berhasil`, 'success');
            fetchData();
            if (Array.isArray(json.data)) {
              setTabData(prev => ({
                ...prev,
                [activeSubTab]: json.data.map((d: any) => ({ id: d.id, data: d.data }))
              }));
            }
          } else {
            showPopup(json.message || 'Gagal import file', 'error');
          }
        } catch (err) {
          showPopup('Gagal upload file', 'error');
          console.error(err);
        }
      }
    );

    e.target.value = '';
  };

  // Handle upload struktur organisasi
  const handleUploadStruktur = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showPopup('Ukuran file maksimal 10MB', 'error');
      e.target.value = '';
      return;
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showPopup('Format file harus JPG, PNG, atau PDF', 'error');
      e.target.value = '';
      return;
    }

    const fd = new FormData();
    fd.append('file', file);

    try {
      showPopup('Sedang mengupload struktur organisasi...', 'info');

      // Jika sudah ada file, update. Jika belum, upload baru
      const url = strukturFileId 
        ? `${API_BASE}/struktur/${strukturFileId}` 
        : `${API_BASE}/upload-struktur`;
      
      const method = strukturFileId ? 'PUT' : 'POST';

      console.log('Uploading to:', url);
      console.log('Method:', method);
      console.log('File:', file.name, file.type, file.size);

      const res = await fetch(url, { method, body: fd });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers.get('content-type'));

      const contentType = res.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error("Response bukan JSON:", text);
        showPopup("Server tidak mengembalikan JSON. Cek console untuk detail.", "error");
        return;
      }

      const json = await res.json();
      console.log('Response JSON:', json);

      if (res.ok && json.success) {
        setStrukturFileName(json.fileName || file.name);
        setStrukturFileUrl(`http://localhost:5000${json.fileUrl}`);
        setStrukturFileId(json.fileId);
        showPopup(strukturFileId ? 'Struktur organisasi berhasil diupdate!' : 'Upload struktur organisasi berhasil!', 'success');
      } else {
        showPopup(json.message || 'Upload gagal', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showPopup(`Terjadi kesalahan: ${err.message}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Handle delete struktur organisasi
  const handleDeleteStruktur = async () => {
    if (!strukturFileId) {
      showPopup("ID file tidak ditemukan", "error");
      return;
    }

    showModal(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus file struktur organisasi ini?",
      async () => {
        try {
          const res = await fetch(`${API_BASE}/struktur/${strukturFileId}`, {
            method: "DELETE",
          });
          const json = await res.json();

          if (res.ok && json.success) {
            setStrukturFileUrl("");
            setStrukturFileName("");
            setStrukturFileId(null);
            showPopup("File berhasil dihapus", "success");
          } else {
            showPopup(json.message || "Gagal menghapus file", "error");
          }
        } catch (err) {
          console.error(err);
          showPopup("Terjadi kesalahan saat menghapus", "error");
        }
      }
    );
  };

  const openAdd = () => {
    setFormData(getEmptyFormData(activeSubTab));
    setEditIndex(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditIndex(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      const { id: itemId, ...dataToSave } = formData;
      
      const method = editIndex !== null && itemId ? 'PUT' : 'POST';
      const url = editIndex !== null && itemId ? `${API_BASE}/${itemId}` : API_BASE;

      const body = JSON.stringify({ type: activeSubTab, data: dataToSave });
      
      console.log('Saving data:', { method, url, body });
      
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await res.text();
        showPopup('Server error - response bukan JSON', 'error');
        console.error('Response:', responseText);
        console.error('Status:', res.status);
        console.error('URL:', url);
        return;
      }

      const json = await res.json();

      if (!res.ok || !json.success) {
        showPopup(json.message || 'Gagal menyimpan data', 'error');
        return;
      }

      setTabData(prev => {
        const prevData = prev[activeSubTab] || [];
        let newData;
        
        if (editIndex !== null) {
          newData = prevData.map((d, i) => 
            i === editIndex ? { ...d, id: itemId, data: dataToSave } : d
          );
        } else {
          newData = [...prevData, { id: json.data.id, data: dataToSave }];
        }
        
        return { ...prev, [activeSubTab]: newData };
      });

      showPopup('Data berhasil disimpan', 'success');
      setShowForm(false);
      setEditIndex(null);
      setFormData({});
    } catch (err) {
      console.error('Save error:', err);
      showPopup('Gagal menyimpan data', 'error');
    }
  };

  const handleEdit = (item: any) => {
    setFormData({ ...item.data, id: item.id });
    const idx = tabData[activeSubTab].findIndex(d => d.id === item.id);
    setEditIndex(idx !== -1 ? idx : null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    showModal(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
          
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            showPopup('Server error - response bukan JSON', 'error');
            console.error('Response:', await res.text());
            return;
          }

          const json = await res.json();

          if (res.ok) {
            setTabData(prev => {
              const prevData = prev[activeSubTab] || [];
              return { ...prev, [activeSubTab]: prevData.filter(d => d.id !== id) };
            });
            showPopup('Data berhasil dihapus', 'success');
          } else {
            showPopup(json.message || 'Gagal menghapus', 'error');
          }
        } catch (err) {
          console.error('Delete error:', err);
          showPopup('Gagal menghapus data', 'error');
        }
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getEmptyFormData = (subTab: SubTab) => {
    switch (subTab) {
      case 'tupoksi':
        return { unitKerja: '', namaKetua: '', periode: '', pendidikanTerakhir: '', jabatanFungsional: '', tugasPokokDanFungsi: '' };
      case 'pendanaan':
        return { sumberPendanaan: '', ts2: '', ts1: '', ts: '', linkBukti: '' };
      case 'penggunaan-dana':
        return { penggunaanDana: '', ts2: '', ts1: '', ts: '', linkBukti: '' };
      case 'ewmp':
        return { namaDTPR: '', psSendiri: '', psLainPTSendiri: '', ptLain: '', sksPenelitian: '', sksPengabdian: '', manajemenPTSendiri: '', manajemenPTLain: '', totalSKS: '' };
      case 'ktk':
        return { jenisTenagaKependidikan: '', s3: '', s2: '', s1: '', d4: '', d3: '', d2: '', d1: '', sma: '', unitKerja: '' };
      case 'spmi':
        return { unitSPMI: '', namaUnitSPMI: '', dokumenSPMI: '', jumlahAuditorMutuInternal: '', certified: '', nonCertified: '', frekuensiAudit: '', buktiCertifiedAuditor: '', laporanAudit: '' };
    }
  };

  const subTabFields: Record<SubTab, { label: string; key: string }[]> = {
    tupoksi: [
      { key: 'unitKerja', label: 'Unit Kerja' },
      { key: 'namaKetua', label: 'Nama Ketua' },
      { key: 'periode', label: 'Periode' },
      { key: 'pendidikanTerakhir', label: 'Pendidikan' },
      { key: 'jabatanFungsional', label: 'Jabatan' },
      { key: 'tugasPokokDanFungsi', label: 'Tupoksi' },
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
      { key: 'jenisTenagaKependidikan', label: 'Jenis Tenaga' },
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
      { key: 'namaUnitSPMI', label: 'Nama Unit' },
      { key: 'dokumenSPMI', label: 'Dokumen' },
      { key: 'jumlahAuditorMutuInternal', label: 'Jumlah Auditor' },
      { key: 'certified', label: 'Certified' },
      { key: 'nonCertified', label: 'Non Certified' },
      { key: 'frekuensiAudit', label: 'Frekuensi Audit' },
      { key: 'buktiCertifiedAuditor', label: 'Bukti Certified' },
      { key: 'laporanAudit', label: 'Laporan Audit' },
    ],
  };

  const getFormFields = (subTab: SubTab) => {
    return subTabFields[subTab].filter(field => field.key !== 'no');
  };

  const data = tabData[activeSubTab];

  const renderColumns = () => (
    <tr>
      {subTabFields[activeSubTab].map(col => (
        <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {col.label}
        </th>
      ))}
      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
    </tr>
  );

  const renderRows = () => {
    if (!data.length)
      return (
        <tr>
          <td colSpan={subTabFields[activeSubTab].length + 1} className="text-center py-6 text-gray-500">
            Belum ada data
          </td>
        </tr>
      );

    return data.map((item, index) => (
      <tr key={item.id} className="bg-white rounded-lg shadow-sm hover:bg-gray-50 border-b">
        {subTabFields[activeSubTab].map(col => (
          <td key={col.key} className="px-6 py-4 text-gray-800">
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
              item.data?.[col.key] ?? '-'
            )}
          </td>
        ))}
        <td className="px-6 py-4 text-center">
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => handleEdit(item)} 
              className="text-blue-600 hover:text-blue-800 transition"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => handleDelete(item.id)} 
              className="text-red-600 hover:text-red-800 transition"
              title="Hapus"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex w-full bg-gray-100">
      {/* Popup Notification */}
      <PopupNotification />
      
      {/* Modal Konfirmasi */}
      <ConfirmModal />

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
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}</style>

      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">

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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} /> Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Save size={16} /> Save Draft
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                <FileText size={16} /> Submit
              </button>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map(tab => (
              <a key={tab.href} href={tab.href} className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-[#ADE7F7] hover:text-[#183A64]">{tab.label}</a>
            ))}
          </div>

          {/* Budaya Mutu Tab */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            
            {/* Struktur Organisasi */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Struktur Organisasi</h3>

                <label
                  htmlFor="strukturFile"
                  className="px-3 py-1 bg-blue-900 text-white text-sm rounded hover:bg-blue-800 cursor-pointer flex items-center gap-2"
                >
                  <Upload size={16} />
                  {strukturFileUrl ? "Ganti File" : "Upload Struktur Organisasi"}
                </label>
                <input
                  id="strukturFile"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleUploadStruktur}
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
                {strukturFileUrl ? (
                  <>
                    {/* Tombol aksi (edit & hapus) */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <label
                        htmlFor="strukturFile"
                        className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 cursor-pointer"
                        title="Ganti File"
                      >
                        <Edit size={16} className="text-blue-700" />
                      </label>

                      <button
                        onClick={handleDeleteStruktur}
                        className="p-2 bg-red-100 rounded-full hover:bg-red-200"
                        title="Hapus File"
                      >
                        <Trash2 size={16} className="text-red-700" />
                      </button>
                    </div>

                    {/* Pratinjau file */}
                    <div className="mt-4">
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
                    </div>

                    {/* Nama file di bawahnya */}
                    <p className="mt-2 text-sm text-gray-600 italic">
                      {strukturFileName}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">Belum ada file struktur organisasi yang diupload.</p>
                )}
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 border-b pb-2 mb-4 overflow-x-auto">
              {['tupoksi','pendanaan','penggunaan-dana','ewmp','ktk','spmi'].map(sub => (
                <button key={sub} onClick={() => setActiveSubTab(sub as SubTab)}
                  className={`px-4 py-2 text-sm rounded-t-lg whitespace-nowrap ${activeSubTab === sub ? 'bg-blue-100 text-blue-900 font-semibold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {sub.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b bg-gray-50 gap-2 md:gap-0">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">Data {activeSubTab}</h3>
                <h2 className="text-sm text-gray-600">{tableTitles[activeSubTab]}</h2>

                <div className="flex gap-2 flex-wrap">
                  <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"><Plus size={16} /> Tambah Data</button>
                  <div className="relative">
                    <input type="file" accept=".xlsx, .xls" id="importExcel" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImportExcel} />
                    <label htmlFor="importExcel" className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <Upload size={16} /> Import Excel
                    </label>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto px-4 py-2">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {renderColumns()}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {renderRows()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Input */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                <div className="bg-white p-5 md:p-6 rounded-xl shadow-lg w-full max-w-xl md:max-w-lg max-h-[85vh] overflow-y-auto transition-transform">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {editIndex !== null ? 'Edit Data' : 'Tambah Data Baru'}
                    </h2>
                    <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getFormFields(activeSubTab).map(field => (
                      <div
                        key={field.key}
                        className={field.key === 'tugasPokokDanFungsi' || field.key === 'dokumenSPMI' ? 'md:col-span-2' : ''}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          name={field.key}
                          value={formData[field.key] || ''}
                          onChange={handleChange}
                          placeholder={`Masukkan ${field.label}`}
                          className="border border-gray-300 p-2.5 rounded-lg w-full text-gray-800 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6 gap-2">
                    <button
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                    >
                      Simpan
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
};