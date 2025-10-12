'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('tim-akreditasi');

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('tim-akreditasi');

  // Hindari hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, role: loginRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login gagal');

      if (loginRole === 'tim-akreditasi') router.push('/dashboard/tim-akreditasi');
      else if (loginRole === 'p4m') router.push('/dashboard/p4m');
      else if (loginRole === 'reviewer') router.push('/dashboard/reviewer');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registrasi gagal');

      setSuccess('Registrasi berhasil! Silakan login.');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('tim-akreditasi');
      setActiveTab('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.15)] p-8">

        {/* === Tabs === */}
        <div className="flex justify-center mb-6">
          {(['login', 'register'] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
                activeTab === tab
                  ? 'bg-[#183A64] text-[#ADE7F7]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${tab === 'register' ? 'ml-2' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* === Error & Success === */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-600 text-sm p-3 rounded-lg mb-4 text-center">
            {success}
          </div>
        )}

        {/* === Login Form === */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              className="w-full border-2 border-[#183A64] bg-white rounded-xl px-4 py-3 text-base 
                         focus:outline-none focus:ring-2 focus:ring-[#183A64] focus:border-[#183A64]"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border-2 border-[#183A64] bg-white rounded-xl px-4 py-3 text-base 
                         focus:outline-none focus:ring-2 focus:ring-[#183A64] focus:border-[#183A64]"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />

            <div className="text-right mt-1">
              <Link
                href="/forgot-password"
                className="text-sm text-[#183A64] hover:text-[#ADE7F7] font-medium transition-colors duration-200"
              >
                Lupa Password?
              </Link>
            </div>

            <select
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value)}
              className="w-full border-2 border-[#183A64] bg-white rounded-xl px-4 py-3 text-base 
                         focus:outline-none focus:ring-2 focus:ring-[#183A64] focus:border-[#183A64]"
            >
              <option value="tim-akreditasi">Tim Akreditasi</option>
              <option value="p4m">P4M</option>
              <option value="reviewer">Reviewer</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#183A64] text-white font-semibold py-3 text-base rounded-xl 
                         hover:bg-[#ADE7F7] hover:text-[#183A64] transition-colors duration-300 
                         disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Loading...' : 'Masuk'}
            </button>
          </form>
        )}

        {/* === Register Form === */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full border-2 border-[#183A64] bg-white rounded-xl px-4 py-3 text-base 
                         focus:outline-none focus:ring-2 focus:ring-[#183A64] focus:border-[#183A64]"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border-2 border-[#183A64] bg-white rounded-xl px-4 py-3 text-base 
                         focus:outline-none focus:ring-2 focus:ring-[#183A64] focus:border-[#183A64]"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border-2 border-[#183A64] bg-white rounded-xl px-4 py-3 text-base 
                         focus:outline-none focus:ring-2 focus:ring-[#183A64] focus:border-[#183A64]"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />
            <select
              value={regRole}
              onChange={(e) => setRegRole(e.target.value)}
              className="w-full border-2 border-[#183A64] bg-white rounded-xl px-4 py-3 text-base 
                         focus:outline-none focus:ring-2 focus:ring-[#183A64] focus:border-[#183A64]"
            >
              <option value="tim-akreditasi">Tim Akreditasi</option>
              <option value="p4m">P4M</option>
              <option value="reviewer">Reviewer</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#183A64] text-white font-semibold py-3 text-base rounded-xl 
                         hover:bg-[#ADE7F7] hover:text-[#183A64] transition-colors duration-300 
                         disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Loading...' : 'Daftar'}
            </button>
          </form>
        )}

        {/* === Footer Switch === */}
        <div className="text-center mt-6">
          {activeTab === 'login' ? (
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <button
                onClick={() => setActiveTab('register')}
                className="text-[#183A64] hover:text-[#ADE7F7] font-medium transition-colors"
              >
                Daftar
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <button
                onClick={() => setActiveTab('login')}
                className="text-[#183A64] hover:text-[#ADE7F7] font-medium transition-colors"
              >
                Masuk
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
