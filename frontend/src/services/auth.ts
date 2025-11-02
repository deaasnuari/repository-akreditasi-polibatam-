const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  username: string;
  role: string;
}
// ===== Helper function =====
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'tim-akreditasi': 'Tim Akreditasi',
    'p4m': 'P4M',
    'tu': 'Tata Usaha',
  };
  return roleMap[role] || role;
};

// ===== REGISTER =====
export const registerUser = async (
  username: string,
  email: string,
  password: string,
  role: string
) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // supaya cookie tersimpan
      body: JSON.stringify({ username, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Registrasi gagal.');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Registrasi gagal.');
  }
};

// ===== LOGIN =====
export const loginUser = async (
  email: string,
  password: string,
  role: string
) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // supaya cookie tersimpan
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Login gagal.');
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Login gagal.');
  }
};

// ===== GET CURRENT USER =====
export const getCurrentUser = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success) return null;

    return {
      username: data.data.username,
      role: getRoleDisplayName(data.data.role),
    };
  } catch {
    return null;
  }
};


// ===== LOGOUT =====
export const logout = async (redirectTo: string = '/') => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {}
  window.location.href = redirectTo;
};
