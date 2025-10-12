'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Irish_Grover } from 'next/font/google';

const irishGrover = Irish_Grover({
  subsets: ['latin'],
  weight: '400',
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // === SEMUA PATH YANG HARUS SEMBUNYIKAN MENU ===
  const hideMenu =
    pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/register';

  // Fungsi untuk reload halaman home
  const handleHomeClick = () => {
    if (pathname === '/') {
      // Kalau udah di halaman utama, reload aja
      window.location.reload();
    } else {
      // Kalau belum di halaman utama, arahkan ke '/'
      router.push('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A2F56] text-white px-6 h-16 flex items-center justify-between shadow-md">
      {/* === LOGO KIRI === */}
      <div className="flex items-center gap-4 cursor-pointer" onClick={handleHomeClick}>
        <img
          src="/Polibatam.png"
          alt="Logo"
          className="h-20 w-20 object-contain -mt-2"
        />
        <span
          className={`${irishGrover.className} text-[#ADE7F7] text-lg md:text-xl font-bold tracking-wide`}
        >
          ReDDA POLIBATAM
        </span>
      </div>

      {/* === MENU KANAN (HANYA DI HALAMAN UTAMA) === */}
      {!hideMenu && (
        <div className="flex gap-4 items-center">
          {/* Tombol Home */}
          <button
            onClick={handleHomeClick}
            className="border border-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold hover:bg-[#FF7F00] transition"
          >
            Home
          </button>

          {/* Tombol Login */}
          <Link
            href="/login"
            className="bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold hover:bg-[#FF7F00] transition"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
