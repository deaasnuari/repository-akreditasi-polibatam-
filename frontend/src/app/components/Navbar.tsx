'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Irish_Grover } from 'next/font/google';

const irishGrover = Irish_Grover({
  subsets: ['latin'],
  weight: '400',
});

export default function Navbar() {
  const pathname = usePathname();
  const hideMenu = pathname === '/login' || pathname === '/register';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A2F56] text-white px-6 h-16 flex items-center justify-between shadow-md">
      {/* Logo kiri */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <img
            src="/Polibatam.png"
            alt="Logo"
            className="h-20 w-20 object-contain -mt-2 cursor-pointer"
          />
        </Link>
        <span
          className={`${irishGrover.className} text-[#ADE7F7] text-lg md:text-xl font-bold tracking-wide`}
        >
          ReDDA POLIBATAM
        </span>
      </div>

      {/* Menu kanan */}
      {!hideMenu && (
        <div className="flex gap-6 items-center">
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
