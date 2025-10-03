import React from "react";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata = {
  title: "Repository Digital Data Akreditasi",
  description: "Politeknik Negeri Batam",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-white">
        {/* Navbar fixed di atas */}
        <Navbar />

        {/* Konten utama otomatis isi layar */}
        <main className="flex-1 flex items-center justify-center px-4 pt-20">
          {children}
        </main>

        {/* Footer tetap di bawah */}
        <Footer />
      </body>
    </html>
  );
}
