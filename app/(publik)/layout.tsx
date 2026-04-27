import Link from "next/link";

export default function PublikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar publik — tidak ada auth check di sini */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/beranda" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">DESATA</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/transparansi"
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
            >
              Transparansi
            </Link>
            <Link
              href="/lapor"
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
            >
              Lapor
            </Link>
            <Link
              href="/cek-laporan"
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
            >
              Cek Status
            </Link>
            <Link
              href="/login"
              className="ml-2 px-4 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-100 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} DESATA — Desa Kita, Data Kita, Masa Depan Kita.
        </div>
      </footer>
    </div>
  );
}