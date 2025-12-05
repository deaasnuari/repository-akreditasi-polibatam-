'use client';

import React, { useState, useEffect } from 'react';
import { relevansiPenelitianService, SubTab, DataItem } from '@/services/relevansiPenelitianService';
import { useRouter } from 'next/navigation'; // Using next/navigation for router actions

// --- Local definition of subtabFields for dynamic table headers ---
const subtabFields = {
  'sarana-prasarana': [
    { key: 'namaPrasarana', label: 'Nama Prasarana' },
    { key: 'dayaTampung', label: 'Daya Tampung' },
    { key: 'luasRuang', label: 'Luas Ruang (m²)' },
    { key: 'status', label: 'Milik sendiri (M)/Sewa (W)' },
    { key: 'lisensi', label: 'Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)' },
    { key: 'perangkat', label: 'Perangkat' },
    { key: 'linkBukti', label: 'Link Bukti' },
  ],
  'hibah-dan-pembiayaan': [
    { key: 'no', label: 'No' },
    { key: 'namadtpr', label: 'Nama DTPR (Ketua)' },
    { key: 'judulpenelitian', label: 'Judul Penelitian' },
    { key: 'jumlahmahasiswa', label: 'Jumlah Mahasiswa yang Terlibat' },
    { key: 'jenishibah', label: 'Jenis Hibah Penelitian' },
    { key: 'sumber', label: 'Sumber L/N/I' },
    { key: 'durasi', label: 'Durasi (tahun)' },
    { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp juta)' },
    { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp juta)' },
    { key: 'pendanaants', label: 'Pendanaan TS (Rp juta)' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
  'pengembangan-dtpr': [
    { key: 'namaDTPR', label: 'Nama DTPR' },
    { key: 'jenisPengembangan', label: 'Jenis Pengembangan DTPR' },
    { key: 'tahunAkademik', label: 'Tahun Akademik' },
    { key: 'linkBukti', label: 'Link Bukti' },
  ],
  'kerjasama-penelitian': [
    { key: 'no', label: 'No' },
    { key: 'judulkerjasama', label: 'Judul Kerjasama' },
    { key: 'mitrakerjasama', label: 'Mitra Kerja Sama' },
    { key: 'sumber', label: 'Sumber L/N/I' },
    { key: 'durasi', label: 'Durasi (Tahun)' },
    { key: 'pendanaants2', label: 'Pendanaan TS-2 (Rp Juta)' },
    { key: 'pendanaants1', label: 'Pendanaan TS-1 (Rp Juta)' },
    { key: 'pendanaants', label: 'Pendanaan TS (Rp Juta)' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
  'publikasi-penelitian': [
    { key: 'no', label: 'No' },
    { key: 'namaDTPR', label: 'Nama DTPR' },
    { key: 'judulPublikasi', label: 'Judul Publikasi' },
    { key: 'jenisPublikasi', label: 'Jenis Publikasi (IB/I/S1,S2,S3,S4,T)' },
    { key: 'tahun', label: 'Tahun' },
    { key: 'linkBukti', label: 'Link Bukti' },
  ],
  'perolehan-hki': [
    { key: 'no', label: 'No' },
    { key: 'judul', label: 'Judul' },
    { key: 'jenishki', label: 'Jenis HKI' },
    { key: 'namadtpr', label: 'Nama DTPR' },
    { key: 'tahunts2', label: 'Tahun Perolehan TS-2' },
    { key: 'tahunts1', label: 'Tahun Perolehan TS-1' },
    { key: 'tahunts', label: 'Tahun Perolehan TS' },
    { key: 'linkbukti', label: 'Link Bukti' },
  ],
};
// --- End local definition ---


export default function RelevansiPenelitianPage() {
  const router = useRouter();
  const [selectedSubtab, setSelectedSubtab] = useState<SubTab>('sarana-prasarana');
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const availableSubtabs: { value: SubTab, label: string }[] = [
    { value: 'sarana-prasarana', label: 'Sarana dan Prasarana' },
    { value: 'hibah-dan-pembiayaan', label: 'Hibah dan Pembiayaan' },
    { value: 'pengembangan-dtpr', label: 'Pengembangan DTPR' },
    { value: 'kerjasama-penelitian', label: 'Kerjasama Penelitian' },
    { value: 'publikasi-penelitian', label: 'Publikasi Penelitian' },
    { value: 'perolehan-hki', label: 'Perolehan HKI' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await relevansiPenelitianService.fetchData(selectedSubtab);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil data.');
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSubtab]);

  const handleSubtabChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubtab(event.target.value as SubTab);
  };

  const currentFields = subtabFields[selectedSubtab];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relevansi Penelitian</h1>

      <div className="mb-4">
        <label htmlFor="subtab-select" className="block text-sm font-medium text-gray-700">
          Pilih Subtab:
        </label>
        <select
          id="subtab-select"
          name="subtab"
          value={selectedSubtab}
          onChange={handleSubtabChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {availableSubtabs.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Memuat data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prodi
                </th>
                {currentFields.map((field) => (
                  <th
                    key={field.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={currentFields.length + 3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Tidak ada data untuk subtab ini.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nama_user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.prodi}</td>
                    {currentFields.map((field) => (
                      <td key={field.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item[field.key as keyof DataItem]?.toString() || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
