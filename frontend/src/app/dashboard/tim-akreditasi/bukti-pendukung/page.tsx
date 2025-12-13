"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, CheckCircle, Clock, XCircle, Eye, Edit2, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchData } from "@/services/api";

// Tipe data untuk item yang di-fetch dari backend
interface BorangItem {
  id: number;
  nama: string;
  path: string;
  status: string;
  updatedAt: string;
}

// Tipe data gabungan untuk tabel
interface TableItem {
  judul: string;
  jenis: string;
  kategori: string;
  file: string;
  size?: string;
  tanggal: string;
  uploadBy?: string;
  status: string;
  isBorang?: boolean; // Flag untuk membedakan
  path?: string; // Path untuk navigasi borang
}

export default function BuktiPendukungPage() {
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewData, setPreviewData] = useState<{ content: string; title: string; type: string; } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState({ judul: "", jenis: "", kategori: "Umum" });

  // Data file upload lokal (sebagai placeholder)
  const [fileData, setFileData] = useState<TableItem[]>([]);

  // State baru untuk menyimpan data borang dari API
  const [borangData, setBorangData] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data borang dari API saat komponen dimuat
  useEffect(() => {
    const loadBorangData = async () => {
      setLoading(true);
      try {
        const data: BorangItem[] = await fetchData('bukti-pendukung');
        const transformedData: TableItem[] = data.map(item => {
          // Determine kategori by path heuristics: if path references LED -> LED, else LKPS
          let kategori = 'LKPS';
          try {
            const p = String(item.path || '').toLowerCase();
            if (p.includes('/led') || p.includes('led?') || p.includes('/dashboard/tim-akreditasi/led')) {
              kategori = 'LED';
            } else if (p.includes('/lkps') || p.includes('lkps?') || p.includes('/dashboard/tim-akreditasi/lkps')) {
              kategori = 'LKPS';
            } else {
              // fallback: if neither, try to infer from name
              const n = String(item.nama || '').toLowerCase();
              if (n.includes('led')) kategori = 'LED';
            }
          } catch (e) {}

          return {
            judul: item.nama,
            jenis: 'Isian Borang',
            kategori,
            file: item.path, // Simpan path di sini untuk kolom file
            tanggal: new Date(item.updatedAt).toISOString().split('T')[0],
            status: item.status,
            isBorang: true, // Flag penting untuk membedakan
            path: item.path,
            uploadBy: 'Tim Akreditasi', // Placeholder
            size: '-'
          };
        });
        setBorangData(transformedData);
      } catch (error) {
        console.error("Gagal memuat data borang:", error);
        // Di sini Anda bisa menambahkan state untuk menampilkan pesan error di UI
      } finally {
        setLoading(false);
      }
    };
    loadBorangData();
  }, []);

  // Gabungkan data borang dari API dan data file lokal
  const combinedData = [...borangData, ...fileData];

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[#183A64]">Bukti Pendukung</h1>
          <p className="text-gray-600">Kelola dokumen dan status pengisian borang akreditasi</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#183A64] hover:bg-[#2A4F85] text-white px-4 py-2 rounded-lg shadow transition">
              <Upload size={18} />
              Upload Dokumen
            </button>
          </DialogTrigger>
          <DialogContent>
            {/* Form Dialog untuk upload/edit file. Logikanya tetap sama, tapi hanya akan memanipulasi `fileData` */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistik (disesuaikan untuk combinedData) */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Item" value={combinedData.length} />
        <StatCard title="Diterima" value={combinedData.filter((i) => i.status === "Diterima").length} icon={<CheckCircle className="text-green-600" />} />
        <StatCard title="Menunggu" value={combinedData.filter((i) => i.status === "Menunggu").length} icon={<Clock className="text-yellow-500" />} />
        <StatCard title="Draft" value={combinedData.filter((i) => i.status === "Draft").length} icon={<FileText className="text-blue-500" />} />
      </div>

      {/* Filter */}
      <div className="bg-gray-100 rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-44">
            <option value="Semua Status">Semua Status</option>
            <option value="Diterima">Diterima</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Draft">Draft</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Kategori</label>
          <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-44">
            <option value="Semua Kategori">Semua Kategori</option>
            <option value="Umum">Umum</option>
            <option value="LKPS">LKPS</option>
            <option value="LED">LED</option>
          </select>
        </div>
      </div>

      {/* Tabel Dokumen */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="px-4 py-2 font-semibold">Judul Dokumen</th>
              <th className="px-4 py-2 font-semibold">Jenis</th>
              <th className="px-4 py-2 font-semibold">Kategori</th>
              <th className="px-4 py-2 font-semibold">File / Path</th>
              <th className="px-4 py-2 font-semibold">Tanggal</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center p-6 text-gray-500">Memuat data borang...</td></tr>}
            {!loading && combinedData
              .filter(item => (filterStatus === "Semua Status" || item.status === filterStatus) && (filterKategori === "Semua Kategori" || item.kategori === filterKategori))
              .map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{item.judul}</td>
                  <td className="px-4 py-2">{item.jenis}</td>
                  <td className="px-4 py-2"><span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{item.kategori}</span></td>
                  <td className="px-4 py-2 text-blue-600 underline cursor-pointer">{item.isBorang ? item.path : item.file} {item.size && <span className="text-xs text-gray-400">({item.size})</span>}</td>
                  <td className="px-4 py-2">{item.tanggal}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit
                      ${item.status === 'Diterima' ? 'bg-green-100 text-green-800' : ''}
                      ${item.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${item.status === 'Draft' ? 'bg-blue-100 text-blue-800' : ''}
                      ${item.status === 'Perlu Revisi' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {item.status === 'Diterima' && <CheckCircle size={14} />}
                      {item.status === 'Menunggu' && <Clock size={14} />}
                      {item.status === 'Draft' && <FileText size={14} />}
                      {item.status === 'Perlu Revisi' && <XCircle size={14} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2 justify-center items-center">
                    {item.isBorang ? (
                      <Link href={item.path || ''} className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700">
                        Lanjutkan
                      </Link>
                    ) : (
                      <>
                        <button title="Lihat" className="text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
                        <button title="Edit" className="text-gray-600 hover:text-gray-800"><Edit2 size={18} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      
      {/* Dialog Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        {/* ... */}
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span>{icon}</span>}
        <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-[#183A64]">{value}</p>
    </div>
  );
}
