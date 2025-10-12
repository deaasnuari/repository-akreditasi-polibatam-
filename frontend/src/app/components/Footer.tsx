'use client';

import { Irish_Grover, Poppins } from 'next/font/google';

const irishGrover = Irish_Grover({
  subsets: ['latin'],
  weight: '400',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Footer() {
  return (
    <footer className="bg-[#0A2F56] text-white mt-10 relative">
      <div className="px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start relative">
          {/* === Kiri === */}
          <div className="flex items-start gap-4">
            {/* Logo */}
            <img
              src="/Polibatam.png"
              alt="Logo"
              className="h-14 w-14 object-contain"
            />

            {/* Teks */}
            <div className={poppins.className}>
              <p className="text-lg font-bold">
                <span className={`${irishGrover.className} text-[#ADE7F7]`}>
                  ReDDA POLIBATAM
                </span>{' '}
                
              </p>

              <p className="text-sm font-semibold">
                Pusat Repository Digital Data Akreditasi Polibatam <br />
                Jurusan Informatika
              </p>
              <p className="text-xs mt-2">
                Alamat: Jl Ahmad Yani Batam Kota, Kota Batam Kepulauan Riau, Indonesia
              </p>
            </div>
          </div>

          {/* === Kanan (pojok kanan atas) === */}
          <div
            className={`absolute top-6 right-6 flex gap-6 font-semibold ${poppins.className}`}
          >
            <a
              href="#"
              className="text-[#ADE7F7] hover:text-white transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#"
              className="text-[#ADE7F7] hover:text-white transition-colors duration-200"
            >
              Support
            </a>
          </div>
        </div>
      </div>

      {/* === Bawah === */}
      <div
        className={`bg-orange-500 text-center text-xs py-2 ${poppins.className}`}
      >
        © 2025 Politeknik Negeri Batam
      </div>
    </footer>
  );
}
