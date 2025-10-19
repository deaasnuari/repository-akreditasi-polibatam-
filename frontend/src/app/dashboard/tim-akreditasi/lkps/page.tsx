'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { loadDraftBudayaMutu, saveDraftBudayaMutu, fetchBudayaMutuData } from '@/services/budayaMutuService';


export default function LKPSPage() {
  const pathname = usePathname();

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

  const API_BASE = 'http://localhost:5000/api/budaya-mutu';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  // =========================
  // Fetch Data per Sub-Tab
  // =========================
 useEffect(() => {
  const draft = loadDraftBudayaMutu(activeSubTab);
  if (draft.length) {
    setTabData(prev => ({ ...prev, [activeSubTab]: draft }));
  } else {
    fetchBudayaMutuData(activeSubTab).then(data => {
      setTabData(prev => ({ ...prev, [activeSubTab]: data }));
    });
  }
}, [activeSubTab]);


  const fetchData = async () => {
  try {
    const res = await fetch(`${API_BASE}?type=${activeSubTab}`);
    const json = await res.json();
    setTabData(prev => ({
      ...prev,
      [activeSubTab]: json.data.map(item => ({
        id: item.id,
        data: item.data // pastikan flat
      }))
    }));
  } catch (err) {
    console.error('Fetch error:', err);
    setTabData(prev => ({ ...prev, [activeSubTab]: [] }));
  }
};

  // =========================
  // Import Excel
  // =========================
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/import/${activeSubTab}`, { method: 'POST', body: fd });
      const json = await res.json();

      if (res.ok && json.success) {
        alert(`✅ Import ${activeSubTab} berhasil`);
        if (Array.isArray(json.data)) {
          setTabData(prev => ({
            ...prev,
            [activeSubTab]: json.data.map((d: any) => ({ id: d.id, data: d.data }))
          }));
        }

      } else {
        alert(json.message || 'Gagal import file');
      }
    } catch (err) {
      alert('❌ Gagal upload file');
      console.error(err);
    } finally {
      e.target.value = '';
    }
  };

  // =========================
  // Tambah / Edit / Hapus
  // =========================
  const openAdd = () => {
    setFormData(getEmptyFormData(activeSubTab));
    setEditIndex(null);
    setShowForm(true);
  };

 // Handle Save
const handleSave = async () => {
  try {
    const method = editIndex !== null ? 'PUT' : 'POST';
    const url = editIndex !== null && formData.id ? `${API_BASE}/${formData.id}` : API_BASE;

    const body = JSON.stringify({ type: activeSubTab, data: formData });
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
    const json = await res.json();

    if (!res.ok || !json.success) {
      alert(json.message || 'Gagal menyimpan data');
      return;
    }

    setTabData(prev => {
      const prevData = prev[activeSubTab] || [];
      const newData =
        editIndex !== null
          ? prevData.map((d, i) => (i === editIndex ? { ...d, data: formData } : d))
          : [...prevData, { id: json.data.id, data: formData }];
      return { ...prev, [activeSubTab]: newData };
    });

    saveDraftBudayaMutu(activeSubTab, [...tabData[activeSubTab], { id: json.data.id, data: formData }]);
    alert('✅ Data berhasil disimpan');
    setShowForm(false);
  } catch (err) {
    console.error(err);
    alert('❌ Gagal menyimpan data');
  }
};

  const handleEdit = (item: any) => {
    setFormData(item.data);
    const idx = tabData[activeSubTab].findIndex(d => d.id === item.id);
    setEditIndex(idx !== -1 ? idx : null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus data ini?')) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok) {
        setTabData(prev => {
          const prevData = prev[activeSubTab] || [];
          return { ...prev, [activeSubTab]: prevData.filter(d => d.id !== id) };
        });
        alert('🗑️ Data dihapus');
      } else {
        alert(json.message || 'Gagal menghapus');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('❌ Gagal menghapus data');
    }
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
        return { no: '', namaDTPR: '', psSendiri: '', psLainPTSendiri: '', ptLain: '', sksPenelitian: '', sksPengabdian: '', manajemenPTSendiri: '', manajemenPTLain: '', totalSKS: '' };
      case 'ktk':
        return { no: '', jenisTenagaKependidikan: '', s3: '', s2: '', s1: '', d4: '', d3: '', d2: '', d1: '', sma: '', unitKerja: '' };
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

  const data = tabData[activeSubTab];

  const renderColumns = () => (
    <tr>
      {subTabFields[activeSubTab].map(col => (
        <th key={col.key}>{col.label}</th>
      ))}
      <th className="px-6 py-3 text-center">Aksi</th>
    </tr>
  );

  const renderRows = () => {
  if (!data.length)
    return (
      <tr>
        <td colSpan={20} className="text-center py-6 text-gray-500">
          Belum ada data
        </td>
      </tr>
    );

  return data.map(item => (
    <tr key={item.id} className="bg-white rounded-lg shadow-sm hover:bg-gray-50 border-b">
      {subTabFields[activeSubTab].map(col => (
        <td key={col.key} className="px-4 py-2 text-gray-800">
          {col.key === 'linkBukti' ? (
            item.data[col.key] ? (
              <a href={item.data[col.key]} target="_blank" className="text-blue-600 hover:underline">Lihat</a>
            ) : '-'
          ) : item.data[col.key]}
        </td>
      ))}
      <td className="px-6 py-3 text-center flex gap-2 justify-center">
        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
      </td>
    </tr>
  ));
};



  // =========================
  // Render Page
  // =========================
  return (
    <div className="flex w-full bg-gray-100">
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Download size={16} /> Export PDF</button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Save size={16} /> Save Draft</button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"><FileText size={16} /> Submit</button>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map(tab => (
              <Link key={tab.href} href={tab.href} className={`px-4 py-2 rounded-lg text-sm font-medium ${pathname === tab.href ? 'bg-[#183A64] text-[#ADE7F7]' : 'bg-gray-100 text-gray-700 hover:bg-[#ADE7F7] hover:text-[#183A64]'}`}>{tab.label}</Link>
            ))}
          </div>

          {/* Budaya Mutu Tab */}
          {pathname === '/dashboard/tim-akreditasi/lkps' && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              
              {/* Struktur Organisasi */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Struktur Organisasi</h3>
                  <button className="px-3 py-1 bg-blue-900 text-white text-sm rounded hover:bg-blue-800">Upload Struktur Organisasi</button>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500">Klik untuk upload atau drag & drop file struktur organisasi</p>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-2 border-b pb-2 mb-4">
                {['tupoksi','pendanaan','penggunaan-dana','ewmp','ktk','spmi'].map(sub => (
                  <button key={sub} onClick={() => setActiveSubTab(sub as SubTab)}
                    className={`px-4 py-2 text-sm rounded-t-lg ${activeSubTab === sub ? 'bg-blue-100 text-blue-900 font-semibold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
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
                    <form onSubmit={e => e.preventDefault()} className="relative">
                      <input type="file" accept=".xlsx, .xls" id="importExcel" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImportExcel} />
                      <label htmlFor="importExcel" className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <Upload size={16} /> Import Excel
                      </label>
                    </form>
                  </div>
                </div>

                <div className="overflow-x-auto px-4 py-2">
                  <table className="w-full text-sm border-separate border-spacing-y-2">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  {renderColumns()}
                </thead>
                <tbody>
                  {renderRows()}
                </tbody>
                  </table>
                </div>
              </div>

              {/* Form Input */}
              {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start md:items-center overflow-auto z-50 p-4">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold text-gray-800">{editIndex !== null ? 'Edit Data' : 'Tambah Data Baru'}</h2>
                      <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                    </div>

                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subTabFields[activeSubTab].map(field => (
                        <input 
                          key={field.key} 
                          name={field.key} 
                          value={formData[field.key] || ''} 
                          onChange={handleChange} 
                          placeholder={field.label} 
                          className="border p-3 rounded-lg w-full text-gray-800 focus:ring-2 focus:ring-blue-300" 
                        />
                      ))}
                    </div>


                    <div className="flex justify-end mt-6 gap-2">
                      <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Batal</button>
                      <button onClick={handleSave} className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800">Simpan</button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

