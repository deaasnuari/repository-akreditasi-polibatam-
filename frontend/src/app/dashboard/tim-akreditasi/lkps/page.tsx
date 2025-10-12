'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LKPSPage() {
  const pathname = usePathname();

  // =========================
  // Tipe SubTab
  // =========================
  type SubTab = 'tupoksi' | 'pendanaan' | 'penggunaan-dana' | 'ewmp' | 'ktk' | 'spmi';


  // =========================
  // deskripsi & judul tabel tiap sub-tab
  // =========================

  const tableTitles: Record<SubTab, string> = {
    tupoksi: 'Tabel 1.A.1 Tabel Pimpinan dan Tupoksi UPPS dan PS',
    pendanaan: 'Tabel 1.A.2 Sumber Pendanaan UPPS/PS',
    'penggunaan-dana': 'Tabel 1.A.3 Penggunaan Dana UPPS/PS',
    ewmp: 'Tabel 1.A.4 Rata-rata Beban DTPR per semester (EWMP) pada TS',
    ktk: 'Tabel 1.A.5 Kualifikasi Tenaga Kependidikan',
    spmi: 'Tabel 1.B Tabel Unit SPMI dan SDM',
  };

  // =========================
  // State
  // =========================
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('tupoksi');
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const API_BASE = 'http://localhost:5000/api/budaya-mutu';

  // =========================
  // Tabs Navigasi Utama
  // =========================
  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  // =========================
  // Fetch Data
  // =========================
  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}?type=${activeSubTab}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setData([]);
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
        await fetchData();
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
    setFormData({});
    setEditIndex(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const method = editIndex !== null && formData.id ? 'PUT' : 'POST';
      const url = method === 'PUT' ? `${API_BASE}/${formData.id}` : API_BASE;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: activeSubTab }),
      });
      const json = await res.json();
      if (res.ok) {
        alert('✅ Data berhasil disimpan');
        setShowForm(false);
        await fetchData();
      } else {
        alert(json.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };  

  const handleEdit = (item: any) => {
    setFormData(item);
    const idx = data.findIndex((d) => d.id === item.id);
    setEditIndex(idx !== -1 ? idx : null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus data ini?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        alert('🗑️ Data dihapus');
        setData((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(json.message || 'Gagal menghapus');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // =========================
  // Render Table Columns & Rows
  // =========================
  
  const renderColumns = () => {
    switch (activeSubTab) {
      case 'tupoksi':
        return (
          <>
            <th className="px-6 py-3">Unit Kerja</th>
            <th className="px-6 py-3">Nama Ketua</th>
            <th className="px-6 py-3">Periode</th>
            <th className="px-6 py-3">Pendidikan Terakhir</th>
            <th className="px-6 py-3">Jabatan Fungsional</th>
            <th className="px-6 py-3">Tugas Pokok dan Fungsi</th>
          </>
        );
      case 'pendanaan':
        return (
          <>
            <th className="px-6 py-3">Sumber Pendanaan</th>
            <th className="px-6 py-3">TS-2</th>
            <th className="px-6 py-3">TS-1</th>
            <th className="px-6 py-3">TS</th>
            <th className="px-6 py-3">Link Bukti</th>
          </>
        );

      case 'penggunaan-dana':
        return (
          <>
            <th className="px-6 py-3">Penggunaan Dana</th>
            <th className="px-6 py-3">TS-2</th>
            <th className="px-6 py-3">TS-1</th>
            <th className="px-6 py-3">TS</th>
            <th className="px-6 py-3">Link Bukti</th>
          </>
        );
        case 'ewmp':
        return (
          <>
            <th className="px-6 py-3">No</th>
            <th className="px-6 py-3">Nama DTPR</th>
            <th className="px-6 py-3">PS Sendiri</th>
            <th className="px-6 py-3">PS Lain, PT Sendiri</th>
            <th className="px-6 py-3">PT Lain</th>
            <th className="px-6 py-3">SKS Penelitian</th>
            <th className="px-6 py-3">SKS Pengabdian</th>
            <th className="px-6 py-3">Manajemen PT Sendiri</th>
            <th className="px-6 py-3">Manajemen PT Lain</th>
            <th className="px-6 py-3">Total SKS</th>
          </>
        );

        case 'ktk':
                return (
            <>
              <th className="px-6 py-3">No</th>
              <th className="px-6 py-3">Jenis Tenaga Kependidikan </th>
              <th className="px-6 py-3">S3</th>
              <th className="px-6 py-3">S2</th>
              <th className="px-6 py-3">S1</th>
              <th className="px-6 py-3">D4</th>
              <th className="px-6 py-3">D3</th>
              <th className="px-6 py-3">D2</th>
              <th className="px-6 py-3">D1</th>
              <th className="px-6 py-3">Sma</th>
              <th className="px-6 py-3">Unit Kerja</th>
            </>
          );

      case 'spmi':
        return (
          <>
            <th className="px-6 py-3">Unit SPMI</th>
            <th className="px-6 py-3">Nama Unit SPMI</th>
            <th className="px-6 py-3">Dokumen SPMI</th>
            <th className="px-6 py-3">Jumlah Auditor Mutu Internal</th>
            <th className="px-6 py-3">Certified</th>
            <th className="px-6 py-3">Non Certified</th>
            <th className="px-6 py-3">Frekuensi Audit</th>
            <th className="px-6 py-3">Bukti Certified Auditor</th>
            <th className="px-6 py-3">Laporan Audit</th>
          </>
        );
    }
  };


// =========================
  // Render Table Rows
// =========================
  const renderRows = () =>
    data.length === 0 ? (
      <tr>
        <td colSpan={8} className="text-center py-6 text-gray-500">
          Belum ada data
        </td>
      </tr>
    ) : (
      data.map((item) => (
        <tr key={item.id} className="bg-white rounded-lg shadow-sm hover:bg-gray-50">
          {activeSubTab === 'tupoksi' && (
            <>
              <td className="px-6 py-3">{item.unitKerja}</td>
              <td className="px-6 py-3">{item.namaKetua}</td>
              <td className="px-6 py-3">{item.periode}</td>
              <td className="px-6 py-3">{item.pendidikanTerakhir}</td>
              <td className="px-6 py-3">{item.jabatanFungsional}</td>
              <td className="px-6 py-3">{item.tugasPokokDanFungsi}</td>
            </>
          )}
          {activeSubTab === 'pendanaan' && (
            <>
              <td className="px-6 py-3">{item.sumberPendanaan}</td>
              <td className="px-6 py-3">{item.ts2}</td>
              <td className="px-6 py-3">{item.ts1}</td>
              <td className="px-6 py-3">{item.ts}</td>
              <td className="px-6 py-3">
                {item.linkBukti ? (
                  <a href={item.linkBukti} target="_blank" className="text-blue-600 hover:underline">Lihat</a>
                ) : '-'}
              </td>
            </>
          )}
          {activeSubTab === 'penggunaan-dana' && (
            <>
              <td className="px-6 py-3">{item.penggunaanDana}</td>
              <td className="px-6 py-3">{item.ts2}</td>
              <td className="px-6 py-3">{item.ts1}</td>
              <td className="px-6 py-3">{item.ts}</td>
              <td className="px-6 py-3">
                {item.linkBukti ? (
                  <a href={item.linkBukti} target="_blank" className="text-blue-600 hover:underline">Lihat</a>
                ) : '-'}
              </td>
            </>
          )}

          {activeSubTab === 'ewmp' && (
            <>
              <td className="px-6 py-3">{item.no}</td>
              <td className="px-6 py-3">{item.namaDTPR}</td>
              <td className="px-6 py-3">{item.psSendiri}</td>
              <td className="px-6 py-3">{item.psLainPTSendiri}</td>
              <td className="px-6 py-3">{item.ptLain}</td>
              <td className="px-6 py-3">{item.sksPenelitian}</td>
              <td className="px-6 py-3">{item.sksPengabdian}</td>
              <td className="px-6 py-3">{item.manajemenPTSendiri}</td>
              <td className="px-6 py-3">{item.manajemenPTLain}</td>
              <td className="px-6 py-3">{item.totalSKS}</td>
            </>
          )}

          {activeSubTab === 'ktk' && (
            <>
              <td className="px-6 py-3">{item.no}</td>
              <td className="px-6 py-3">{item.jenisTenagaKependidikan}</td>
              <td className="px-6 py-3">{item.s3}</td>
              <td className="px-6 py-3">{item.s2}</td>
              <td className="px-6 py-3">{item.s1}</td>
              <td className="px-6 py-3">{item.d4}</td>
              <td className="px-6 py-3">{item.d3}</td>
              <td className="px-6 py-3">{item.d2}</td>
              <td className="px-6 py-3">{item.d1}</td>
              <td className="px-6 py-3">{item.sma}</td>
              <td className="px-6 py-3">{item.unitKerja}</td>
            </>
          )}

          {activeSubTab === 'spmi' && (
            <>
              <td className="px-6 py-3">{item.unitSPMI}</td>
              <td className="px-6 py-3">{item.namaUnitSPMI}</td>
              <td className="px-6 py-3">{item.dokumenSPMI}</td>
              <td className="px-6 py-3">{item.jumlahAuditorMutuInternal}</td>
              <td className="px-6 py-3">{item.certified}</td>
              <td className="px-6 py-3">{item.nonCertified}</td>
              <td className="px-6 py-3">{item.frekuensiAudit}</td>
              <td className="px-6 py-3">
                {item.buktiCertifiedAuditor ? (
                  <a href={item.buktiCertifiedAuditor} target="_blank" className="text-blue-600 hover:underline">Lihat</a>    
                ) : '-'}
              </td>
              <td className="px-6 py-3">{item.laporanAudit ? (
                  <a href={item.laporanAudit} target="_blank" className="text-blue-600 hover:underline">Lihat</a>    
                ) : '-'}
              </td>
            </>
          )}
          <td className="px-6 py-3 text-center flex justify-center gap-2">
            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
              <Edit size={16} />
            </button>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
              <Trash2 size={16} />
            </button>
          </td>
        </tr>
      ))
    );

  // =========================
  // Render Page
  // =========================
  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
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
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                  <FileText size={16} /> Submit
                </button>
              </div>
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
                
                {['tupoksi', 'pendanaan', 'penggunaan-dana', 'ewmp', 'ktk', 'spmi'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubTab(sub as SubTab)}
                    className={`px-4 py-2 text-sm rounded-t-lg ${
                      activeSubTab === sub ? 'bg-blue-100 text-blue-900 font-semibold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sub.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </button>
                ))}
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b bg-gray-50 gap-2 md:gap-0">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">Data {activeSubTab}</h3>
                  <h2 className="text-sm text-gray-600">{tableTitles[activeSubTab]}</h2>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={openAdd}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                    >
                      <Plus size={16} /> Tambah Data
                    </button>
                    <form onSubmit={(e) => e.preventDefault()} className="relative">
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        id="importExcel"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleImportExcel}
                      />
                      <label
                        htmlFor="importExcel"
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <Upload size={16} /> Import Excel
                      </label>
                    </form>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 border-separate border-spacing-y-2">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                      <tr>
                        {renderColumns()}
                        <th className="px-6 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>{renderRows()}</tbody>
                  </table>
                </div>
              </div>

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
                      

                      {/* Form per sub-tab */}
                      {activeSubTab === 'tupoksi' && (
                        <>
                          <input name="unitKerja" value={formData.unitKerja || ''} onChange={handleChange} placeholder="Unit Kerja" className="border p-3 rounded-lg w-full" />
                          <input name="namaKetua" value={formData.namaKetua || ''} onChange={handleChange} placeholder="Nama Ketua" className="border p-3 rounded-lg w-full" />
                          <input name="periode" value={formData.periode || ''} onChange={handleChange} placeholder="Periode Jabatan" className="border p-3 rounded-lg w-full" />
                          <input name="pendidikanTerakhir" value={formData.pendidikanTerakhir || ''} onChange={handleChange} placeholder="Pendidikan Terakhir" className="border p-3 rounded-lg w-full" />
                          <input name="jabatanFungsional" value={formData.jabatanFungsional || ''} onChange={handleChange} placeholder="Jabatan Fungsional" className="border p-3 rounded-lg w-full" />
                          <input name="tugasPokokDanFungsi" value={formData.tugasPokokDanFungsi || ''} onChange={handleChange} placeholder="Tupoksi" className="border p-3 rounded-lg w-full" />
                        </>
                      )}

                      {/* ==================== Form Pendanaan ==================== */}
                        {activeSubTab === 'pendanaan' && (
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <input name="sumberPendanaan" value={formData.sumberPendanaan || ''} onChange={handleChange} placeholder="Sumber Pendanaan" className="border p-3 rounded-lg w-full" />
                            <input name="ts2" type="number" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                            <input name="ts1" type="number" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                            <input name="ts"  type="number" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                            <input name="linkBukti"  value={formData.linkBukti || ''} onChange={handleChange} placeholder="Link Bukti" className="border p-3 rounded-lg w-full" />
                          </div>
                        )}
                      {/* ==================== Form Penggunaan Dana ==================== */}
                      {activeSubTab === 'penggunaan-dana' && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <input name="penggunaanDana" value={formData.penggunaanDana || ''} onChange={handleChange} placeholder="Penggunaan Dana" className="border p-3 rounded-lg w-full" />
                            <input name="ts2" type="number" value={formData.ts2 || ''} onChange={handleChange} placeholder="TS-2" className="border p-3 rounded-lg w-full" />
                            <input name="ts1" type="number" value={formData.ts1 || ''} onChange={handleChange} placeholder="TS-1" className="border p-3 rounded-lg w-full" />
                            <input name="ts"  type="number" value={formData.ts || ''} onChange={handleChange} placeholder="TS" className="border p-3 rounded-lg w-full" />
                            <input name="linkBukti"  value={formData.linkBukti || ''} onChange={handleChange} placeholder="Link Bukti" className="border p-3 rounded-lg w-full" />
                          </div>
                        )}
                      {/* ==================== Form EWMP ==================== */}
                          {activeSubTab === 'ewmp' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input name="no" value={formData.no || ''} onChange={handleChange} placeholder="No" className="border p-3 rounded-lg w-full" />
                              <input name="namaDTPR" value={formData.namaDTPR || ''} onChange={handleChange} placeholder="Nama DTPR" className="border p-3 rounded-lg w-full" />
                              <input name="psSendiri"  value={formData.psSendiri || ''} onChange={handleChange} placeholder="PS Sendiri" className="border p-3 rounded-lg w-full" />
                              <input name="psLainPTSendiri" value={formData.psLainPTSendiri || ''} onChange={handleChange} placeholder="PS Lain, PT Sendiri" className="border p-3 rounded-lg w-full" />
                              <input name="ptLain"  value={formData.ptLain || ''} onChange={handleChange} placeholder="PT Lain" className="border p-3 rounded-lg w-full" />
                              <input name="sksPenelitian"  value={formData.sksPenelitian || ''} onChange={handleChange} placeholder="SKS Penelitian" className="border p-3 rounded-lg w-full" />
                              <input name="sksPengabdian"  value={formData.sksPengabdian || ''} onChange={handleChange} placeholder="SKS Pengabdian" className="border p-3 rounded-lg w-full" />
                              <input name="manajemenPTSendiri"  value={formData.manajemenPTSendiri || ''} onChange={handleChange} placeholder="Manajemen PT Sendiri" className="border p-3 rounded-lg w-full" />
                              <input name="manajemenPTLain"  value={formData.manajemenPTLain || ''} onChange={handleChange} placeholder="Manajemen PT Lain" className="border p-3 rounded-lg w-full" />
                              <input name="totalSKS"  value={formData.totalSKS || ''} onChange={handleChange} placeholder="Total SKS" className="border p-3 rounded-lg w-full" />
                            </div>
                          )}
                      {/* ==================== Form KTK ==================== */}
                        {activeSubTab === 'ktk' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input name="no" value={formData.no || ''} onChange={handleChange} placeholder="No" className="border p-3 rounded-lg w-full" />
                              <input name="jenisTenagaKependidikan" value={formData.jenisTenagaKependidikan || ''} onChange={handleChange} placeholder="Jenis Tenaga Kependidikan" className="border p-3 rounded-lg w-full" />
                              <input name="s3" value={formData.s3 || ''} onChange={handleChange} placeholder="S3" className="border p-3 rounded-lg w-full" />
                              <input name="s2" value={formData.s2 || ''} onChange={handleChange} placeholder="S2" className="border p-3 rounded-lg w-full" />
                              <input name="s1" value={formData.s1 || ''} onChange={handleChange} placeholder="S1" className="border p-3 rounded-lg w-full" />
                              <input name="d4" value={formData.d4 || ''} onChange={handleChange} placeholder="D4" className="border p-3 rounded-lg w-full" />
                              <input name="d3" value={formData.d3 || ''} onChange={handleChange} placeholder="D3" className="border p-3 rounded-lg w-full" />
                              <input name="d2" value={formData.d2 || ''} onChange={handleChange} placeholder="D2" className="border p-3 rounded-lg w-full" />
                              <input name="d1" value={formData.d1 || ''} onChange={handleChange} placeholder="D1" className="border p-3 rounded-lg w-full" />
                              <input name="sma" value={formData.sma || ''} onChange={handleChange} placeholder="SMA" className="border p-3 rounded-lg w-full" />
                              <input name="unitKerja" value={formData.unitKerja || ''} onChange={handleChange} placeholder="Unit Kerja" className="border p-3 rounded-lg w-full" />
                            </div>
                          )}

                      {activeSubTab === 'spmi' && (
                        <>
                          <input name="unitSPMI" value={formData.unitSPMI || ''} onChange={handleChange} placeholder="Unit SPMI" className="border p-3 rounded-lg w-full" />
                          <input name="namaUnitSPMI" value={formData.namaUnitSPMI || ''} onChange={handleChange} placeholder="Nama Unit SPMI" className="border p-3 rounded-lg w-full" />
                          <input name="dokumenSPMI" value={formData.dokumenSPMI || ''} onChange={handleChange} placeholder="Dokumen SPMI" className="border p-3 rounded-lg w-full" />
                          <input name="jumlahAuditorMutuInternal" type="number" value={formData.jumlahAuditorMutuInternal || ''} onChange={handleChange} placeholder="Jumlah Auditor Mutu Internal" className="border p-3 rounded-lg w-full" />
                          <input name="certified"  value={formData.certified || ''} onChange={handleChange} placeholder="Certified" className="border p-3 rounded-lg w-full" />
                          <input name="nonCertified" type="number" value={formData.nonCertified || ''} onChange={handleChange} placeholder="Non Certified" className="border p-3 rounded-lg w-full" />  
                          <input name="frekuensiAudit" value={formData.frekuensiAudit || ''} onChange={handleChange} placeholder="Frekuensi Audit" className="border p-3 rounded-lg w-full" />  
                          <input name="buktiCertifiedAuditor" value={formData.buktiCertifiedAuditor || ''} onChange={handleChange} placeholder="Bukti Certified Auditor" className="border p-3 rounded-lg w-full" />
                          <input name="laporanAudit" value={formData.laporanAudit || ''} onChange={handleChange} placeholder="Laporan Audit" className="border p-3 rounded-lg w-full" />
                        </>
                      )}

                    </div>
                    <div className="flex justify-end gap-2 mt-8">
                      <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                      <button onClick={handleSave} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Simpan</button>
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
