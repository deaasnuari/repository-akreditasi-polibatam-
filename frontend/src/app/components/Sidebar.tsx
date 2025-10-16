"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  // === Menu utama tergantung role ===
  let menuItems: { label: string; href: string }[] = [];

  if (role === "tata_usaha")
    menuItems = [
      { label: "Dashboard", href: "/dashboard/tata-usaha" },
      { label: "Data Mahasiswa", href: "/dashboard/tata-usaha/data-mahasiswa" },
      { label: "Laporan", href: "/dashboard/tata-usaha/laporan" },
      { label: "Settings", href: "/dashboard/tata-usaha/settings" },
    ];
  else if (role === "tim_akreditasi")
    menuItems = [
      { label: "Dashboard", href: "/dashboard/tim-akreditasi" },
      { label: "LKPS", href: "/dashboard/tim-akreditasi/lkps" },
      { label: "LED", href: "/dashboard/tim-akreditasi/led" },
      { label: "Bukti Pendukung", href: "/dashboard/tim-akreditasi/bukti-pendukung" },
    ];
  else if (role === "p4m")
    menuItems = [
      { label: "Dashboard", href: "/dashboard/p4m" },
      { label: "Monitoring", href: "/dashboard/p4m/monitoring" },
      { label: "Laporan", href: "/dashboard/p4m/laporan" },
    ];

  const handleLogout = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <aside className="fixed left-0 top-0 w-64 bg-white shadow-lg h-screen p-6 flex flex-col border-r border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-[#163A70]">
        Menu {role?.replace("_", " ")}
      </h2>

      {/* === Menu List === */}
      <ul className="space-y-2 flex-1 overflow-auto">
        {menuItems.map((item) => {
          // ✅ Logika highlight aktif, termasuk subpath
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#163A70] text-[#ADE7F7] shadow-md scale-[1.02]"
                    : "text-gray-700 hover:bg-[#E6F3FF]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* === Tombol Logout === */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
