'use client';

import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Footer() {
  return (
    <footer id="kontak" className={`mt-10 w-full ${poppins.className}`}>

      {/* === BAGIAN ATAS (kembali ke struktur awal) === */}
      <div className="bg-[#183A64] text-white w-full">
        <div className="max-w-[1600px] mx-auto flex justify-between items-start px-6 py-6">

          {/* === KIRI: LOGO & TEKS === */}
          <div className="flex items-center gap-6 px-8 py-4">
            <img
              src="/Polibatam.png"
              alt="Logo Polibatam"
              className="w-14 h-14 object-contain"
            />

            <div className="flex flex-col">
              <h2 className="text-lg md:text-xl font-semibold tracking-wide text-white">ReDDA Polibatam</h2>
              <span className="text-white/90">Pusat Repository Digital Data Akreditasi Polibatam</span>
              <span className="text-white/80">Jurusan Informatika</span>
            </div>
          </div>

          {/* === KANAN: INFORMASI KONTAK === */}
          <div className="text-right">
            <p className="text-sm text-white/90">
              <span className="font-semibold">Alamat:</span> Jl. Ahmad Yani Batam<br />
              Kota. Kota Batam, Kepulauan Riau, Indonesia
            </p>

            <p className="text-sm mt-4 text-white/90">
              <span className="font-semibold">Phone:</span> <a href="tel:+62778469858" className="hover:text-white transition-colors">+62-778-469858 Ext.1017</a><br />
              <span className="font-semibold">Fax:</span> <span className="text-white/80">+62-778-463620</span><br />
              <span className="font-semibold">Email:</span> <a href="mailto:info@polibatam.ac.id" className="hover:text-white transition-colors">info@polibatam.ac.id</a>
            </p>
          </div>

        </div>
      </div>

      {/* === BAGIAN BAWAH === */}
      <div className="bg-[#FF7F00] text-white text-center py-2 text-sm font-semibold tracking-wide">
        © 2025 Politeknik Negeri Batam
      </div>

    </footer>
  );
}
