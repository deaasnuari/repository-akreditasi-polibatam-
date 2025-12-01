'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // === Kondisi untuk menyembunyikan menu ===
  const hideMenu =
    pathname.startsWith('/dashboard') ||
    pathname === '/login';

  const isDashboard = pathname.startsWith('/dashboard');

  // Profile states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    if (isDashboard) {
      let mounted = true;
      (async () => {
        try {
          const { getCurrentUser } = await import('@/services/auth');
          const current = await getCurrentUser();
          if (!mounted) return;
          setUser(current);
        } catch (err) {
          // Handle error
        }
      })();
      return () => { mounted = false; };
    }
  }, [isDashboard]);

  // === Scroll Helper ===
  const handleScrollTo = (targetId?: string) => {
    const scrollNow = () => {
      if (!targetId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    if (pathname === '/') {
      scrollNow();
    } else {
      router.push('/');
      setTimeout(scrollNow, 220);
    }
  };

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 bg-[#183A64] text-white
          px-8 h-16 flex items-center justify-between shadow-md
          ${poppins.className}
        `}
      >
        {/* === LOGO === */}
        <div className="flex items-center gap-5 cursor-pointer">
          <img
            src="/Polibatam.png"
            alt="Logo"
            className="h-20 w-20 object-contain -mt-2"
          />
          <span className="text-lg md:text-xl font-bold">ReDDA POLIBATAM</span>
        </div>

        {/* === MENU === */}
        {!hideMenu && (
          <div className="flex gap-2 md:gap-3 lg:gap-4 items-center">
            {[
              { label: 'Beranda', id: undefined },
              { label: 'Fitur', id: 'fitur' },
              { label: 'Tentang', id: 'tentang' },
              { label: 'Kontak', id: 'kontak' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleScrollTo(item.id)}
                className="
                  px-4 py-2 rounded-md font-semibold text-white/90 hover:text-white
                  hover:bg-[#FF7F00] transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F00]/70
                "
              >
                {item.label}
              </button>
            ))}

            <Link
              href="/login"
              className="
                px-4 py-2 rounded-md font-semibold text-white/90 hover:text-white
                hover:bg-[#FF7F00] transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F00]/70
              "
            >
              Login
            </Link>
          </div>
        )}

        {/* === PROFILE SECTION FOR DASHBOARD === */}
        {isDashboard && user && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-[#ADE7F7]/20 transition"
              >
                <div className="w-8 h-8 bg-[#ADE7F7] rounded-full flex items-center justify-center text-[#183A64] font-bold shadow-md overflow-hidden">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    'R'
                  )}
                </div>
                <span className="text-sm font-medium">Halo, {user.username}</span>
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            {/* Hidden fields to discourage browser credential autofill in the profile modal */}
            <input type="text" style={{ display: 'none' }} autoComplete="username" tabIndex={-1} />
            <input type="password" style={{ display: 'none' }} autoComplete="current-password" tabIndex={-1} />
            <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="profilePhoto" className="text-right">
                Profile Photo
              </label>
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setProfilePhoto(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183A64]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                 autoComplete="off"
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183A64]"
                placeholder="Enter new username"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="currentPassword" className="text-right">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                 autoComplete="current-password"
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183A64]"
                placeholder="Enter current password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="newPassword" className="text-right">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                 autoComplete="new-password"
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183A64]"
                placeholder="Enter new password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="confirmPassword" className="text-right">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={profileForm.confirmPassword}
                onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                 autoComplete="new-password"
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#183A64]"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setProfileModalOpen(false);
                setProfileForm({
                  username: '',
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                // Handle save profile logic here
                console.log('Saving profile:', profileForm);
                setProfileModalOpen(false);
                setProfileForm({
                  username: '',
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
              className="bg-[#183A64] hover:bg-[#2A4F85]"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
