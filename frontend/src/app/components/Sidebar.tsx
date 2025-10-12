"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const router = useRouter();

  let menuItems: string[] = [];

  if (role === "tata_usaha")
    menuItems = ["Dashboard", "Data Mahasiswa", "Laporan", "Settings"];
  else if (role === "tim_akreditasi")
    menuItems = ["Dashboard", "Dokumen Akreditasi", "Rekap Nilai"];
  else if (role === "p4m") menuItems = ["Dashboard", "Monitoring", "Laporan"];

  const handleLogout = () => {
    try {
      // Pastikan dijalankan di browser
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        // Pakai window.location langsung agar pasti reload halaman
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <aside className="fixed left-0 top-0 w-64 bg-white shadow-md h-screen p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-6">
        Menu {role.replace("_", " ")}
      </h2>

      <ul className="space-y-3 flex-1 overflow-auto">
        {menuItems.map((item) => (
          <li
            key={item}
            className="hover:bg-[#ADE7F7] p-2 rounded cursor-pointer transition-colors duration-200"
          >
            {item}
          </li>
        ))}
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
