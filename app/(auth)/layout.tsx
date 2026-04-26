export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">D</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">DESATA</span>
          </div>
          <p className="text-sm text-slate-500">Desa Kita, Data Kita, Masa Depan Kita.</p>
        </div>
        {children}
      </div>
    </main>
  );
}
