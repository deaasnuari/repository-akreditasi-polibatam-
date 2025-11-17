'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Menu, ChevronLeft, Home, Book, FileText, FileCheck } from "lucide-react";

interface SidebarProps {
  role?: string;
  onToggle?: (collapsed: boolean) => void;
}

export default function Sidebar({ role, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [headerHeight, setHeaderHeight] = useState(64);
  const [footerHeight, setFooterHeight] = useState(120);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  // === Measure header & footer height ===
  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;

    const measure = () => {
      try {
        const headerSel = ["header", "[data-header]", ".topbar", "#header"];
        const footerSel = ["footer", "[data-footer]", ".site-footer", "#footer", "#kontak"];

        const header = headerSel.map((s) => document.querySelector(s)).find(Boolean);
        const footer = footerSel.map((s) => document.querySelector(s)).find(Boolean);

        setHeaderHeight(header?.getBoundingClientRect().height ?? 64);
        setFooterHeight(footer?.getBoundingClientRect().height ?? 120);
      } catch {
        if (!cancelled) {
          setHeaderHeight(64);
          setFooterHeight(120);
        }
      }
    };

    measure();
    const t1 = setTimeout(measure, 120);
    const t2 = setTimeout(measure, 400);
    window.addEventListener("resize", measure);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
    };
  }, [isClient]);

  // === Toggle Sidebar ===
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };

  // === Menu ===
  let menuItems = [];
  if (role === "tim_akreditasi") {
    menuItems = [
      { label: "Dashboard", href: "/dashboard/tim-akreditasi", icon: <Home size={18} /> },
      { label: "LKPS", href: "/dashboard/tim-akreditasi/lkps", icon: <Book size={18} /> },
      { label: "LED", href: "/dashboard/tim-akreditasi/led", icon: <FileText size={18} /> },
      { label: "Bukti Pendukung", href: "/dashboard/tim-akreditasi/bukti-pendukung", icon: <FileCheck size={18} /> },
    ];
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <aside
  className={`fixed left-0 z-50 w-64 bg-gray-900 text-white transform transition-all duration-300`}
  style={{
    top: `${headerHeight}px`,     // mulai setelah navbar
    bottom: `${footerHeight}px`,  // berhenti sebelum footer
    overflowY: "auto",            // biar scroll di dalam sidebar
  }}
>

      {/* === HEADER SIDEBAR === */}
      <div className="flex items-center justify-between px-3 py-4">
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-[#183A64]">Menu {role}</h2>
        )}
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded">
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* === MENU LIST === */}
      <ul className="space-y-2 flex-1 overflow-auto px-0">
        {menuItems.map((item) => {
          const active =
            item.href === `/dashboard/${role}`
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-md text-sm
                  transition font-medium
                  ${active ? "bg-[#183A64] text-white" : "text-gray-700 hover:bg-[#E6F3FF]"}
                `}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* === LOGOUT === */}
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className={`
            w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold
            transition
          `}
        >
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
