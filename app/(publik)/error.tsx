"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function PublikError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Publik Error]", error);
  }, [error]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          Halaman Tidak Dapat Dimuat
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Terjadi kendala saat mengambil data. Periksa koneksi internet Anda
          dan coba lagi.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 font-mono mb-4 bg-slate-50 rounded-lg px-3 py-2">
            Kode: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: "#1E40AF" }}
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
          <Link
            href="/beranda"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            <Home size={14} />
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
