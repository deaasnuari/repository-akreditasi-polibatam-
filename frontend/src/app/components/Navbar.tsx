'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { useEffect, useState } from 'react';

// === Import font Poppins ===
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  // username is shown in Sidebar per request

  const hideMenu =
    pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/register';

  const handleHomeClick = () => {
  };

  // Scroll helper: if we're already on home page, scroll smoothly to target;
  // otherwise navigate to '/' first and then scroll after a short delay.
  const handleScrollTo = (targetId?: string) => {
    const doScroll = () => {
      if (!targetId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (pathname === '/') {
      doScroll();
    } else {
      // navigate to home first, then scroll after a short delay
      // Note: next/navigation router.push in app-router is synchronous (void),
      // so wait a small amount for the page to render before scrolling.
      router.push('/');
      setTimeout(doScroll, 220);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-[#183A64] text-white px-8 h-16 flex items-center justify-between shadow-md ${poppins.className}`}
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
            onClick={() => handleScrollTo(undefined)}
            className="bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold hover:bg-[#FF7F00] hover:text-white transition-all duration-300"
          >
            Beranda
          </button>

          <button
            onClick={() => handleScrollTo('fitur')}
            className="bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold hover:bg-[#FF7F00] hover:text-white transition-all duration-300"
          >
            Fitur
          </button>

          <button
            onClick={() => handleScrollTo('tentang')}
            className="bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold hover:bg-[#FF7F00] hover:text-white transition-all duration-300"
          >
            Tentang
          </button>

          <button
            onClick={() => handleScrollTo('kontak')}
            className="bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold hover:bg-[#FF7F00] hover:text-white transition-all duration-300"
          >
            Kontak
          </button>

          <Link
            href="/login"
            className="bg-[#183A64] text-[#ADE7F7] px-4 py-1.5 rounded-md font-semibold hover:bg-[#FF7F00] hover:text-white transition-all duration-300"
          >
            Login
          </Link>
          {/* username moved to Sidebar */}
        </div>
      )}
    </nav>
  );
}
