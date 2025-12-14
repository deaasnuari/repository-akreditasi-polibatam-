"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, CheckCircle, Clock, XCircle, Eye, Edit2, FileText, Link2 } from "lucide-react";
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

// Bagian per modul yang tersedia (per-bagian, bukan global)
const BAGIAN_OPTIONS: { label: string; value: string; kategori: "LKPS" | "LED" | "Umum" }[] = [
  { label: "Akuntabilitas", value: "akuntabilitas", kategori: "LKPS" },
  { label: "Relevansi Pendidikan", value: "relevansiPendidikan", kategori: "LKPS" },
  { label: "Relevansi Penelitian", value: "relevansiPenelitian", kategori: "LKPS" },
  { label: "Relevansi PKM", value: "relevansiPkm", kategori: "LKPS" },
  { label: "Budaya Mutu", value: "budayaMutu", kategori: "LED" },
  { label: "Diferensiasi Misi", value: "diferensiasiMisi", kategori: "LED" },
];

export default function BuktiPendukungPage() {
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");
  const [filterBagian, setFilterBagian] = useState<string | "Semua">("Semua");
  const [filterItemId, setFilterItemId] = useState<string | "Semua">("Semua");

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // State upload/tautan bukti
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({ judul: "", jenis: "Dokumen", kategori: "Umum" as "Umum" | "LKPS" | "LED" });
  const [selectedBagian, setSelectedBagian] = useState<string>("");
  const [availableItems, setAvailableItems] = useState<{ id: string | number; nama: string }[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | number | "">("");

  // Data file upload lokal (placeholder) dan data borang dari API
  const [fileData, setFileData] = useState<TableItem[]>([]);
  const [borangData, setBorangData] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data draft borang (tidak diubah, hanya tampilkan dan lanjutkan)
  useEffect(() => {
    const loadBorangData = async () => {
      setLoading(true);
      try {
        const data: BorangItem[] = await fetchData("bukti-pendukung");
        const transformedData: TableItem[] = data.map((item) => {
          let kategori = "LKPS";
          try {
            const p = String(item.path || "").toLowerCase();
            if (p.includes("/led") || p.includes("led?") || p.includes("/dashboard/tim-akreditasi/led")) {
              kategori = "LED";
            } else if (p.includes("/lkps") || p.includes("lkps?") || p.includes("/dashboard/tim-akreditasi/lkps")) {
              kategori = "LKPS";
            } else {
              const n = String(item.nama || "").toLowerCase();
              if (n.includes("led")) kategori = "LED";
            }
          } catch (e) {}

          return {
            id: item.id,
            judul: item.nama,
            jenis: "Isian Borang",
            kategori,
            file: item.path,
            tanggal: new Date(item.updatedAt).toISOString().split("T")[0],
            status: item.status,
            isBorang: true,
            path: item.path,
            uploadBy: "Tim Akreditasi",
            size: "-",
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
  }, []);

  // Fetch daftar item untuk bagian terpilih (per-bagian, bukan global)
  useEffect(() => {
    const fetchItemsForBagian = async () => {
      if (!selectedBagian) {
        setAvailableItems([]);
        setSelectedItemId("");
        return;
      }
      try {
        // Panggil endpoint spesifik berdasarkan bagian.
        // Kita gunakan fetchData(serviceName) yang sudah ada sebagai proxy ke backend.
        // Harap backend sudah sedia: GET /api/{bagian}/items atau yang sepadan.
        // Jika struktur berbeda, sesuaikan mapping di sini.
        const items: any[] = await fetchData(`${selectedBagian}/items`);
        const mapped = items.map((it: any) => ({ id: it.id ?? it.itemId ?? it.uuid ?? String(it.id), nama: it.nama ?? it.title ?? it.name ?? `Item ${it.id}` }));
        setAvailableItems(mapped);
      } catch (e) {
        console.error("Gagal memuat item bagian:", selectedBagian, e);
        setAvailableItems([]);
      }
    };
    fetchItemsForBagian();
  }, [selectedBagian]);

  // Gabungkan data borang dari API dan data file lokal (bukti)
  const combinedData = [...borangData, ...fileData];

  // Handler upload bukti + tautkan ke item per-bagian (tanpa menyentuh data draft)
  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      // Upload file ke backend (gunakan endpoint uploadRoutes yang sudah ada bila tersedia)
      // Di sini, sebagai placeholder, kita hanya menyimpan ke state lokal agar UI dapat diuji tanpa mengubah backend.
      const now = new Date();
      const newItem: TableItem = {
        id: `local-${now.getTime()}`,
        judul: uploadData.judul || selectedFile.name,
        jenis: uploadData.jenis || "Dokumen",
        kategori: uploadData.kategori,
        file: selectedFile.name,
        tanggal: now.toISOString().split("T")[0],
        status: "Draft",
        uploadBy: "Anda",
        bagian: selectedBagian || undefined,
        itemId: selectedItemId || undefined,
      };
      setFileData((prev) => [newItem, ...prev]);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setSelectedBagian("");
      setSelectedItemId("");
      setUploadData({ judul: "", jenis: "Dokumen", kategori: "Umum" });
    } catch (e) {
      console.error("Gagal upload bukti:", e);
    }
  };

  // Filter gabungan termasuk filter per-bagian dan per-item
  const filteredData = combinedData.filter((item) => {
    const statusOk = filterStatus === "Semua Status" || item.status === filterStatus;
    const kategoriOk = filterKategori === "Semua Kategori" || item.kategori === filterKategori;
    const bagianOk = filterBagian === "Semua" || item.bagian === filterBagian || item.isBorang; // item borang tetap tampil
    const itemOk = filterItemId === "Semua" || `${item.itemId ?? ""}` === `${filterItemId}` || item.isBorang; // item borang tetap tampil
    return statusOk && kategoriOk && bagianOk && itemOk;
  });

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[#183A64]">Bukti Pendukung</h1>
          <p className="text-gray-600">Kelola bukti pendukung dan lanjutkan isian borang. Pengaitan bukti dilakukan per-bagian tanpa mengubah draft LKPS.</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#183A64] hover:bg-[#2A4F85] text-white px-4 py-2 rounded-lg shadow transition">
              <Upload size={18} />
              Upload / Tautkan Bukti
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload / Tautkan Bukti</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Metadata dasar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Judul</label>
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
                  <label className="block text-sm font-medium text-gray-700">File</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  />
                </div>
              </div>

              {/* Pilih Bagian (per modul) dan Item */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bagian</label>
                  <select
                    value={selectedBagian}
                    onChange={(e) => setSelectedBagian(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  >
                    <option value="">Pilih Bagian</option>
                    {BAGIAN_OPTIONS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item pada Bagian</label>
                  <select
                    value={selectedItemId as any}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    disabled={!selectedBagian}
                  >
                    <option value="">Pilih Item</option>
                    {availableItems.map((it) => (
                      <option key={it.id} value={it.id as any}>
                        {it.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-sm border rounded-md"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className="px-4 py-2 text-sm bg-[#183A64] text-white rounded-md disabled:opacity-50 flex items-center gap-2"
                >
                  <Link2 size={16} /> Simpan & Tautkan
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
      <div className="bg-gray-100 rounded-xl p-4 grid grid-cols-5 gap-4 items-end">
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Bagian</label>
          <select value={filterBagian} onChange={(e) => setFilterBagian(e.target.value as any)} className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full">
            <option value="Semua">Semua</option>
            {BAGIAN_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Item</label>
          <input
            placeholder="Filter Item Id (opsional)"
            value={filterItemId as any}
            onChange={(e) => setFilterItemId((e.target.value || "Semua") as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
          />
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
                <td className="px-4 py-2 text-blue-600 underline cursor-pointer">
                  {item.isBorang ? item.path : item.file} {item.size && <span className="text-xs text-gray-400">({item.size})</span>}
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
                    <a href={item.path || ""} className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700">
                      Lanjutkan
                    </a>
                  ) : (
                    <>
                      <button title="Lihat" className="text-blue-600 hover:text-blue-800">
                        <Eye size={18} />
                      </button>
                      <button title="Edit" className="text-gray-600 hover:text-gray-800">
                        <Edit2 size={18} />
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
