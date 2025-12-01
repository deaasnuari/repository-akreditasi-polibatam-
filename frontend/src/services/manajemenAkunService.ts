const API_BASE = 'http://localhost:5000/api/manajemen-akun';

// ======================
// 🟦 GET ALL USERS
// ======================
export const fetchAllUsers = async () => {
  try {
    const res = await fetch(`${API_BASE}/`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

// ======================
// 🟦 GET USER BY ID
// ======================
export const fetchUserById = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/detail/${id}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// ======================
// 🟩 CREATE USER
// ======================
export const createUser = async (userData: {
  nama_lengkap: string;
  email: string;
  username: string;
  password: string;
  role: string; // TU, P4M, Tim Akreditasi
  status?: string;
  prodi?: string;
  no_identitas?: string;
  no_telp?: string;
  departemen?: string;
  jabatan?: string;
}) => {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal membuat pengguna' };
  }
};

// ======================
// 🟧 UPDATE USER
// ======================
export const updateUser = async (
  id: number,
  userData: {
    nama_lengkap?: string;
    email?: string;
    username?: string;
    password?: string;
    currentPassword?: string;
    role?: string;
    status?: string;
    prodi?: string;
    photo?: string;
    no_identitas?: string;
    no_telp?: string;
    departemen?: string;
    jabatan?: string;
  }
) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal update pengguna' };
  }
};

// ======================
// 🟥 DELETE USER
// ======================
export const deleteUser = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Gagal menghapus pengguna' };
  }
};

// ======================
// 🟦 GET BY ROLE
// ======================
export const fetchUsersByRole = async (role: string) => {
  try {
    const res = await fetch(`${API_BASE}/role/${role}`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

// ======================
// 🟦 GET BY STATUS
// ======================
export const fetchUsersByStatus = async (status: string) => {
  try {
    const res = await fetch(`${API_BASE}/status/${status}`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};
