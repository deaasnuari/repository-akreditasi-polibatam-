import "./globals.css";
import { Poppins, Irish_Grover } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

const irishGrover = Irish_Grover({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-irish-grover",
});

export const metadata = {
  title: "Repository Digital Data Akreditasi Polibatam",
  description: "Sistem Repository Akreditasi POLIBATAM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${irishGrover.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
