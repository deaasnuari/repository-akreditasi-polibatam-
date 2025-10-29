import Image from "next/image";
import { Shield, Search, Clock, Users, FolderOpen, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-white pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#183A64] mb-6">
              Selamat Datang di Sistem Informasi Akreditasi & Repositori Digital Polibatam
            </h1>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Platform terpusat untuk mengelola, menyimpan, dan mengakses seluruh dokumen akreditasi institusi dan program studi di Politeknik Negeri Batam secara digital dan terstruktur.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-[#183A64]">500+</div>
                <div className="text-sm text-gray-600">Dokumen</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#183A64]">15+</div>
                <div className="text-sm text-gray-600">Program Studi</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#183A64]">100%</div>
                <div className="text-sm text-gray-600">Digital</div>
              </div>
            </div>
          </div>
          <div className="relative h-64 md:h-96">
            <Image
              src="/KampusPolibatam.png"
              alt="Politeknik Negeri Batam"
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-200 py-20 px-4 md:px-8 mt-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-gray-400 text-white px-6 py-2 rounded-full text-sm mb-4">
              Fitur Unggulan
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Solusi Lengkap untuk Manajemen Data Akreditasi
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Platform yang dirancang khusus untuk memenuhi kebutuhan pengelolaan dokumen akreditasi dengan fitur-fitur yang komprehensif dan mudah digunakan.
            </p>
          </div>

          {/* Grid Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Keamanan Terjamin
              </h3>
              <p className="text-sm text-gray-600">
                Sistem keamanan berlapis dengan enkripsi data dan kontrol akses berbasis role untuk menjaga kerahasiaan dokumen penting.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Pencarian Cepat
              </h3>
              <p className="text-sm text-gray-600">
                Temukan dokumen yang Anda butuhkan dengan mudah menggunakan fitur pencarian dan filter yang canggih.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Akses 24/7
              </h3>
              <p className="text-sm text-gray-600">
                Akses dokumen kapanpun, di mana saja dengan koneksi internet yang stabil.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Kolaborasi Tim
              </h3>
              <p className="text-sm text-gray-600">
                Memudahkan tim akreditasi untuk berkolaborasi dalam pengelolaan dan pembahasan dokumen.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Manajemen Dokumen
              </h3>
              <p className="text-sm text-gray-600">
                Organisasi dokumen yang terstruktur dengan kategori, tag, dan versioning yang sistematis.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 ease-out cursor-pointer min-h-[280px]">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Laporan & Analitik
              </h3>
              <p className="text-sm text-gray-600">
                Dashboard analitik untuk memonitor status dan progres akreditasi secara real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <span className="inline-block bg-gray-400 text-white px-6 py-2 rounded-full text-sm">
              Tentang Sistem
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Repositori Digital yang Mendukung Akreditasi Berkualitas
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                ReDDA (Repositori Digital Data Akreditasi) Polibatam adalah platform digital yang dikembangkan untuk mendukung pengelolaan data dan dokumen akreditasi secara terpusat, efisien, dan terstruktur.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Dengan sistem ini, seluruh stakeholder dapat mengakses informasi akreditasi dengan mudah, memastikan kualitas pendidikan yang berkelanjutan di Politeknik Negeri Batam.
              </p>

              <div className="space-y-3">
                {[
                  "Pengelolaan dokumen yang terorganisir dan mudah diakses",
                  "Meningkatkan efisiensi proses akreditasi institusi",
                  "Transparansi dan akuntabilitas data akreditasi",
                  "Mempercepat proses verifikasi dan validasi dokumen",
                  "Backup otomatis dan keamanan data terjamin",
                  "Mendukung akreditasi berkelanjutan",
                ].map((text, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-gray-700 text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              {/* Stats Card 1 */}
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
                <div className="text-sm text-gray-700 font-medium mb-1">
                  Program Studi Terakreditasi
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-4">99.9%</div>
                <div className="text-sm text-gray-700">Uptime Sistem</div>
              </div>

              {/* Stats Card 2 */}
              <div className="bg-green-50 rounded-lg p-8 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-sm text-gray-700 font-medium mb-1">
                  Dokumen Digital
                </div>
                <div className="text-2xl font-bold text-orange-500 mt-4">24/7</div>
                <div className="text-sm text-gray-700">Akses Tanpa Henti</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
