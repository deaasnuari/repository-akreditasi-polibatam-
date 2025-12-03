"use client";
import { useState } from "react";
import { FileText, Clock, User, Filter, CheckCircle, XCircle, Eye } from "lucide-react";

export default function PendingReviewPage() {
  const [filter, setFilter] = useState("all"); // all, lkps, led

  // Data dummy pending documents
  const pendingDocs = [
    {
      id: 1,
      type: "LKPS",
      title: "LKPS - Data Mahasiswa 2024",
      uploader: "Dr. Ahmad Fauzi",
      uploadDate: "2024-12-01",
      category: "Kriteria 3",
      status: "pending"
    },
    {
      id: 2,
      type: "LED",
      title: "LED - Evaluasi Diri Program Studi",
      uploader: "Prof. Siti Nurhaliza",
      uploadDate: "2024-12-02",
      category: "Dokumen Utama",
      status: "pending"
    },
    {
      id: 3,
      type: "LKPS",
      title: "LKPS - Logbook Mahasiswa",
      uploader: "Dr. Budi Santoso",
      uploadDate: "2024-12-02",
      category: "Kriteria 5",
      status: "pending"
    },
    {
      id: 4,
      type: "LED",
      title: "LED - Dokumen Pendukung Kurikulum",
      uploader: "Dr. Lisa Permata",
      uploadDate: "2024-12-03",
      category: "Kriteria 2",
      status: "pending"
    },
    {
      id: 5,
      type: "LKPS",
      title: "LKPS - Data Dosen dan Tendik",
      uploader: "Dr. Ahmad Fauzi",
      uploadDate: "2024-12-03",
      category: "Kriteria 4",
      status: "pending"
    },
    {
      id: 6,
      type: "LKPS",
      title: "LKPS - Penelitian dan PkM",
      uploader: "Prof. Rahmat Hidayat",
      uploadDate: "2024-12-04",
      category: "Kriteria 6",
      status: "pending"
    },
    {
      id: 7,
      type: "LED",
      title: "LED - Analisis SWOT Program Studi",
      uploader: "Dr. Maya Sari",
      uploadDate: "2024-12-04",
      category: "Kriteria 1",
      status: "pending"
    },
    {
      id: 8,
      type: "LKPS",
      title: "LKPS - Sarana Prasarana",
      uploader: "Dr. Budi Santoso",
      uploadDate: "2024-12-05",
      category: "Kriteria 7",
      status: "pending"
    }
  ];

  // Filter documents
  const filteredDocs = pendingDocs.filter(doc => {
    if (filter === "all") return true;
    return doc.type.toLowerCase() === filter;
  });

  // Count by type
  const lkpsCount = pendingDocs.filter(d => d.type === "LKPS").length;
  const ledCount = pendingDocs.filter(d => d.type === "LED").length;

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* === Header === */}
      <div>
        <h1 className="text-2xl font-semibold text-[#183A64]">Pending Reviews</h1>
        <p className="text-gray-600">
          Dokumen yang menunggu review dan validasi dari P4M
        </p>
      </div>

      {/* === Summary Cards === */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          title="Total Pending"
          value={pendingDocs.length}
          color="bg-orange-500"
          icon={<Clock size={20} />}
        />
        <SummaryCard
          title="LKPS Pending"
          value={lkpsCount}
          color="bg-[#6C63FF]"
          icon={<FileText size={20} />}
        />
        <SummaryCard
          title="LED Pending"
          value={ledCount}
          color="bg-green-500"
          icon={<FileText size={20} />}
        />
      </div>

      {/* === Filter Buttons === */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === "all"
              ? "bg-[#183A64] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Filter size={16} className="inline mr-2" />
          Semua ({pendingDocs.length})
        </button>
        <button
          onClick={() => setFilter("lkps")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === "lkps"
              ? "bg-[#6C63FF] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          LKPS ({lkpsCount})
        </button>
        <button
          onClick={() => setFilter("led")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === "led"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          LED ({ledCount})
        </button>
      </div>

      {/* === Document List === */}
      <div className="bg-white rounded-xl shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Dokumen
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Uploader
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal Upload
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        doc.type === "LKPS" ? "bg-[#6C63FF]" : "bg-green-500"
                      }`}
                    >
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-400" />
                      <span className="font-medium text-gray-800">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{doc.uploader}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{doc.uploadDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => alert(`Review dokumen: ${doc.title}`)}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Review Dokumen"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => alert(`Approve: ${doc.title}`)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => alert(`Reject: ${doc.title}`)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Tidak ada dokumen pending untuk filter ini</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* === Components === */
function SummaryCard({ title, value, color, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-2 rounded-full text-white ${color}`}>{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-[#183A64]">{value}</h3>
    </div>
  );
}