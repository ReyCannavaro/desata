import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, FileText, Search, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Beranda — DESATA",
  description: "Platform transparansi keuangan dan aspirasi masyarakat desa.",
};

const FITUR = [
  {
    icon: BarChart3,
    title: "Transparansi Keuangan",
    desc: "Lihat detail seluruh pemasukan dan pengeluaran dana desa secara real-time.",
    href: "/transparansi",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: FileText,
    title: "Lapor Masalah",
    desc: "Sampaikan keluhan, aspirasi, atau masalah di desa Anda dengan mudah.",
    href: "/lapor",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Search,
    title: "Cek Status Laporan",
    desc: "Pantau perkembangan laporan yang sudah Anda kirimkan menggunakan nomor tiket.",
    href: "/cek-laporan",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Shield,
    title: "Akuntabel & Aman",
    desc: "Data keuangan terverifikasi langsung oleh perangkat desa yang bertanggung jawab.",
    href: "/transparansi",
    color: "bg-amber-50 text-amber-600",
  },
];

export default function BerandaPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-emerald-700 font-medium">Platform Transparansi Desa</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 leading-tight">
          Desa Kita, Data Kita,
          <br />
          <span className="text-emerald-600">Masa Depan Kita</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          DESATA hadir untuk membuka akses informasi keuangan desa dan
          memperkuat suara warga dalam pembangunan.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/transparansi"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition text-sm"
          >
            Lihat Keuangan Desa
          </Link>
          <Link
            href="/lapor"
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition text-sm"
          >
            Kirim Laporan
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-center text-xl font-semibold text-slate-800 mb-8">
          Apa yang bisa kamu lakukan?
        </h2>
        <div className="grid grid-cols-2 gap-5">
          {FITUR.map(({ icon: Icon, title, desc, href, color }) => (
            <Link
              key={title}
              href={href}
              className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-emerald-600 transition">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-emerald-600 rounded-3xl p-10 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Sudah melapor?</h2>
        <p className="text-emerald-100 text-sm mb-6">
          Pantau perkembangan laporan Anda menggunakan nomor tiket.
        </p>
        <Link
          href="/cek-laporan"
          className="inline-block px-6 py-3 bg-white text-emerald-700 font-medium rounded-xl text-sm hover:bg-emerald-50 transition"
        >
          Cek Status Laporan →
        </Link>
      </section>
    </div>
  );
}