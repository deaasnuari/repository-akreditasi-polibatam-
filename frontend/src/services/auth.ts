const API_URL = 'http://localhost:5000/api/auth';

export const loginUser = async (email: string, password: string, role: string) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.msg || 'Login gagal');
  }

  return data;
};

export const registerUser = async (name: string, email: string, password: string, role: string) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: name, email, password, role })
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.msg || 'Registrasi gagal');
  }

  return data;
};
