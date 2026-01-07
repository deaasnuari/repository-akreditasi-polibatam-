"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, Eye, Edit2, FileText, Link2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchData } from "@/services/api";

// Tipe data untuk item borang (draft) yang diambil dari backend (tetap dipertahankan)
interface BorangItem {
  id: number;
  nama: string;
  path: string;
  status: string;
  updatedAt: string;
}

// Tipe data gabungan untuk tabel
interface TableItem {
  id?: string | number;
  judul: string;
  jenis: string;
  kategori: string; // Umum | LKPS | LED
  file: string; // path atau url file
  size?: string;
  tanggal: string;
  uploadBy?: string;
  status: string;
  isBorang?: boolean; // Flag membedakan draft borang
  path?: string; // Path untuk navigasi borang
  bagian?: string; // bagian per modul LKPS
  itemId?: string | number; // id item per modul
}

export default function BuktiPendukungPage() {
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");
  const [searchQuery, setSearchQuery] = useState("");

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; path: string; judul: string; isViewMode: boolean }>({ open: false, path: '', judul: '', isViewMode: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: TableItem | null }>({ open: false, item: null });
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<TableItem | null>(null);

  // LocalStorage key
  const STORAGE_KEY = "bukti_pendukung_uploads";

  // Save to localStorage
  const saveToLocalStorage = (data: TableItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Gagal menyimpan ke localStorage:", e);
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = (): TableItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Gagal memuat dari localStorage:", e);
      return [];
    }
  };

  // State upload/tautan bukti
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadData, setUploadData] = useState({ judul: "", jenis: "Dokumen", kategori: "Umum" as "Umum" | "LKPS" | "LED" });

  // Data file upload lokal (placeholder) dan data borang dari API
  const [fileData, setFileData] = useState<TableItem[]>([]);
  const [borangData, setBorangData] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk handle lanjutkan dengan modal konfirmasi
  const handleLanjutkan = (item: TableItem) => {
    setConfirmModal({
      open: true,
      path: item.path || '',
      judul: item.judul,
      isViewMode: false
    });
  };

  // Fungsi untuk handle lihat (view-only mode)
  const handleLihat = (item: TableItem) => {
    setConfirmModal({
      open: true,
      path: item.path || '',
      judul: item.judul,
      isViewMode: true
    });
  };

  const confirmLanjutkan = () => {
    if (confirmModal.path) {
      window.location.href = confirmModal.path;
    }
    setConfirmModal({ open: false, path: '', judul: '', isViewMode: false });
  };

  // Ambil data draft borang (tidak diubah, hanya tampilkan dan lanjutkan)
  useEffect(() => {
    const loadBorangData = async () => {
      setLoading(true);
      try {
        const data: BorangItem[] = await fetchData("bukti-pendukung");
        const transformedData: TableItem[] = data.map((item) => {
          let kategori = "LKPS";
          let bagian = "";
          
          try {
            const p = String(item.path || "").toLowerCase();
            const n = String(item.nama || "").toLowerCase();
            
            // Deteksi kategori
            if (p.includes("/led") || p.includes("led?") || p.includes("/dashboard/tim-akreditasi/led")) {
              kategori = "LED";
            } else if (p.includes("/lkps") || p.includes("lkps?") || p.includes("/dashboard/tim-akreditasi/lkps")) {
              kategori = "LKPS";
            } else {
              if (n.includes("led")) kategori = "LED";
            }

            // Deteksi bagian berdasarkan path atau nama
            if (n.includes("akuntabilitas") || p.includes("akuntabilitas")) {
              bagian = "akuntabilitas";
            } else if (n.includes("relevansi pendidikan") || p.includes("relevansi-pendidikan")) {
              bagian = "relevansiPendidikan";
            } else if (n.includes("relevansi penelitian") || p.includes("relevansi-penelitian")) {
              bagian = "relevansiPenelitian";
            } else if (n.includes("relevansi pkm") || p.includes("relevansi-pkm")) {
              bagian = "relevansiPkm";
            } else if (n.includes("budaya mutu") || p.includes("/lkps") && !p.includes("relevansi") && !p.includes("akuntabilitas") && !p.includes("diferensiasi")) {
              bagian = "budayaMutu";
            } else if (n.includes("diferensiasi misi") || p.includes("diferensiasi-misi")) {
              bagian = "diferensiasiMisi";
            }
          } catch (e) {}

          // Map status dari database ke UI
          let displayStatus = item.status;
          if (item.status === 'Submitted') {
            displayStatus = 'Menunggu';
          } else if (item.status === 'Approved') {
            displayStatus = 'Diterima';
          } else if (item.status === 'NeedsRevision') {
            displayStatus = 'Perlu Revisi';
          } else if (item.status === 'Completed') {
            // Completed seharusnya dianggap sebagai Diterima untuk Tim Akreditasi
            displayStatus = 'Diterima';
          }

          return {
            id: item.id,
            judul: item.nama,
            jenis: "Isian Borang",
            kategori,
            file: item.path,
            tanggal: new Date(item.updatedAt).toISOString().split("T")[0],
            status: displayStatus,
            isBorang: true,
            path: item.path,
            uploadBy: "Tim Akreditasi",
            size: "-",
            bagian: bagian || undefined,
          };
        });
        setBorangData(transformedData);
      } catch (error) {
        console.error("Gagal memuat data borang:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBorangData();
    
    // Load uploaded files from localStorage
    const storedUploads = loadFromLocalStorage();
    if (storedUploads.length > 0) {
      setFileData(storedUploads);
    }
  }, []);

  // Gabungkan data borang dari API dan data file lokal (bukti)
  const combinedData = [...borangData, ...fileData];

  // Fungsi untuk export LED ke PDF
  // Handler upload bukti + tautkan ke item per-bagian (tanpa menyentuh data draft)
  const handleUpload = async () => {
    try {
      if (!linkUrl.trim()) {
        alert("Masukkan URL link terlebih dahulu");
        return;
      }
      if (!uploadData.judul.trim()) {
        alert("Judul tidak boleh kosong");
        return;
      }

      const now = new Date();
      const fileOrLink = linkUrl;
      
      const newItem: TableItem = {
        id: `local-${now.getTime()}`,
        judul: uploadData.judul,
        jenis: uploadData.jenis || "Dokumen",
        kategori: uploadData.kategori,
        file: fileOrLink,
        size: "-",
        tanggal: now.toISOString().split("T")[0],
        status: "Draft",
        uploadBy: "Anda",
      };
      const updatedData = [newItem, ...fileData];
      setFileData(updatedData);
      saveToLocalStorage(updatedData);
      setIsUploadOpen(false);
      setLinkUrl("");
      setUploadData({ judul: "", jenis: "Dokumen", kategori: "Umum" });
      setEditMode(false);
      setEditingItem(null);
    } catch (e) {
      console.error("Gagal upload bukti:", e);
    }
  };

  // Handler Edit
  const handleEdit = (item: TableItem) => {
    if (item.isBorang) {
      alert("Draft borang tidak dapat diedit di sini. Silakan lanjutkan isian untuk mengeditnya.");
      return;
    }
    
    setEditMode(true);
    setEditingItem(item);
    setUploadData({
      judul: item.judul,
      jenis: item.jenis,
      kategori: item.kategori as "Umum" | "LKPS" | "LED"
    });
    
    setLinkUrl(item.file);
    setIsUploadOpen(true);
  };

  // Handler Update (Save Edit)
  const handleUpdate = async () => {
    if (!editingItem) return;
    
    try {
      if (!linkUrl.trim()) {
        alert("Masukkan URL link terlebih dahulu");
        return;
      }
      if (!uploadData.judul.trim()) {
        alert("Judul tidak boleh kosong");
        return;
      }

      const updatedItem: TableItem = {
        ...editingItem,
        judul: uploadData.judul,
        jenis: uploadData.jenis || "Dokumen",
        kategori: uploadData.kategori,
        file: linkUrl,
        size: "-",
      };

      const updatedData = fileData.map(item => item.id === editingItem.id ? updatedItem : item);
      setFileData(updatedData);
      saveToLocalStorage(updatedData);
      setIsUploadOpen(false);
      setLinkUrl("");
      setUploadData({ judul: "", jenis: "Dokumen", kategori: "Umum" });
      setEditMode(false);
      setEditingItem(null);
    } catch (e) {
      console.error("Gagal update bukti:", e);
    }
  };

  // Handler Delete
  const handleDelete = (item: TableItem) => {
    if (item.isBorang) {
      alert("Draft borang tidak dapat dihapus di sini.");
      return;
    }
    setDeleteModal({ open: true, item });
  };

  const confirmDelete = () => {
    if (deleteModal.item) {
      const updatedData = fileData.filter(item => item.id !== deleteModal.item!.id);
      setFileData(updatedData);
      saveToLocalStorage(updatedData);
      setDeleteModal({ open: false, item: null });
    }
  };

  // Filter gabungan termasuk filter per-bagian, per-item, dan search
  const filteredData = combinedData.filter((item) => {
    const statusOk = filterStatus === "Semua Status" || item.status === filterStatus;
    const kategoriOk = filterKategori === "Semua Kategori" || item.kategori === filterKategori;
    
    // Search filter
    const searchOk = !searchQuery.trim() || 
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jenis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.file && item.file.toLowerCase().includes(searchQuery.toLowerCase()));

    return statusOk && kategoriOk && searchOk;
  });

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#183A64]">Bukti Pendukung</h1>
          <p className="text-gray-600">Kelola bukti pendukung dan lanjutkan isian borang. Pengaitan bukti dilakukan per-bagian tanpa mengubah draft LKPS.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#183A64] text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 hover:bg-[#ADE7F7] hover:text-[#183A64]">
              <Link2 size={18} />
              Tautkan Bukti
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tautkan Bukti Pendukung</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Metadata dasar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Judul <span className="text-red-500">*</span></label>
                  <input
                    value={uploadData.judul}
                    onChange={(e) => setUploadData((p) => ({ ...p, judul: e.target.value }))}
                    placeholder="Judul dokumen"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis</label>
                  <input
                    value={uploadData.jenis}
                    onChange={(e) => setUploadData((p) => ({ ...p, jenis: e.target.value }))}
                    placeholder="Jenis dokumen (mis. Pedoman, SK, dll.)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategori</label>
                  <select
                    value={uploadData.kategori}
                    onChange={(e) => setUploadData((p) => ({ ...p, kategori: e.target.value as any }))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  >
                    <option value="Umum">Umum</option>
                    <option value="LKPS">LKPS</option>
                    <option value="LED">LED</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL Link <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsUploadOpen(false);
                    setLinkUrl("");
                    setUploadData({ judul: "", jenis: "Dokumen", kategori: "Umum" });
                    setEditMode(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-sm border rounded-md transition-colors duration-200 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  onClick={editMode ? handleUpdate : handleUpload}
                  disabled={!linkUrl.trim() || !uploadData.judul.trim()}
                  className="px-4 py-2 text-sm bg-[#183A64] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200 hover:bg-[#ADE7F7] hover:text-[#183A64]"
                >
                  <Link2 size={16} /> 
                  {editMode ? "Update Link" : "Simpan Link"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, item: null })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus bukti pendukung <strong>{deleteModal.item?.judul}</strong>?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteModal({ open: false, item: null })}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md transition-colors duration-200 hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard title="Total Item" value={combinedData.length} />
        <StatCard title="Diterima" value={combinedData.filter((i) => i.status === "Diterima").length} icon={<CheckCircle className="text-green-600" />} />
        <StatCard title="Menunggu" value={combinedData.filter((i) => i.status === "Menunggu").length} icon={<Clock className="text-yellow-500" />} />
        <StatCard title="Draft" value={combinedData.filter((i) => i.status === "Draft").length} icon={<FileText className="text-blue-500" />} />
        <StatCard title="Perlu Revisi" value={combinedData.filter((i) => i.status === "Perlu Revisi").length} icon={<XCircle className="text-red-500" />} />
      </div>

      {/* Filter tambahan per-bagian dan per-item */}
      <div className="bg-gray-100 rounded-xl p-4 grid grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full">
            <option value="Semua Status">Semua Status</option>
            <option value="Diterima">Diterima</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Draft">Draft</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Kategori</label>
          <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full">
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
            {loading && (
              <tr>
                <td colSpan={9} className="text-center p-6 text-gray-500">
                  Memuat data borang...
                </td>
              </tr>
            )}
            {!loading && filteredData.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2">{item.judul}</td>
                <td className="px-4 py-2">{item.jenis}</td>
                <td className="px-4 py-2">
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{item.kategori}</span>
                </td>
                <td className="px-4 py-2">
                  {item.isBorang ? (
                    <span className="text-gray-700">{item.path}</span>
                  ) : item.file?.startsWith('http://') || item.file?.startsWith('https://') ? (
                    <a 
                      href={item.file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <Link2 size={14} />
                      {item.file.length > 50 ? item.file.substring(0, 50) + '...' : item.file}
                    </a>
                  ) : (
                    <span className="text-gray-700">
                      {item.file} {item.size && <span className="text-xs text-gray-400">({item.size})</span>}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit
                      ${item.status === "Diterima" ? "bg-green-100 text-green-800" : ""}
                      ${item.status === "Menunggu" ? "bg-yellow-100 text-yellow-800" : ""}
                      ${item.status === "Draft" ? "bg-blue-100 text-blue-800" : ""}
                      ${item.status === "Perlu Revisi" ? "bg-red-100 text-red-800" : ""}
                    `}
                  >
                    {item.status === "Diterima" && <CheckCircle size={14} />}
                    {item.status === "Menunggu" && <Clock size={14} />}
                    {item.status === "Draft" && <FileText size={14} />}
                    {item.status === "Perlu Revisi" && <XCircle size={14} />}
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2 justify-center items-center">
                  {item.isBorang ? (
                    // Logic untuk borang berdasarkan status
                    (item.status === "Diterima" || item.status === "Menunggu") ? (
                      <button 
                        onClick={() => handleLihat(item)}
                        className="bg-white border border-[#183A64] text-[#183A64] px-3 py-1 rounded-md text-xs transition-colors duration-200 hover:bg-[#ADE7F7] flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        Lihat
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleLanjutkan(item)}
                        className="bg-[#183A64] text-white px-3 py-1 rounded-md text-xs transition-colors duration-200 hover:bg-[#ADE7F7] hover:text-[#183A64] flex items-center gap-1.5"
                      >
                        <Edit2 size={14} />
                        Lanjutkan
                      </button>
                    )
                  ) : (
                    <>
                      <button title="Lihat" className="text-blue-600 hover:text-blue-800">
                        <Eye size={18} />
                      </button>
                      <button 
                        title="Edit" 
                        onClick={() => handleEdit(item)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        title="Hapus" 
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog Preview (placeholder, tidak diubah) */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600">Belum ada implementasi preview. Fokus perubahan: pengaitan per-bagian tanpa menyentuh draft LKPS.</div>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Lanjutkan/Lihat */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="p-4 border-b flex items-center gap-2">
              {confirmModal.isViewMode ? (
                <Eye className="text-blue-600" size={20} />
              ) : (
                <FileText className="text-blue-600" size={20} />
              )}
              <h3 className="font-semibold text-gray-800">
                {confirmModal.isViewMode ? 'Lihat Borang' : 'Konfirmasi Lanjutkan'}
              </h3>
            </div>
            <div className="p-4 text-sm text-gray-700">
              {confirmModal.isViewMode ? (
                <>
                  <p className="mb-2">Anda akan melihat borang dalam mode <span className="font-semibold text-blue-600">view-only</span>:</p>
                  <p className="font-semibold text-gray-900">{confirmModal.judul}</p>
                  <p className="mt-3 text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
                    💡 Dokumen ini {confirmModal.judul.includes('Diterima') ? 'sudah diterima' : 'sedang dalam review'}. Anda tidak dapat melakukan perubahan.
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-2">Apakah Anda yakin ingin melanjutkan pengisian borang:</p>
                  <p className="font-semibold text-gray-900">{confirmModal.judul}</p>
                </>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal({ open: false, path: '', judul: '', isViewMode: false })}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg transition-colors duration-200 hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={confirmLanjutkan}
                className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors duration-200 ${
                  confirmModal.isViewMode 
                    ? 'bg-white border border-[#183A64] text-[#183A64] hover:bg-[#ADE7F7]' 
                    : 'bg-[#183A64] text-white hover:bg-[#ADE7F7] hover:text-[#183A64]'
                }`}
              >
                {confirmModal.isViewMode ? (
                  <>
                    <Eye size={16} />
                    Lihat Borang
                  </>
                ) : (
                  'Ya, Lanjutkan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
