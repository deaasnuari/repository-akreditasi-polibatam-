'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import {
  Home,
  FileText,
  BookOpen,
  Upload,
  BarChart3,
  Download,
  Menu,
  ChevronLeft,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { logout, getRoleDisplayName } from '@/services/auth';
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

export default function LayoutTimAkreditasi({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; role: string; photo?: string; email?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  
  // Detect mobile screen and auto-collapse sidebar on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Persist sidebar state across tabs/pages using localStorage so it's consistent
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebarOpen') : null;
      if (stored !== null && !isMobile) setSidebarOpen(stored === 'true');
    } catch (err) {}
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      const next = !sidebarOpen;
      setSidebarOpen(next);
      try {
        localStorage.setItem('sidebarOpen', String(next));
      } catch {}
    }
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
        if (current.role !== 'tim-akreditasi') {
          const route = current.role === 'tu' ? '/dashboard/tata-usaha' : `/dashboard/${current.role}`;
          router.push(route);
          return;
        }
        setUser(current);
        if (current.photo) {
          setProfilePhoto(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${current.photo}`);
        }
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
      if (e.key && e.key.startsWith('user_') && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue);
          if (userData.role === 'tim-akreditasi') {
            setUser({ username: userData.username, role: userData.role, email: userData.email });
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard/tim-akreditasi', icon: <Home size={18} /> },
    { name: 'LKPS', href: '/dashboard/tim-akreditasi/lkps', icon: <FileText size={18} /> },
    { name: 'LED', href: '/dashboard/tim-akreditasi/led', icon: <BookOpen size={18} /> },
    { name: 'Bukti Pendukung', href: '/dashboard/tim-akreditasi/bukti-pendukung', icon: <Upload size={18} /> },
    { name: 'Matriks Penilaian', href: '/dashboard/tim-akreditasi/matriks-penilaian', icon: <BarChart3 size={18} /> },
    { name: 'Export', href: '/dashboard/tim-akreditasi/export', icon: <Download size={18} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setOpen(false);
      // logout() will redirect to root, keep fallback just in case
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
    <div className={`flex w-full min-h-screen bg-gray-100 ${poppins.variable} font-sans`}>
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* === SIDEBAR === */}
      <div
        className={`
          ${isMobile ? (
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          ) : (
            sidebarOpen ? 'w-64' : 'w-20'
          )}
          ${isMobile ? 'fixed left-0 top-0 w-64 z-50' : 'sticky top-0'}
          bg-[#183A64] text-white transition-all duration-300 overflow-hidden 
          h-screen flex flex-col shadow-2xl
        `}
      >
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 border-b border-[#ADE7F7]/30 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ADE7F7] rounded-full flex items-center justify-center text-[#183A64] font-bold shadow-md flex-shrink-0 overflow-hidden">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm sm:text-base">{user?.username.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {(sidebarOpen || isMobile) && (
            <div className="flex-1 min-w-0">
              <h2 className="text-[#ADE7F7] text-sm sm:text-base font-bold leading-tight truncate">
                Repository Akreditasi
              </h2>
              <p className="text-[#ADE7F7]/80 text-xs font-bold">POLIBATAM</p>
              {user && (
                <div className="mt-1 sm:mt-2">
                  <p className="text-xs text-gray-300 truncate">{user.email}</p>
                  <p className="text-xs text-gray-300 truncate">{getRoleDisplayName(user.role)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu Items */}
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
                    item.href === '/dashboard/tim-akreditasi'
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                    >
                      <div
                        className={`
                          flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg text-sm transition
                          active:scale-95
                          ${
                            isActive
                              ? 'bg-[#ADE7F7] text-[#183A64] font-semibold'
                              : 'hover:bg-[#ADE7F7]/30 hover:text-[#ADE7F7]'
                          }
                        `}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {(sidebarOpen || isMobile) && <span className="truncate">{item.name}</span>}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Logout dengan konfirmasi modal */}
          <div className="p-3 border-t border-[#ADE7F7]/20">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className={`
                    w-full flex items-center gap-2 justify-center px-3 py-2 bg-[#ADE7F7] text-[#183A64]
                    rounded-lg font-semibold hover:bg-[#FF7F00] hover:text-white transition
                  `}
                >
                  <LogOut size={18} />
                  {sidebarOpen && 'Logout'}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Yakin ingin logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan keluar dari sistem dan perlu login kembali untuk mengakses dashboard.
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
      <div className="flex-1 relative w-full overflow-x-auto max-w-full">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`
            fixed z-40 p-2 sm:p-2.5 bg-[#183A64] text-white rounded-lg 
            hover:bg-[#2A4F85] transition shadow-lg
            ${isMobile ? 'top-4 left-4' : 'top-8'}
          `}
          style={{
            left: isMobile ? '1rem' : (sidebarOpen ? 'calc(16rem + 1rem)' : 'calc(5rem + 1rem)'),
          }}
        >
          {isMobile || !sidebarOpen ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Page Content */}
        <main className="w-full p-4 sm:p-6 md:p-8 pt-16 sm:pt-20 md:pt-6">{children}</main>
      </div>


    </div>
  );
}
 
