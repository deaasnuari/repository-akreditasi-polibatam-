'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Download, Save, Plus, Upload, Trash2, Pencil } from 'lucide-react';
import { SubTab, fetchAkuntabilitasData, createAkuntabilitasData, updateAkuntabilitasData, deleteAkuntabilitasData } from '@/services/akuntabilitasService';

export default function AkuntabilitasPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('tataKelola');

  const [tataKelolaData, setTataKelolaData] = useState<any[]>([]);
  const [saranaData, setSaranaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Load data on mount and when subtab changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeSubTab === 'tataKelola') {
          const data = await fetchAkuntabilitasData('tataKelola');
          setTataKelolaData(data);
        } else {
          const data = await fetchAkuntabilitasData('sarana');
          setSaranaData(data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeSubTab]);

   const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tata-usaha/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tata-usaha/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tata-usaha/lkps/relevansi-penelitian' },
    { label: 'Relevansi Pkm', href: '/dashboard/tata-usaha/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tata-usaha/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tata-usaha/lkps/diferensiasi-misi' },
  ];


  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) alert(`File ${file.name} berhasil diimpor (dummy)`);
  };

  const openModal = (index: number | null = null) => {
    setEditIndex(index);
    if (index !== null) {
      setFormData(
        activeSubTab === 'tataKelola' ? tataKelolaData[index] : saranaData[index]
      );
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setEditIndex(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editIndex !== null) {
        // Update existing data
        const item = activeSubTab === 'tataKelola' ? tataKelolaData[editIndex] : saranaData[editIndex];
        const result = await updateAkuntabilitasData(item.id, formData);
        if (result.success) {
          // Reload data
          const data = await fetchAkuntabilitasData(activeSubTab);
          if (activeSubTab === 'tataKelola') {
            setTataKelolaData(data);
          } else {
            setSaranaData(data);
          }
        } else {
          alert('Gagal memperbarui data: ' + result.message);
        }
      } else {
        // Create new data
        const result = await createAkuntabilitasData(activeSubTab, formData);
        if (result.success) {
          // Reload data
          const data = await fetchAkuntabilitasData(activeSubTab);
          if (activeSubTab === 'tataKelola') {
            setTataKelolaData(data);
          } else {
            setSaranaData(data);
          }
        } else {
          alert('Gagal menambahkan data: ' + result.message);
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleDelete = async (index: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        const item = activeSubTab === 'tataKelola' ? tataKelolaData[index] : saranaData[index];
        const result = await deleteAkuntabilitasData(item.id);
        if (result.success) {
          // Reload data
          const data = await fetchAkuntabilitasData(activeSubTab);
          if (activeSubTab === 'tataKelola') {
            setTataKelolaData(data);
          } else {
            setSaranaData(data);
          }
        } else {
          alert('Gagal menghapus data: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Terjadi kesalahan saat menghapus data');
      }
    }
  };

  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">

          {/* Header */}
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

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  pathname === tab.href
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Sub Tabs */}
          <div className="flex gap-2 mb-4 border-b">
            <button
              onClick={() => setActiveSubTab('tataKelola')}
              className={`px-4 py-2 rounded-t-lg font-medium ${
                activeSubTab === 'tataKelola'
                  ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sistem Tata Kelola
            </button>
            <button
              onClick={() => setActiveSubTab('sarana')}
              className={`px-4 py-2 rounded-t-lg font-medium ${
                activeSubTab === 'sarana'
                  ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sarana & Prasarana Pendidikan
            </button>
          </div>

          {/* === SISTEM TATA KELOLA === */}
          {activeSubTab === 'tataKelola' && (
            <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Sistem Tata Kelola</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                  >
                    <Plus size={16} /> Tambah Data
                  </button>
                  <form className="relative">
                    <input type="file" accept=".xlsx, .xls" id="importExcel1" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImport} />
                    <label htmlFor="importExcel1" className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <Upload size={16} /> Import Excel
                    </label>
                  </form>
                </div>
              </div>
              {/* table tata kelola... (tidak diubah) */}
              <table className="w-full border-collapse border text-sm text-center">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 w-12">No</th>
                    <th className="border p-2">Jenis Tata Kelola</th>
                    <th className="border p-2">Nama Sistem Informasi</th>
                    <th className="border p-2">Akses</th>
                    <th className="border p-2">Unit Kerja</th>
                    <th className="border p-2">Link Bukti</th>
                    <th className="border p-2 w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tataKelolaData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="border p-2 text-gray-500">Belum ada data</td>
                    </tr>
                  ) : tataKelolaData.map((row, i) => (
                    <tr key={i}>
                      <td className="border p-2">{i + 1}</td>
                      <td className="border p-2">{row.jenis || ''}</td>
                      <td className="border p-2">{row.nama || ''}</td>
                      <td className="border p-2">{row.akses || ''}</td>
                      <td className="border p-2">{row.unit || ''}</td>
                      <td className="border p-2">{row.link || ''}</td>
                      <td className="border p-2 flex justify-center gap-2">
                        <button onClick={() => openModal(i)} className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(i)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === SARANA === */}
          {activeSubTab === 'sarana' && (
            <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Sarana dan Prasarana Pendidikan</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                  >
                    <Plus size={16} /> Tambah Data
                  </button>
                  <form className="relative">
                    <input type="file" accept=".xlsx, .xls" id="importExcel2" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImport} />
                    <label htmlFor="importExcel2" className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <Upload size={16} /> Import Excel
                    </label>
                  </form>
                </div>
              </div>
              {/* table sarana... (tidak diubah) */}
              <table className="w-full border-collapse border text-sm text-center">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Nama Prasarana</th>
                    <th className="border p-2">Daya Tampung</th>
                    <th className="border p-2">Luas Ruang</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Lisensi</th>
                    <th className="border p-2">Perangkat</th>
                    <th className="border p-2">Link Bukti</th>
                    <th className="border p-2 w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {saranaData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border p-2 text-gray-500">Belum ada data</td>
                    </tr>
                  ) : saranaData.map((row, i) => (
                    <tr key={i}>
                      <td className="border p-2">{row.nama || ''}</td>
                      <td className="border p-2">{row.tampung || ''}</td>
                      <td className="border p-2">{row.luas || ''}</td>
                      <td className="border p-2">{row.status || ''}</td>
                      <td className="border p-2">{row.lisensi || ''}</td>
                      <td className="border p-2">{row.perangkat || ''}</td>
                      <td className="border p-2">{row.link || ''}</td>
                      <td className="border p-2 flex justify-center gap-2">
                        <button onClick={() => openModal(i)} className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(i)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal sama seperti sebelumnya */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  {editIndex !== null ? 'Edit Data' : 'Tambah Data'}
                </h3>
                <div className="space-y-2">
                  {activeSubTab === 'tataKelola' ? (
                    <>
                      <input name="jenis" placeholder="Jenis Tata Kelola" className="w-full border p-2 rounded" value={formData.jenis || ''} onChange={handleChange} />
                      <input name="nama" placeholder="Nama Sistem Informasi" className="w-full border p-2 rounded" value={formData.nama || ''} onChange={handleChange} />
                      <input name="akses" placeholder="Akses" className="w-full border p-2 rounded" value={formData.akses || ''} onChange={handleChange} />
                      <input name="unit" placeholder="Unit Kerja" className="w-full border p-2 rounded" value={formData.unit || ''} onChange={handleChange} />
                      <input name="link" placeholder="Link Bukti" className="w-full border p-2 rounded" value={formData.link || ''} onChange={handleChange} />
                    </>
                  ) : (
                    <>
                      <input name="nama" placeholder="Nama Prasarana" className="w-full border p-2 rounded" value={formData.nama || ''} onChange={handleChange} />
                      <input name="tampung" placeholder="Daya Tampung" className="w-full border p-2 rounded" value={formData.tampung || ''} onChange={handleChange} />
                      <input name="luas" placeholder="Luas Ruang" className="w-full border p-2 rounded" value={formData.luas || ''} onChange={handleChange} />
                      <input name="status" placeholder="Status" className="w-full border p-2 rounded" value={formData.status || ''} onChange={handleChange} />
                      <input name="lisensi" placeholder="Lisensi" className="w-full border p-2 rounded" value={formData.lisensi || ''} onChange={handleChange} />
                      <input name="perangkat" placeholder="Perangkat" className="w-full border p-2 rounded" value={formData.perangkat || ''} onChange={handleChange} />
                      <input name="link" placeholder="Link Bukti" className="w-full border p-2 rounded" value={formData.link || ''} onChange={handleChange} />
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Batal</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Simpan</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
