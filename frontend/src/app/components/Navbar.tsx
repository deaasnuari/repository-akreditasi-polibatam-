'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // === Kondisi untuk menyembunyikan menu ===
  const hideMenu =
    pathname.startsWith('/dashboard') ||
    pathname === '/login' ||
    pathname === '/register';

  // === Scroll Helper ===
  const handleScrollTo = (targetId?: string) => {
    const scrollNow = () => {
      if (!targetId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    if (pathname === '/') {
      scrollNow();
    } else {
      router.push('/');
      setTimeout(scrollNow, 220);
    }
  };

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 bg-[#183A64] text-white
        px-8 h-16 flex items-center justify-between shadow-md
        ${poppins.className}
      `}
    >
      {/* === LOGO === */}
      <div className="flex items-center gap-5 cursor-pointer">
        <img
          src="/Polibatam.png"
          alt="Logo"
          className="h-20 w-20 object-contain -mt-2"
        />
        <span className="text-lg md:text-xl font-bold">ReDDA POLIBATAM</span>
      </div>

      {/* === MENU === */}
      {!hideMenu && (
        <div className="flex gap-4 items-center">
          {[
            { label: 'Beranda', id: undefined },
            { label: 'Fitur', id: 'fitur' },
            { label: 'Tentang', id: 'tentang' },
            { label: 'Kontak', id: 'kontak' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleScrollTo(item.id)}
              className="
                bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold
                hover:bg-[#FF7F00] hover:text-white transition-all duration-300
              "
            >
              {item.label}
            </button>
          ))}

          <Link
            href="/login"
            className="
              bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold
              hover:bg-[#FF7F00] hover:text-white transition-all duration-300
            "
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
