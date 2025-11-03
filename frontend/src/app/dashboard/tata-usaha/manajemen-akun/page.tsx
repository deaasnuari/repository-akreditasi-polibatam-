"use client";
import { useState } from "react";
import { UserPlus, Shield, Edit2, Trash2, X } from "lucide-react";

export default function ManajemenAkun() {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [users, setUsers] = useState([
    { id: 1, name: "Dr. Ahmad Sutanto", email: "ahmad.sutanto@polibatam.ac.id", role: "Tim Akreditasi", status: "Aktif", lastLogin: "2024-12-19 09:30" },
    { id: 2, name: "Drs. Budi Hartono", email: "budi.hartono@polibatam.ac.id", role: "Tim Akreditasi", status: "Aktif", lastLogin: "Profil belum lengkap" },
    { id: 3, name: "Dr. Maya Sari", email: "maya.sari@polibatam.ac.id", role: "P4M", status: "Tidak Aktif", lastLogin: "2024-12-10 14:20" },
  ]);


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manajemen Akun</h1>
        <button 
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="bg-[#001B79] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800"
        >
          <UserPlus size={18} /> Tambah User
        </button>
      </div>
      <p className="text-gray-600">Kelola akun Tim Akreditasi dan P4M</p>

      {/* Statistik */}
      <div className="grid grid-cols-5 gap-4">
        <StatBox 
          label="Total Users" 
          value={users.length.toString()} 
        />
        <StatBox 
          label="Aktif" 
          value={users.filter(u => u.status === "Aktif").length.toString()} 
        />
          <StatBox 
            label="Tidak Aktif" 
            value={users.filter(u => u.status === "Tidak Aktif").length.toString()} 
          />
          <StatBox 
            label="Tim Akreditasi" 
            value={users.filter(u => u.role === "Tim Akreditasi").length.toString()} 
            icon={<Shield size={18} />} 
          />
        <StatBox 
          label="P4M" 
          value={users.filter(u => u.role === "P4M").length.toString()} 
          icon={<Shield size={18} />} 
        />
      </div>

      {/* Daftar Users */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="font-semibold mb-2">Daftar Users</h2>
          <div className="flex gap-2 mb-3">
            <select 
              className="border rounded-md px-2 py-1 text-sm"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">Semua Role</option>
              <option value="Tim Akreditasi">Tim Akreditasi</option>
              <option value="P4M">P4M</option>
            </select>
            <select 
              className="border rounded-md px-2 py-1 text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
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
              {users
                .filter(u => 
                  (selectedRole === "all" || u.role === selectedRole) &&
                  (selectedStatus === "all" || u.status === selectedStatus)
                )
                .map((u) => (
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
                      title={u.status}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2 px-2">{u.lastLogin}</td>
                  <td className="py-2 px-2 flex gap-2 items-center">
                    <button 
                      onClick={() => {
                        setEditingUser(u);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit User"
                    >
                      <Edit2 size={16} />
                    </button>
                    {/* only Edit and Delete remain per design */}
                    <button 
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
                          setUsers(users.filter(user => user.id !== u.id));
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Hapus User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Tambah/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Tambah User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newUser = {
                id: editingUser ? editingUser.id : users.length + 1,
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as string,
             status: editingUser ? (formData.get('status') as string) : 'Aktif',
                lastLogin: editingUser ? editingUser.lastLogin : '-'
              };

              if (editingUser) {
                setUsers(users.map(u => u.id === editingUser.id ? newUser : u));
              } else {
                setUsers([...users, newUser]);
              }
              setShowModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser?.name || ''}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser?.email || ''}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || 'Tim Akreditasi'}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Tim Akreditasi">Tim Akreditasi</option>
                    <option value="P4M">P4M</option>
                  </select>
                </div>
                  {editingUser && <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingUser?.status || 'Aktif'}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                  </div>}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
