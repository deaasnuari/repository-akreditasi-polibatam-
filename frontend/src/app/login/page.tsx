'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, roleToSlug } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TU');

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // === LOGIN HANDLER ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // kirim email + password ke backend
      const data = await loginUser(username, password);
      if (data.success && data.user) {
        // pastikan role yang dipilih user sesuai dengan role di server
        const serverSlug = roleToSlug(data.user.role);
        const selectedSlug = roleToSlug(role);
        if (selectedSlug && serverSlug !== selectedSlug) {
          // Jangan accept login jika role yang dipilih tidak sama dengan role akun
          setError('Role yang dipilih tidak sesuai dengan akun. Silakan pilih role yang sesuai.');
          return;
        }

        const userRole = data.user.role;
        if (userRole === 'Tim Akreditasi') router.push('/dashboard/tim-akreditasi');
        else if (userRole === 'P4M') router.push('/dashboard/p4m');
        else if (userRole === 'TU') router.push('/dashboard/tata-usaha');
        else router.push('/dashboard');
      } else {
        setError(data.message || data.msg || 'Login gagal, periksa kembali data Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8"
      style={{
        backgroundImage: "url('/images/Gedungpolibatam.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.15)] p-8 z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#183A64] mb-2">Login</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
          <input
            type="email"
            placeholder="Email"
            className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
          >
            <option value="TU">Tata Usaha</option>
            <option value="P4M">P4M</option>
            <option value="Tim Akreditasi">Tim Akreditasi</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#183A64] text-white font-semibold py-3 rounded-xl hover:bg-[#ADE7F7] hover:text-[#183A64] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
