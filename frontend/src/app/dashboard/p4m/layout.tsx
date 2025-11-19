'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import {
  Home,
  FileText,
  BookOpen,
  BarChart3,
  Menu,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { logout } from '@/services/auth';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function LayoutP4M({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // Persist sidebar state across tabs/pages using localStorage so it's consistent
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebarOpen') : null;
      if (stored !== null) setSidebarOpen(stored === 'true');
    } catch (err) {}
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    try {
      localStorage.setItem('sidebarOpen', String(next));
    } catch {}
  };

  // Sync sidebar state across tabs in real-time
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sidebarOpen') {
        setSidebarOpen(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { getCurrentUser } = await import('@/services/auth');
        const current = await getCurrentUser();
        if (!mounted) return;
        if (!current) {
          router.push('/auth');
          return;
        }
        if (current.role !== 'p4m') {
          const route = current.role === 'tu' ? '/dashboard/tata-usaha' : `/dashboard/${current.role}`;
          router.push(route);
          return;
        }
        setUser(current);
      } catch (err) {
        router.push('/auth');
        return;
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  // Listen for storage changes to update user data across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'browserAuth' && e.newValue !== 'true') {
        // Browser-wide logout detected, redirect to auth
        router.push('/auth');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);



  // === MENU UNTUK ROLE P4M ===
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard/p4m', icon: <Home size={18} /> },
    { name: 'Review LKPS', href: '/dashboard/p4m/reviewLKPS', icon: <FileText size={18} /> },
    { name: 'Review LED', href: '/dashboard/p4m/reviewLED', icon: <BookOpen size={18} /> },
    { name: 'Matriks Penilaian', href: '/dashboard/p4m/matriks-penilaian', icon: <BarChart3 size={18} /> },
  ];

  // === HANDLE LOGOUT ===
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout gagal:', err);
    } finally {
      setOpen(false);
      router.push('/');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183A64]"></div>
      </div>
    );
  }

  return (
    <div className={`flex w-full bg-gray-100 ${poppins.variable} font-sans`}>
      {/* === SIDEBAR === */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#183A64] text-white transition-all duration-300 overflow-hidden flex-shrink-0 sticky top-0 h-screen flex flex-col`}
      >
        {/* Header Sidebar */}
        <div className="p-4 border-b border-[#ADE7F7]/30 flex items-center gap-3">
          <div className="w-12 h-12 bg-[#ADE7F7] rounded-full flex items-center justify-center text-[#183A64] font-bold shadow-md flex-shrink-0">
            R
          </div>

          {sidebarOpen && (
            <div>
              <h2 className="text-[#ADE7F7] text-base font-bold leading-tight">
                Repository Akreditasi
              </h2>
              <p className="text-[#ADE7F7]/80 text-xs font-bold">POLIBATAM</p>
              {user && (
                <p className="text-sm text-[#ADE7F7]/90 mt-2 font-medium">Halo, {user.username}</p>
              )}
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="flex-1 flex flex-col justify-between font-medium">
          <div className="flex flex-col h-full">
            <div className="p-3 flex-1 overflow-y-auto">
              {sidebarOpen && (
                <h3 className="text-xs font-bold text-[#ADE7F7] mb-3 tracking-wider">
                  MENU UTAMA
                </h3>
              )}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.name !== 'Dashboard' &&
                      pathname.startsWith(item.href + '/'));

                  return (
                    <Link key={item.name} href={item.href} className="block">
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-[#ADE7F7] text-[#183A64] font-semibold'
                            : 'hover:bg-[#ADE7F7]/30 hover:text-[#ADE7F7]'
                        }`}
                      >
                        {item.icon}
                        {sidebarOpen && <span>{item.name}</span>}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tombol Logout dengan Modal Konfirmasi */}
          <div className="p-3 border-t border-[#ADE7F7]/20">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#ADE7F7] text-[#183A64] rounded-lg font-semibold hover:bg-[#FF7F00] hover:text-white transition`}
                >
                  <LogOut size={18} />
                  {sidebarOpen && 'Logout'}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Yakin ingin logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan keluar dari sistem dan harus login kembali untuk mengakses dashboard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Ya, Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 relative">
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="fixed top-8 z-50 p-2 bg-[#183A64] text-white rounded-lg shadow-lg hover:bg-[#2A4F85] transition-colors"
          style={{
            left: sidebarOpen ? 'calc(16rem + 1rem)' : 'calc(5rem + 1rem)',
          }}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>

        {/* Child Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
