"use client";
import { useState } from "react";
import { UserPlus, Shield, LogIn, FileSearch, Edit2, Trash2 } from "lucide-react";

export default function ManajemenAkun() {
  const [users] = useState([
    { id: 1, name: "Dr. Ahmad Sutanto", email: "ahmad.sutanto@polibatam.ac.id", role: "Tim Akreditasi", status: "Aktif", lastLogin: "2024-12-19 09:30" },
    { id: 2, name: "Drs. Budi Hartono", email: "budi.hartono@polibatam.ac.id", role: "Tim Akreditasi", status: "Menunggu", lastLogin: "Profil belum lengkap" },
    { id: 3, name: "Dr. Maya Sari", email: "maya.sari@polibatam.ac.id", role: "P4M", status: "Tidak Aktif", lastLogin: "2024-12-10 14:20" },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manajemen Akun</h1>
        <button className="bg-[#001B79] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800">
          <UserPlus size={18} /> Tambah User
        </button>
      </div>
      <p className="text-gray-600">Kelola akun Tim Akreditasi dan P4M</p>

      {/* Statistik */}
      <div className="grid grid-cols-5 gap-4">
        <StatBox label="Total Users" value="4" />
        <StatBox label="Aktif" value="2" />
        <StatBox label="Pending" value="1" />
        <StatBox label="Tim Akreditasi" value="2" icon={<Shield size={18} />} />
        <StatBox label="P4M" value="2" icon={<Shield size={18} />} />
      </div>

      {/* Daftar Users */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white shadow rounded-xl p-4">
          <h2 className="font-semibold mb-2">Daftar Users</h2>
          <div className="flex gap-2 mb-3">
            <select className="border rounded-md px-2 py-1 text-sm">
              <option>Semua Role</option>
            </select>
            <select className="border rounded-md px-2 py-1 text-sm">
              <option>Semua Status</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-2">User</th>
                <th className="py-2 px-2">Role</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Terakhir Login</th>
                <th className="py-2 px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${u.role === "P4M" ? "bg-yellow-100 text-yellow-800" : "bg-pink-100 text-pink-800"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        u.status === "Aktif"
                          ? "bg-green-100 text-green-700"
                          : u.status === "Menunggu"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2 px-2">{u.lastLogin}</td>
                  <td className="py-2 px-2 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800"><Edit2 size={16} /></button>
                    <button className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Log Aktivitas */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="font-semibold mb-2">Log Aktivitas</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Login</p>
              <p>Berhasil login ke sistem</p>
              <p className="text-xs text-gray-500">Dr. Ahmad Sutanto — 2024-12-19 09:30</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Review Dokumen</p>
              <p>Mereview dokumen LKPS – Data Mahasiswa</p>
              <p className="text-xs text-gray-500">Prof. Dr. Siti Rahmawati — 2024-12-18 14:20</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center justify-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600 flex items-center gap-1">
        {icon} {label}
      </div>
    </div>
  );
}
