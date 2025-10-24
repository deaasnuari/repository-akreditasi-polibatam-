"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, ChevronLeft, Home, Users, FileText, Settings, Book, FileCheck } from "lucide-react";

interface SidebarProps {
  role?: string;
  onToggle?: (collapsed: boolean) => void;
}

export default function Sidebar({ role, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };

  let menuItems: { label: string; href: string; icon: React.ReactNode }[] = [];

  if (role === "tata_usaha")
    menuItems = [
      { label: "Dashboard", href: "/dashboard/tata-usaha", icon: <Home size={18} /> },
      { label: "Data Mahasiswa", href: "/dashboard/tata-usaha/data-mahasiswa", icon: <Users size={18} /> },
      { label: "Laporan", href: "/dashboard/tata-usaha/laporan", icon: <FileText size={18} /> },
      { label: "Settings", href: "/dashboard/tata-usaha/settings", icon: <Settings size={18} /> },
    ];
  else if (role === "tim_akreditasi")
    menuItems = [
      { label: "Dashboard", href: "/dashboard/tim-akreditasi", icon: <Home size={18} /> },
      { label: "LKPS", href: "/dashboard/tim-akreditasi/lkps", icon: <Book size={18} /> },
      { label: "LED", href: "/dashboard/tim-akreditasi/led", icon: <FileText size={18} /> },
      { label: "Bukti Pendukung", href: "/dashboard/tim-akreditasi/bukti-pendukung", icon: <FileCheck size={18} /> },
    ];
  else if (role === "p4m")
    menuItems = [
      { label: "Dashboard", href: "/dashboard/p4m", icon: <Home size={18} /> },
      { label: "Monitoring", href: "/dashboard/p4m/monitoring", icon: <Users size={18} /> },
      { label: "Laporan", href: "/dashboard/p4m/laporan", icon: <FileText size={18} /> },
    ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col
      transition-all duration-300 font-sans
      ${isCollapsed ? "w-20" : "w-64"}
    `}
    >
      {/* Header + toggle */}
      <div className="flex items-center justify-between px-3 py-4">
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-[#163A70] truncate">Menu {role?.replace("_", " ")}</h2>
        )}

        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-100 transition"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <ul className="space-y-2 flex-1 overflow-auto">
        {menuItems.map((item) => {
          const isActive =
    item.href === `/dashboard/${role}`
      ? pathname === item.href
      : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition
                ${isActive ? "bg-[#163A70] text-white" : "text-gray-700 hover:bg-[#E6F3FF]"}
                `}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className={`w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold transition
          ${isCollapsed ? "text-[0px] px-0" : ""}
        `}
        >
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
