"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false); // untuk menghindari SSR mismatch
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true); // render form hanya di client
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server error:", text);
        throw new Error("Login gagal");
      }

      const data = await res.json();
      setLoading(false);

      // Simpan role di cookie
      document.cookie = `role=${data.role}; path=/;`;

      // Redirect sesuai role
      if (data.role === "tim-akreditasi") router.push("/dashboard/tim-akreditasi");
      else if (data.role === "p4m") router.push("/dashboard/p4m");
      else if (data.role === "reviewer") router.push("/dashboard/reviewer");
      else router.push("/");
    } catch (error) {
      setLoading(false);
      alert(error.message || "Terjadi kesalahan pada server.");
    }
  };

  // Jangan render form sebelum mounted untuk menghindari hydration mismatch
  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white shadow-2xl rounded-2xl px-8 py-10 w-96">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6 font-irish">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition-all duration-200 ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          © 2025 Polibatam – Repository Digital Akreditasi
        </p>
      </div>
    </div>
  );
}
