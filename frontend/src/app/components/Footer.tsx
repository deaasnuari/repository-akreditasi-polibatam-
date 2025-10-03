export default function Footer() {
  return (
    <footer className="bg-[#0A2F56] text-white mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-6 gap-6">
        {/* Kiri */}
        <div className="flex items-start gap-4">
          {/* Logo */}
          <img
            src="/Polibatam.png"
            alt="Logo"
            className="h-14 w-14 object-contain"
          />

          {/* Teks */}
          <div>
            <p className="text-sm font-semibold">
              Pusat Repository Digital Data Akreditasi Polibatam <br />
              Jurusan Informatika
            </p>
            <p className="text-xs mt-2">
              Alamat: Jl Ahmad Yani Batam Kota, Kota Batam Kepulauan Riau, Indonesia
            </p>
          </div>
        </div>

        {/* Kanan */}
        <div className="flex gap-6 font-semibold">
          <a href="#" className="hover:underline text-orange-400">
            About
          </a>
          <a href="#" className="hover:underline text-orange-400">
            Support
          </a>
        </div>
      </div>

      <div className="bg-orange-500 text-center text-xs py-2">
        © 2025 Politeknik Negeri Batam
      </div>
    </footer>
  );
}
