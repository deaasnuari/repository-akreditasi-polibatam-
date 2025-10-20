import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Repository Digital Data Akreditasi Polibatam",
  description: "Sistem Repository Akreditasi POLIBATAM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans`}>
      <body className="flex flex-col min-h-screen bg-white antialiased">
        {/* Navbar tetap di atas */}
        <Navbar />

        {/* Isi halaman */}
        <main className="flex-1 flex items-center justify-center px-4 pt-20">
          {children}
        </main>

        {/* Footer tetap di bawah */}
        <Footer />
      </body>
    </html>
  );
}
