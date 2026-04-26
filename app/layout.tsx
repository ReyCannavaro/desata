import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "DESATA — Desa yang Tertata",
    template: "%s | DESATA",
  },
  description:
    "Platform transparansi keuangan dan aspirasi masyarakat desa. Wujudkan desa yang transparan, akuntabel, dan responsif.",
  keywords: ["dana desa", "transparansi", "APBDes", "laporan warga", "e-government"],
  authors: [{ name: "Tim DESATA — SMK Telkom Sidoarjo" }],
  openGraph: {
    title: "DESATA — Desa yang Tertata",
    description: "Platform transparansi keuangan dan aspirasi masyarakat desa",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}