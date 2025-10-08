'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
export const dynamic = 'force-static';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tim-akreditasi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login gagal');

      if (role === 'tim-akreditasi') router.push('/dashboard/tim-akreditasi');
      else if (role === 'p4m') router.push('/dashboard/p4m');
      else if (role === 'reviewer') router.push('/dashboard/reviewer');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8"
    >
      {/* Kotak form */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.15)] p-8">
        {/* Judul */}
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Login
        </h1>

        {/* Pesan error */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Form login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full border-2 border-gray-300 bg-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              suppressHydrationWarning
            />
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full border-2 border-gray-300 bg-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suppressHydrationWarning
            />
            <div className="text-right mt-2">
              <Link
                href="#"
                className="text-sm text-blue-600 hover:underline"
              >
                Lupa Password?
              </Link>
            </div>
          </div>

          {/* Role */}
          <div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border-2 border-gray-300 bg-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              suppressHydrationWarning
            >
              <option value="tim-akreditasi">Tim Akreditasi</option>
              <option value="p4m">P4M</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 text-base rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            suppressHydrationWarning
          >
            {loading ? 'Loading...' : 'Masuk'}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link
              href="#"
              className="text-blue-600 hover:underline font-medium"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}