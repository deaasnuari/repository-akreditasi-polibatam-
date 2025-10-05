'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X } from 'lucide-react';

export default function LKPSPage() {
  const [activeTab, setActiveTab] = useState('budaya-mutu');
  const [activeSubTab, setActiveSubTab] = useState('tupoksi');
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const API_BASE = 'http://localhost:5000/api/budaya-mutu';

  // =========================
  // Fetch Data
  // =========================
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}?type=${activeSubTab}`);
      if (!res.ok) throw new Error('Gagal fetch data');
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  // =========================
  // Import Excel
  // =========================
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/import/${activeSubTab}`, {
        method: 'POST',
        body: fd,
      });
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

  const handleChange = (e: any) => {
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
            <th className="px-6 py-3">Pendidikan</th>
            <th className="px-6 py-3">Jabatan</th>
            <th className="px-6 py-3">Tupoksi</th>
          </>
        );
      case 'pendanaan':
        return (
          <>
            <th className="px-6 py-3">Sumber Dana</th>
            <th className="px-6 py-3">Jumlah</th>
            <th className="px-6 py-3">Tahun</th>
          </>
        );
      case 'penggunaan-dana':
        return (
          <>
            <th className="px-6 py-3">Jenis Kegiatan</th>
            <th className="px-6 py-3">Jumlah Dana</th>
            <th className="px-6 py-3">Tahun</th>
          </>
        );
      case 'spmi':
        return (
          <>
            <th className="px-6 py-3">Nama Dokumen</th>
            <th className="px-6 py-3">Nomor Dokumen</th>
            <th className="px-6 py-3">Tanggal Berlaku</th>
          </>
        );
    }
  };

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
              <td className="px-6 py-3">{item.pendidikan}</td>
              <td className="px-6 py-3">{item.jabatan}</td>
              <td className="px-6 py-3">{item.tupoksi}</td>
            </>
          )}
          {activeSubTab === 'pendanaan' && (
            <>
              <td className="px-6 py-3">{item.sumberDana}</td>
              <td className="px-6 py-3">{item.jumlah}</td>
              <td className="px-6 py-3">{item.tahun}</td>
            </>
          )}
          {activeSubTab === 'penggunaan-dana' && (
  <>
    <td className="px-6 py-3">{item.jenisKegiatan}</td>
    <td className="px-6 py-3">{item.jumlahDana}</td>
    <td className="px-6 py-3">{item.tahun}</td>
  </>
)}
          {activeSubTab === 'spmi' && (
            <>
              <td className="px-6 py-3">{item.namaDokumen}</td>
              <td className="px-6 py-3">{item.nomorDokumen}</td>
              <td className="px-6 py-3">{item.tanggalBerlaku}</td>
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

            {/* Tabs utama */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['budaya-mutu', 'relevansi-pendidikan', 'relevansi-penelitian', 'relevansi-pkm', 'akuntabilitas', 'diferensiasi-misi'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeTab === tab ? 'bg-blue-100 text-blue-900 font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Budaya Mutu Tab */}
          {activeTab === 'budaya-mutu' && (
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
                {['tupoksi', 'pendanaan', 'penggunaan-dana', 'spmi'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubTab(sub)}
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
                  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold text-gray-800">{editIndex !== null ? 'Edit Data' : 'Tambah Data Baru'}</h2>
                      <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* ==================== Form Tupoksi ==================== */}
                      {activeSubTab === 'tupoksi' && (
                        <>
                          <input name="unitKerja" value={formData.unitKerja || ''} onChange={handleChange} placeholder="Unit Kerja" className="border p-3 rounded-lg w-full" />
                          <input name="namaKetua" value={formData.namaKetua || ''} onChange={handleChange} placeholder="Nama Ketua" className="border p-3 rounded-lg w-full" />
                          <input name="periode" value={formData.periode || ''} onChange={handleChange} placeholder="Periode Jabatan" className="border p-3 rounded-lg w-full" />
                          <input name="pendidikan" value={formData.pendidikan || ''} onChange={handleChange} placeholder="Pendidikan Terakhir" className="border p-3 rounded-lg w-full" />
                          <input name="jabatan" value={formData.jabatan || ''} onChange={handleChange} placeholder="Jabatan Fungsional" className="border p-3 rounded-lg w-full" />
                          <input name="tupoksi" value={formData.tupoksi || ''} onChange={handleChange} placeholder="Tupoksi" className="border p-3 rounded-lg w-full" />
                        </>
                      )}

                      {/* ==================== Form Pendanaan ==================== */}
                      {activeSubTab === 'pendanaan' && (
                        <>
                          <input name="sumberDana" value={formData.sumberDana || ''} onChange={handleChange} placeholder="Sumber Dana" className="border p-3 rounded-lg w-full" />
                          <input name="jumlah" value={formData.jumlah || ''} onChange={handleChange} placeholder="Jumlah Dana" className="border p-3 rounded-lg w-full" />
                          <input name="tahun" value={formData.tahun || ''} onChange={handleChange} placeholder="Tahun" className="border p-3 rounded-lg w-full" />
                        </>
                      )}

                      {activeSubTab === 'penggunaan-dana' && (
  <>
    <input
      name="jenisKegiatan"
      value={formData.jenisKegiatan || ''}
      onChange={handleChange}
      placeholder="Jenis Kegiatan"
      className="border p-3 rounded-lg w-full"
    />
    <input
      name="jumlahDana"
      value={formData.jumlahDana || ''}
      onChange={handleChange}
      placeholder="Jumlah Dana Digunakan"
      className="border p-3 rounded-lg w-full"
    />
    <input
      name="tahun"
      value={formData.tahun || ''}
      onChange={handleChange}
      placeholder="Tahun"
      className="border p-3 rounded-lg w-full"
    />
  </>
)}


                      {/* ==================== Form SPMI ==================== */}
                      {activeSubTab === 'spmi' && (
                        <>
                          <input name="namaDokumen" value={formData.namaDokumen || ''} onChange={handleChange} placeholder="Nama Dokumen" className="border p-3 rounded-lg w-full" />
                          <input name="nomorDokumen" value={formData.nomorDokumen || ''} onChange={handleChange} placeholder="Nomor Dokumen" className="border p-3 rounded-lg w-full" />
                          <input name="tanggalBerlaku" value={formData.tanggalBerlaku || ''} onChange={handleChange} placeholder="Tanggal Berlaku" className="border p-3 rounded-lg w-full" />
                        </>
                      )}

                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
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
