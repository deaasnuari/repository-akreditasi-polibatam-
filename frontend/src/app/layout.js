import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});


export const metadata = {
  title: "Repository Digital Data Akreditasi Polibatam",
  description: "Sistem Repository Akreditasi POLIBATAM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
