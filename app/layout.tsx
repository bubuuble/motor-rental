import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import FloatingChat from "@/components/FloatingChat";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rental Motor Kukusan",
  description: "Rental Motor Terpercaya Se-Kota Depok",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <FloatingChat />
      </body>
    </html>
  );
}
