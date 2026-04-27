"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  STATUS_LAPORAN_LABEL,
  KATEGORI_LAPORAN_LABEL,
  type LaporanWarga,
  type LaporanStatusLog,
} from "@/lib/supabase/types";

type LaporanPublik = Omit<LaporanWarga, "email_pelapor" | "wa_pelapor" | "ip_address"> & {
  laporan_status_log: (LaporanStatusLog & {
    user_profiles: { nama: string } | null;
  })[];
};

interface Props {
  initialTiket?: string;
  laporan: LaporanPublik | null;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  DITERIMA: <AlertCircle size={16} className="text-slate-500" />,
  DIVERIFIKASI: <Loader2 size={16} className="text-blue-500" />,
  DALAM_PROSES: <Clock size={16} className="text-amber-500" />,
  SELESAI: <CheckCircle2 size={16} className="text-emerald-500" />,
  DITOLAK: <XCircle size={16} className="text-red-500" />,
};

const STATUS_BG: Record<string, string> = {
  DITERIMA: "bg-slate-100 text-slate-700",
  DIVERIFIKASI: "bg-blue-100 text-blue-700",
  DALAM_PROSES: "bg-amber-100 text-amber-700",
  SELESAI: "bg-emerald-100 text-emerald-700",
  DITOLAK: "bg-red-100 text-red-700",
};

export function CekLaporanClient({ initialTiket, laporan }: Props) {
  const router = useRouter();
  const [tiket, setTiket] = useState(initialTiket ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!tiket.trim()) return;
    router.push(`/cek-laporan?tiket=${tiket.trim().toUpperCase()}`);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={tiket}
          onChange={(e) => setTiket(e.target.value.toUpperCase())}
          placeholder="Contoh: DES-20250415-0001"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-2 text-sm font-medium"
        >
          <Search size={15} />
          Cari
        </button>
      </form>

      {initialTiket && !laporan && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
          <XCircle size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">Laporan tidak ditemukan</p>
          <p className="text-sm text-slate-400 mt-1">
            Periksa kembali nomor tiket Anda.
          </p>
        </div>
      )}

      {laporan && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-mono text-slate-400">{laporan.nomor_tiket}</p>
                <h2 className="font-semibold text-slate-800 mt-0.5">{laporan.judul}</h2>
              </div>
              <span className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ${STATUS_BG[laporan.status]}`}>
                {STATUS_ICON[laporan.status]}
                {STATUS_LAPORAN_LABEL[laporan.status]}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                {KATEGORI_LAPORAN_LABEL[laporan.kategori]}
              </span>
              <span>·</span>
              <span>
                Dikirim {format(new Date(laporan.created_at), "d MMMM yyyy", { locale: id })}
              </span>
              {!laporan.is_anonim && laporan.nama_pelapor && (
                <>
                  <span>·</span>
                  <span>oleh {laporan.nama_pelapor}</span>
                </>
              )}
            </div>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{laporan.deskripsi}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Riwayat Status</h3>
            <div className="space-y-4">
              {laporan.laporan_status_log.length > 0 ? (
                laporan.laporan_status_log.map((log, i) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${STATUS_BG[log.status_baru]}`}>
                        {STATUS_ICON[log.status_baru]}
                      </div>
                      {i < laporan.laporan_status_log.length - 1 && (
                        <div className="w-px flex-1 bg-slate-100 mt-1" />
                      )}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-sm font-medium text-slate-700">
                        {STATUS_LAPORAN_LABEL[log.status_baru]}
                      </p>
                      {log.catatan && (
                        <p className="text-xs text-slate-500 mt-0.5">{log.catatan}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(log.created_at), "d MMM yyyy, HH:mm", { locale: id })}
                        {log.user_profiles?.nama && ` · ${log.user_profiles.nama}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${STATUS_BG.DITERIMA}`}>
                    {STATUS_ICON.DITERIMA}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Laporan Diterima</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(laporan.created_at), "d MMM yyyy, HH:mm", { locale: id })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}