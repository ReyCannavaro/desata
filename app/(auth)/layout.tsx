import React from "react";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#DBEAFE" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <img src="/logo.svg" alt="DESATA" className="w-9 h-10" />
            <div className="text-left">
              <p className="text-xl font-bold leading-none" style={{ color: "#1E3A8A" }}>DESATA</p>
              <p className="text-[10px] leading-tight" style={{ color: "#1E40AF" }}>Desa Kita, Data Kita, Masa Depan Kita.</p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}