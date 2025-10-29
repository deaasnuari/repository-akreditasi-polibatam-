'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';

// === Import font Poppins ===
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const hideMenu =
    pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/register';

  const handleHomeClick = () => {
    if (pathname === '/') {
      window.location.reload();
    } else {
      router.push('/');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-[#0A2F56] text-white px-8 h-16 flex items-center justify-between shadow-md ${poppins.className}`}
    >
      {/* === LOGO KIRI === */}
      <div className="flex items-center gap-5 cursor-pointer" onClick={handleHomeClick}>
        <img
          src="/Polibatam.png"
          alt="Logo"
          className="h-20 w-20 object-contain -mt-2"
        />
        <span className="text-[#77777] text-lg md:text-xl font-bold tracking-wide">
          ReDDA POLIBATAM
        </span>
      </div>

      {/* === MENU KANAN === */}
      {!hideMenu && (
        <div className="flex gap-4 items-center">
          <button
          onClick={handleHomeClick}
          className="bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold hover:bg-[#FF7F00] hover:text-white transition-all duration-300"
          >
            Home
          </button>
          <Link
          href="/login"
          className="bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold hover:bg-[#FF7F00] hover:text-white transition-all duration-300"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
