import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";


const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SportSurf India — Sports Surfaces & Infrastructure",
  description: "India's leading sports surface and infrastructure company. Specializing in surface sports, water sports, sports academies, and play zones.",
  keywords: ["synthetic turf India", "sports infrastructure India", "sports academies India"],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F9F7F4",
  width: "device-width",
  initialScale: 1,
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-ag-bg text-ag-text font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
