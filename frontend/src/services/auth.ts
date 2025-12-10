const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ===== Helper function =====
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'TU': 'Tata Usaha',
    'P4M': 'P4M',
    'Tim Akreditasi': 'Tim Akreditasi',
  };
  return roleMap[role] || role;
};

// Map server role -> slug used by frontend routes/layout
export const roleToSlug = (role: string | undefined | null) => {
  if (!role) return '';
  const r = role.toLowerCase();
  if (r === 'tu' || r === 'tata usaha' || r === 'tata_usaha' || r === 'tata-usaha') return 'tu';
  if (r === 'p4m') return 'p4m';
  if (r.includes('tim') && r.includes('akreditasi')) return 'tim-akreditasi';
  // fallback: kebab-case
  return role.replace(/\s+/g, '-').toLowerCase();
};

// ===== LOGIN =====
export const loginUser = async (
  email: string,
  password: string
) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // supaya cookie tersimpan
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.msg || 'Login gagal.');

    // Store user data in sessionStorage per tab
    if (typeof window !== 'undefined' && data.success && data.user) {
      try {
        const tabId = sessionStorage.getItem('tabId') || generateTabId();
        sessionStorage.setItem('tabId', tabId);
        sessionStorage.setItem('tabAuth', 'true');
        const slug = roleToSlug(data.user.role);
        sessionStorage.setItem('tabRole', slug);
        sessionStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: slug,
          nama_lengkap: data.user.nama_lengkap,
          prodi: data.user.prodi // Add prodi here
        }));
      } catch {}
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Login gagal.');
  }
};

// Generate unique tab ID
const generateTabId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
      const serverSlug = roleToSlug(data.data.role);
      if (tabRole && tabRole !== serverSlug) return null;
      return {
        ...data.data,
        role: serverSlug,
      };
    }

    return {
      ...data.data,
      role: roleToSlug(data.data.role),
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
  if (typeof window !== 'undefined') {
    const tabId = sessionStorage.getItem('tabId');
    if (tabId) {
      localStorage.removeItem(`user_${tabId}`);
    }
    sessionStorage.removeItem('tabAuth');
    sessionStorage.removeItem('tabRole');
    sessionStorage.removeItem('tabId');
  }
  window.location.href = redirectTo;
};
