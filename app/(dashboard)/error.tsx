"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          Terjadi Kesalahan
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Halaman gagal dimuat. Ini bisa terjadi karena koneksi terputus atau
          server sedang bermasalah.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 font-mono mb-4 bg-slate-50 rounded-lg px-3 py-2">
            Kode: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: "#1E40AF" }}
        >
          <RefreshCw size={14} />
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
