"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, []);

  const hideMenu = pathname === "/login" || pathname === "/register";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A2F56] text-white px-6 h-16 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <Link href="/">
          <img src="/ReDDa_logo.png" alt="Logo" className="h-20 w-20 object-contain -mt-2 cursor-pointer" />
        </Link>
        <span className="font-bold text-lg md:text-xl">Repository Digital Data Akreditasi</span>
      </div>

      {!hideMenu && !role && (
        <div className="flex gap-6 items-center">
          <Link href="/login" className="hover:underline">Login</Link>
        </div>
      )}
    </nav>
  );
}
