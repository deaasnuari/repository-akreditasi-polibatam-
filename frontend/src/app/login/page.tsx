'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from "../../services/auth";

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

  // ==== LOGIN HANDLER ====
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(loginEmail, loginPassword, loginRole);

      if (data.success && data.user) {
        // Set per-tab auth flag so only this tab reflects the login
        if (typeof window !== 'undefined') sessionStorage.setItem('tabAuth', 'true');
        // Redirect otomatis berdasarkan role
        const role = data.user.role;

        if (role === 'tim-akreditasi') router.push('/dashboard/tim-akreditasi');
        else if (role === 'p4m') router.push('/dashboard/p4m');
        else if (role === 'tu') router.push('/dashboard/tata-usaha');
        else router.push('/dashboard');
      } else {
        setError(data.msg || 'Login gagal, periksa kembali data Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  // ==== REGISTER HANDLER ====
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await registerUser(regName, regEmail, regPassword, regRole);
      setSuccess('Registrasi berhasil! Silakan login.');
      setActiveTab('login');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('tim-akreditasi');
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal.');
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

        {/* === LOGIN FORM === */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <select
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value)}
              className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
            >
              <option value="tim-akreditasi">Tim Akreditasi</option>
              <option value="p4m">P4M</option>
              <option value="tu">Tata Usaha</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#183A64] text-white font-semibold py-3 rounded-xl hover:bg-[#ADE7F7] hover:text-[#183A64] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Masuk'}
            </button>
          </form>
        )}

        {/* === REGISTER FORM === */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />
            <select
              value={regRole}
              onChange={(e) => setRegRole(e.target.value)}
              className="w-full border-2 border-[#183A64] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#183A64]"
            >
              <option value="tim-akreditasi">Tim Akreditasi</option>
              <option value="p4m">P4M</option>
              <option value="tu">Tata Usaha</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#183A64] text-white font-semibold py-3 rounded-xl hover:bg-[#ADE7F7] hover:text-[#183A64] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
