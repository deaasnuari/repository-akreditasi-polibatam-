const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ===== LOGIN =====
export const loginUser = async (email: string, password: string, role: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.msg || 'Login gagal');

    // Simpan token & user ke localStorage
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Terjadi kesalahan saat login');
  }
};

// ===== REGISTER =====
export const registerUser = async (
  username: string,
  email: string,
  password: string,
  role: string
) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.msg || 'Registrasi gagal');

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Terjadi kesalahan saat registrasi');
  }
};

// ===== CEK AUTH =====
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// ===== GET USER =====
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// ===== LOGOUT =====
export const logout = async () => {
  try {
    // Panggil endpoint logout backend
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
  } catch (error) {
    console.warn('Logout API gagal, lanjut hapus token di sisi klien.');
  } finally {
    // Hapus data lokal
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect ke halaman login
    window.location.href = '/login';
  }
};
