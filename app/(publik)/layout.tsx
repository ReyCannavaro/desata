import Link from "next/link";

export default function PublikLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <Link href="/beranda" className="flex items-center">
            <img src="/logo-nav.svg" alt="DESATA" className="h-8" />
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/transparansi"
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-blue-50 rounded-lg transition"
            >
              Transparansi
            </Link>
            <Link
              href="/lapor"
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-blue-50 rounded-lg transition"
            >
              Lapor
            </Link>
            <Link
              href="/cek-laporan"
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-blue-50 rounded-lg transition"
            >
              Cek Status
            </Link>
            <Link
              href="/login"
              className="ml-3 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ background: "#1E40AF" }}
            >
              Login Perangkat Desa
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-100 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/logo-nav.svg" alt="DESATA" className="h-7 opacity-70" />
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DESATA — Desa Kita, Data Kita, Masa Depan Kita.
          </p>
        </div>
      </footer>
    </div>
  );
}