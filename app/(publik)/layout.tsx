import Link from "next/link";

export default function PublikLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          <Link href="/beranda" className="flex items-center flex-shrink-0">
            <img src="/logo-nav.svg" alt="DESATA" className="h-9" />
          </Link>

          <nav className="flex items-center gap-1">
            {[
              { href: "/beranda",      label: "Beranda" },
              { href: "/transparansi", label: "Transparansi" },
              { href: "/cek-laporan",  label: "Cek Status" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition"
              >
                {label}
              </Link>
            ))}

            <div className="w-px h-5 bg-slate-200 mx-2" />

            <Link
              href="/lapor?tab=buat"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition border border-blue-100 text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              Kirim Laporan
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 ml-1 px-4 py-2 text-sm font-semibold text-white rounded-xl transition hover:opacity-90"
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
