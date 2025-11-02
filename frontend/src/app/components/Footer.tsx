'use client';

import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Footer() {
  return (
    <footer className={`mt-10 w-full ${poppins.className}`}>
      {/* Bagian Atas */}
      <div className="bg-[#183A64] text-white w-full">
        <div className="max-w-[1600px] mx-auto flex justify-between items-start px-6 py-6">
          
          {/* Kiri */}
         <div className="bg-[#183A64] text-white flex items-center gap-6 px-8 py-4">
            <img
              src="/polibatam.png"
              alt="Logo Polibatam"
              className="w-14 h-14 object-contain"
            />
            {/* Kiri */}
        <div className="flex flex-col">
          <h2>ReDDa Polibatam</h2>
          <span>Pusat Repository Digital Data Akreditasi Polibatam</span>
          <span>Jurusan Informatika</span>
        </div>
          </div>

          {/* Kanan */}
          <div className="text-right">
            <p className="text-sm">
              <span className="font-semibold">Alamat:</span> Jl. Ahmad Yani Batam<br />
              Kota. Kota Batam, Kepulauan Riau, Indonesia
            </p>
            <p className="text-sm mt-4">
              <span className="font-semibold">Phone:</span> +62-778-469858 Ext.1017<br />
              <span className="font-semibold">Fax:</span> +62-778-463620<br />
              <span className="font-semibold">Email:</span> info@polibatam.ac.id
            </p>
          </div>
        </div>
      </div>

      {/* Bagian Bawah */}
      <div className="bg-[#FF7F00] text-white text-center py-2 text-sm font-medium">
        © 2025 Politeknik Negeri Batam
      </div>
    </footer>
  );
}
