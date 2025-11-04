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
    // Mark this tab as authenticated for the requested role only
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('tabAuth', 'true');
        sessionStorage.setItem('tabRole', role);
      } catch {}
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Login gagal.');
  }
};

// ===== GET CURRENT USER =====
export const getCurrentUser = async () => {
  // Per-tab UI session: only treat user as logged-in in this tab when
  // sessionStorage has the 'tabAuth' flag. This prevents other tabs from
  // automatically appearing logged-in even though cookies are shared.
  if (typeof window !== 'undefined') {
    const tabAuth = sessionStorage.getItem('tabAuth');
    const tabRole = sessionStorage.getItem('tabRole');
    if (tabAuth !== 'true') return null;
  }

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success) return null;

    // Debug logging to assist reproduction: print tab flags and server role
    if (typeof window !== 'undefined') {
      const tabAuth = sessionStorage.getItem('tabAuth');
      const tabRole = sessionStorage.getItem('tabRole');
      try {
        // eslint-disable-next-line no-console
        console.debug('[auth] getCurrentUser: tabAuth=', tabAuth, 'tabRole=', tabRole, 'serverRole=', data.data.role);
      } catch {}
      if (tabRole && tabRole !== data.data.role) return null;
    }

    return {
      username: data.data.username,
      role: data.data.role,
    };
  } catch {
    return null;
  }
};


// ===== LOGOUT =====
export const logout = async (redirectTo: string = (typeof window !== 'undefined' ? window.location.origin : '/')) => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {}
  // Clear per-tab flag as well
  if (typeof window !== 'undefined') sessionStorage.removeItem('tabAuth');
  if (typeof window !== 'undefined') sessionStorage.removeItem('tabRole');
  window.location.href = redirectTo;
};
