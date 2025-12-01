"use client";
import { useState, useEffect } from "react";
import { UserPlus, Shield, Edit2, Trash2, X } from "lucide-react";
import { fetchAllUsers, createUser, deleteUser as apiDeleteUser, updateUser as apiUpdateUser } from '@/services/manajemenAkunService';

export default function ManajemenAkun() {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingRoleSelected, setEditingRoleSelected] = useState<string>('Tim Akreditasi');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingUsers(true);
      try {
        const data = await fetchAllUsers();
        if (!mounted) return;
        // map backend fields to UI-friendly names
        const mapped = (data || []).map((u: any) => ({
          id: u.id,
          nama_lengkap: u.nama_lengkap,
          email: u.email,
          username: u.username,
          prodi: u.prodi,
          photo: u.photo,
          role: u.role,
          status: u.status === 'aktif' ? 'Aktif' : u.status,
          created_at: u.created_at,
        }));
        setUsers(mapped);
      } catch (err) {
        console.error('fetch users failed', err);
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    })();
    // read current user id from sessionStorage if available
    try {
      if (typeof window !== 'undefined') {
        const u = sessionStorage.getItem('user');
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed && parsed.id) setCurrentUserId(parsed.id);
        }
      }
    } catch (err) {
      // ignore
    }
    return () => { mounted = false; };
  }, []);

  // determine whether the modal should show full editable fields
  // Rules:
  // - creating a new user -> show full fields
  // - editing a TU account -> show full fields ONLY if the TU account is the current logged-in user
  // - editing non-TU accounts -> do NOT show full fields (only role & status)
  const isEditingOwnAccount = !!(editingUser && currentUserId && editingUser.id === currentUserId);
  const showFullFields = !editingUser || (editingUser?.role === 'TU' && isEditingOwnAccount);


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manajemen Akun</h1>
        <button 
          onClick={() => {
            setEditingUser(null);
            setEditingRoleSelected('Tim Akreditasi');
            setShowModal(true);
          }}
          className="bg-[#001B79] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800"
        >
          <UserPlus size={18} /> Tambah User
        </button>
      </div>
      <p className="text-gray-600">Kelola akun Tim Akreditasi dan P4M</p>

      {/* Statistik */}
      <div className="grid grid-cols-6 gap-4">
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
        <StatBox 
          label="TU" 
          value={users.filter(u => u.role === "TU").length.toString()} 
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
              <option value="TU">TU</option>
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
                <th className="py-2 px-2">Prodi</th>
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
                    <div className="font-medium">{u.nama_lengkap || u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${u.role === "P4M" ? "bg-yellow-100 text-yellow-800" : "bg-pink-100 text-pink-800"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-2">{u.prodi || '-'}</td>
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
                  <td className="py-2 px-2">{u.lastLogin || (u.created_at ? new Date(u.created_at).toLocaleString() : '-')}</td>
                  <td className="py-2 px-2 flex gap-2 items-center">
                    <button 
                      onClick={() => {
                        setEditingUser(u);
                        setEditingRoleSelected(u.role || 'Tim Akreditasi');
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
                          // call backend
                          apiDeleteUser(u.id).then((res:any) => {
                            if (res.success) {
                              setUsers(users.filter(user => user.id !== u.id));
                            } else {
                              alert(res.message || 'Gagal menghapus user');
                            }
                          }).catch(() => alert('Gagal menghapus user'));
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
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Tambah User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nama_lengkap = formData.get('name') as string | null;
              const email = formData.get('email') as string | null;
              const prodi = formData.get('prodi') as string | null;
              const photo = formData.get('photo') as string | null;
              const role = (formData.get('role') as string) || editingRoleSelected;
              const status = editingUser ? (formData.get('status') as string) : 'aktif';
              const password = formData.get('password') as string | null;
              const currentPassword = formData.get('currentPassword') as string | null;
              const confirmPassword = formData.get('confirmPassword') as string | null;

              // determine whether to require full fields on submit
              // only require full fields if creating new user or original user was TU
              const submitShowFull = showFullFields;

              // validation per rules
              if (!editingUser) {
                if (!nama_lengkap || !email || !role || !password) {
                  alert('Nama, email, role dan password (untuk user baru) wajib diisi');
                  return;
                }
              } else if (submitShowFull) {
                if (!nama_lengkap || !email || !role) {
                  alert('Nama, email, dan role wajib diisi');
                  return;
                }
                // If editing own account and attempting to change password, validate current and confirm
                if (editingUser && isEditingOwnAccount && password) {
                  if (!currentPassword) {
                    alert('Masukkan password sekarang untuk mengganti password');
                    return;
                  }
                  if (!confirmPassword || confirmPassword !== password) {
                    alert('Konfirmasi password baru tidak cocok');
                    return;
                  }
                }
              } else {
                if (!role) {
                  alert('Role wajib diisi');
                  return;
                }
              }

              try {
                if (editingUser) {
                  // update user (password optional)
                  const statusNormalized = typeof status === 'string' ? status.toLowerCase() : status;
                  const payload: any = {
                    role,
                    status: statusNormalized,
                  };
                  if (submitShowFull) {
                    payload.nama_lengkap = nama_lengkap;
                    payload.email = email;
                    payload.prodi = prodi;
                    payload.photo = photo;
                    if (password) payload.password = password;
                    if (currentPassword) payload.currentPassword = currentPassword;
                  } else {
                    // For limited fields, include prodi if provided
                    if (prodi) payload.prodi = prodi;
                  }
                  const res = await apiUpdateUser(editingUser.id, payload);
                  if (res.success) {
                    const updated = res.data;
                    const mappedUpdated = {
                      id: updated.id,
                      nama_lengkap: updated.nama_lengkap,
                      email: updated.email,
                      username: updated.username,
                      prodi: updated.prodi,
                      photo: updated.photo,
                      role: updated.role,
                      status: updated.status === 'aktif' ? 'Aktif' : updated.status,
                      created_at: updated.created_at,
                    };
                    setUsers(users.map(u => u.id === editingUser.id ? mappedUpdated : u));
                    setShowModal(false);
                  } else {
                    alert(res.message || 'Gagal update user');
                  }
                } else {
                  // create user: derive username dari email local-part
                  const username = email.split('@')[0];
                  const res = await createUser({
                    nama_lengkap,
                    email,
                    username,
                    password,
                    prodi,
                    role,
                    status: status.toLowerCase()
                  });
                  if (res.success) {
                    const created = res.data;
                    const mappedCreated = {
                      id: created.id,
                      nama_lengkap: created.nama_lengkap,
                      email: created.email,
                      username: created.username,
                      prodi: created.prodi,
                      photo: created.photo,
                      role: created.role,
                      status: created.status === 'aktif' ? 'Aktif' : created.status,
                      created_at: created.created_at,
                    };
                    setUsers([...users, mappedCreated]);
                    setShowModal(false);
                  } else {
                    alert(res.message || 'Gagal membuat user');
                  }
                }
              } catch (err) {
                console.error(err);
                alert('Terjadi kesalahan');
              }
            }} autoComplete="off">
              {/* Hidden dummy fields to prevent browser autofill from populating real inputs */}
              <input type="text" name="__fake_user" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} />
              <input type="password" name="__fake_pass" autoComplete="current-password" style={{ display: 'none' }} tabIndex={-1} />
              <div className="space-y-2">
                {showFullFields ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        name="name"
                        required={true}
                        autoComplete="off"
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        required={true}
                        autoComplete="off"
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Program Studi</label>
                      <select
                        name="prodi"
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="">Pilih Program Studi</option>
                        <option value="Teknik Informatika">Teknik Informatika</option>
                        <option value="Teknologi Geomatika">Teknologi Geomatika</option>
                        <option value="Animasi">Animasi</option>
                        <option value="Teknologi Rekayasa Multimedia">Teknologi Rekayasa Multimedia</option>
                        <option value="Rekayasa Keamanan Siber">Rekayasa Keamanan Siber</option>
                        <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                        <option value="Teknologi Permainan">Teknologi Permainan</option>
                        <option value="Teknik Komputer / Rekayasa Komputer">Teknik Komputer / Rekayasa Komputer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Password {editingUser ? '(kosongkan jika tidak ingin mengganti)' : ''}</label>
                      <input
                        type="password"
                        name="password"
                         autoComplete="new-password"
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                        {...(editingUser ? {} : { required: true })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={editingRoleSelected}
                        onChange={(e) => setEditingRoleSelected(e.target.value)}
                        required
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="Tim Akreditasi">Tim Akreditasi</option>
                        <option value="P4M">P4M</option>
                        <option value="TU">TU</option>
                      </select>
                    </div>
                    {editingUser && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                          name="status"
                          required
                          className="w-full border rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="">Pilih Status</option>
                          <option value="Aktif">Aktif</option>
                          <option value="Tidak Aktif">Tidak Aktif</option>
                        </select>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={editingRoleSelected}
                        onChange={(e) => setEditingRoleSelected(e.target.value)}
                        required
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="Tim Akreditasi">Tim Akreditasi</option>
                        <option value="P4M">P4M</option>
                        <option value="TU">TU</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Program Studi</label>
                      <select
                        name="prodi"
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="">Pilih Program Studi</option>
                        <option value="Teknik Informatika">Teknik Informatika</option>
                        <option value="Teknologi Geomatika">Teknologi Geomatika</option>
                        <option value="Animasi">Animasi</option>
                        <option value="Teknologi Rekayasa Multimedia">Teknologi Rekayasa Multimedia</option>
                        <option value="Rekayasa Keamanan Siber">Rekayasa Keamanan Siber</option>
                        <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                        <option value="Teknologi Permainan">Teknologi Permainan</option>
                        <option value="Teknik Komputer / Rekayasa Komputer">Teknik Komputer / Rekayasa Komputer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        required
                        className="w-full border rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="">Pilih Status</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

function StatBox(props: { label: string; value: string; icon?: any }) {
  const { label, value, icon } = props;
  return (
    <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center justify-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600 flex items-center gap-1">
        {icon} {label}
      </div>
    </div>
  );
}
