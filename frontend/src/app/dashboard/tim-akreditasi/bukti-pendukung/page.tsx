"use client";
import React, { useState } from "react";
import { Upload, CheckCircle, Clock, XCircle, Eye, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function BuktiPendukungPage() {
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previewData, setPreviewData] = useState<{
    content: string;
    title: string;
    type: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // ✅ tambahan untuk preview asli
  const [uploadData, setUploadData] = useState({
    judul: "",
    jenis: "",
    kategori: "Umum",
  });

  const [tableData, setTableData] = useState([
    {
      judul: "SK Pendirian Program Studi",
      jenis: "Surat Keputusan",
      kategori: "Umum",
      file: "SK_Pendirian_2023.pdf",
      size: "2.3 MB",
      tanggal: "2024-12-15",
      uploadBy: "TU Admin",
      status: "Diterima",
    },
    {
      judul: "Data Mahasiswa 2023",
      jenis: "Spreadsheet",
      kategori: "LKPS",
      file: "Data_Mahasiswa_2023.xlsx",
      size: "1.8 MB",
      tanggal: "2024-12-15",
      uploadBy: "TU Admin",
      status: "Menunggu",
    },
  ]);

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[#183A64]">Bukti Pendukung</h1>
          <p className="text-gray-600">Kelola dokumen bukti pendukung akreditasi</p>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#183A64] hover:bg-[#2A4F85] text-white px-4 py-2 rounded-lg shadow transition">
              <Upload size={18} />
              Upload Dokumen
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Dokumen Bukti Pendukung" : "Upload Dokumen Bukti Pendukung"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isEditMode && editIndex !== null) {
                  const updatedData = [...tableData];
                  updatedData[editIndex] = {
                    ...tableData[editIndex],
                    ...uploadData,
                    file: selectedFile ? selectedFile.name : tableData[editIndex].file,
                    size: selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                      : tableData[editIndex].size,
                  };
                  setTableData(updatedData);
                } else {
                  const newData = {
                    ...uploadData,
                    file: selectedFile ? selectedFile.name : "",
                    size: selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                      : "0 MB",
                    tanggal: new Date().toISOString().split("T")[0],
                    uploadBy: "TU Admin",
                    status: "Menunggu",
                  };
                  setTableData([...tableData, newData]);
                }

                setIsUploadOpen(false);
                setIsEditMode(false);
                setEditIndex(null);
                setUploadData({ judul: "", jenis: "", kategori: "Umum" });
                setSelectedFile(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2"
                  value={uploadData.judul}
                  onChange={(e) => setUploadData({ ...uploadData, judul: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jenis Dokumen</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2"
                  value={uploadData.jenis}
                  onChange={(e) => setUploadData({ ...uploadData, jenis: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={uploadData.kategori}
                  onChange={(e) => setUploadData({ ...uploadData, kategori: e.target.value })}
                  required
                >
                  <option value="Umum">Umum</option>
                  <option value="LKPS">LKPS</option>
                  <option value="LED">LED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File</label>
                <input
                  type="file"
                  className="w-full border rounded-md px-3 py-2"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setIsEditMode(false);
                    setEditIndex(null);
                    setUploadData({ judul: "", jenis: "", kategori: "Umum" });
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#183A64] text-white rounded-md hover:bg-[#2A4F85]"
                >
                  {isEditMode ? "Simpan" : "Upload"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Dokumen" value={tableData.length} />
        <StatCard
          title="Diterima"
          value={tableData.filter((item) => item.status === "Diterima").length}
          icon={<CheckCircle className="text-green-600" />}
        />
        <StatCard
          title="Menunggu"
          value={tableData.filter((item) => item.status === "Menunggu").length}
          icon={<Clock className="text-yellow-500" />}
        />
        <StatCard
          title="Perlu Revisi"
          value={tableData.filter((item) => item.status === "Perlu Revisi").length}
          icon={<XCircle className="text-red-500" />}
        />
      </div>

      {/* Filter */}
      <div className="bg-gray-100 rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-44"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Diterima">Diterima</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Kategori</label>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-44"
          >
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
              <th className="px-4 py-2 font-semibold">File</th>
              <th className="px-4 py-2 font-semibold">Tanggal Upload</th>
              <th className="px-4 py-2 font-semibold">Upload By</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tableData
              .filter((item) => {
                const statusMatch =
                  filterStatus === "Semua Status" || item.status === filterStatus;
                const kategoriMatch =
                  filterKategori === "Semua Kategori" || item.kategori === filterKategori;
                return statusMatch && kategoriMatch;
              })
              .map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{item.judul}</td>
                  <td className="px-4 py-2">{item.jenis}</td>
                  <td className="px-4 py-2">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-blue-600 underline cursor-pointer">
                    {item.file}{" "}
                    <span className="text-xs text-gray-400">({item.size})</span>
                  </td>
                  <td className="px-4 py-2">{item.tanggal}</td>
                  <td className="px-4 py-2">{item.uploadBy}</td>
                  <td className="px-4 py-2">
                    {item.status === "Diterima" && <CheckCircle className="text-green-600" size={18} />}
                    {item.status === "Menunggu" && <Clock className="text-yellow-500" size={18} />}
                    {item.status === "Perlu Revisi" && <XCircle className="text-red-500" size={18} />}
                  </td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    {/* ✅ bagian preview diperbarui */}
                    <button
                      title="Lihat"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        if (selectedFile && item.file === selectedFile.name) {
                          const fileUrl = URL.createObjectURL(selectedFile);
                          setPreviewUrl(fileUrl);
                          setPreviewData({
                            content: "",
                            title: item.judul,
                            type: item.file.split(".").pop()?.toLowerCase() || "",
                          });
                          setIsPreviewOpen(true);
                        } else {
                          const fileExtension = item.file.split(".").pop()?.toLowerCase();
                          let dummyContent = "";
                          if (fileExtension === "pdf") dummyContent = `Simulasi isi PDF untuk ${item.judul}`;
                          else if (fileExtension === "xlsx") dummyContent = `Data spreadsheet untuk ${item.judul}`;
                          setPreviewData({
                            content: dummyContent,
                            title: item.judul,
                            type: fileExtension || "",
                          });
                          setPreviewUrl(null);
                          setIsPreviewOpen(true);
                        }
                      }}
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      title="Edit"
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => {
                        setUploadData({
                          judul: item.judul,
                          jenis: item.jenis,
                          kategori: item.kategori,
                        });
                        setEditIndex(index);
                        setIsEditMode(true);
                        setIsUploadOpen(true);
                      }}
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Dialog Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              width="100%"
              height="100%"
              className="w-full h-[90vh]"
              title={previewData?.title || "Preview File"}
            ></iframe>
          ) : (
            <div className="h-[80vh] flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">
                {previewData?.content || "Preview tidak tersedia untuk jenis file ini"}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* === KOMPONEN === */
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
