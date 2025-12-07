'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Menu, ChevronLeft, Home, Book, FileText, FileCheck } from "lucide-react";
import { getCurrentUser, logout, getRoleDisplayName } from "@/services/auth";

interface SidebarProps {
  role?: string;
  onToggle?: (collapsed: boolean) => void;
}

export default function Sidebar({ role, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string; photo?: string } | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [headerHeight, setHeaderHeight] = useState(64);
  const [footerHeight, setFooterHeight] = useState(120);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          if (currentUser?.photo) {
            setProfilePhoto(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${currentUser.photo}`);
          }
        }
      } catch (err) {
        // Handle error
      }
    })();

    const measure = () => {
      try {
        const headerSel = ["header", "[data-header]", ".topbar", "#header"];
        const footerSel = ["footer", "[data-footer]", ".site-footer", "#footer", "#kontak"];

        const header = headerSel.map((s) => document.querySelector(s)).find(Boolean);
        const footer = footerSel.map((s) => document.querySelector(s)).find(Boolean);

        setHeaderHeight(header?.getBoundingClientRect().height ?? 64);
        setFooterHeight(footer?.getBoundingClientRect().height ?? 120);
      } catch {
        if (!mounted) {
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
      mounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // === Toggle Sidebar ===
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };

  // === Menu ===
  let menuItems = [];
  if (role === "tim-akreditasi") {
    menuItems = [
      { label: "Dashboard", href: "/dashboard/tim-akreditasi", icon: <Home size={18} /> },
      { label: "LKPS", href: "/dashboard/tim-akreditasi/lkps", icon: <Book size={18} /> },
      { label: "LED", href: "/dashboard/tim-akreditasi/led", icon: <FileText size={18} /> },
      { label: "Bukti Pendukung", href: "/dashboard/tim-akreditasi/bukti-pendukung", icon: <FileCheck size={18} /> },
    ];
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`fixed left-0 z-40 bg-white text-gray-800 transform transition-all duration-300 shadow-lg ${isCollapsed ? 'w-20' : 'w-64'}`}
      style={{
        top: `${headerHeight}px`,
        bottom: `${footerHeight}px`,
        overflowY: "auto",
      }}
    >
      <div className="flex flex-col h-full">
        {/* === HEADER SIDEBAR & USER INFO === */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ADE7F7] rounded-full flex items-center justify-center text-[#183A64] font-bold shadow-md overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{user.username}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
              </div>
            </div>
          )}
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-full">
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* === MENU LIST === */}
        <ul className="space-y-2 flex-1 overflow-auto px-4 py-4">
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
                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                    transition font-medium
                    ${active ? "bg-[#183A64] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}
                    ${isCollapsed ? 'justify-center' : ''}
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
        <div className="mt-auto p-4 border-t">
          <button
            onClick={handleLogout}
            className={`
              w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg
              transition flex items-center gap-3
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}