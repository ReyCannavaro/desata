"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { updateStatusLaporanAction } from "@/actions/laporan";
import {
  STATUS_LAPORAN_LABEL,
  STATUS_LAPORAN_COLOR,
  type StatusLaporan,
  type LaporanStatusLog,
  type UserProfile,
} from "@/lib/supabase/types";
import { CheckCircle2, AlertCircle, Clock, XCircle, Loader2 } from "lucide-react";

type LogWithUser = LaporanStatusLog & {
  user_profiles: Pick<UserProfile, "nama"> | null;
};

interface Props {
  laporanId: string;
  currentStatus: StatusLaporan;
  statusLog: LogWithUser[];
}

const STATUS_ICON: Record<StatusLaporan, React.ReactNode> = {
  DITERIMA: <AlertCircle size={14} className="text-slate-500" />,
  DIVERIFIKASI: <Loader2 size={14} className="text-blue-500" />,
  DALAM_PROSES: <Clock size={14} className="text-amber-500" />,
  SELESAI: <CheckCircle2 size={14} className="text-blue-500" />,
  DITOLAK: <XCircle size={14} className="text-red-500" />,
};

// Status yang dapat dipilih admin berdasarkan status saat ini
const ALLOWED_TRANSITIONS: Record<StatusLaporan, StatusLaporan[]> = {
  DITERIMA: ["DIVERIFIKASI", "DITOLAK"],
  DIVERIFIKASI: ["DALAM_PROSES", "DITOLAK"],
  DALAM_PROSES: ["SELESAI", "DITOLAK"],
  DITOLAK: [],
  SELESAI: [],
};

export function LaporanDetailAdmin({ laporanId, currentStatus, statusLog }: Props) {
  const [status, setStatus] = useState<StatusLaporan>(currentStatus);
  const [catatan, setCatatan] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusLaporan | "">("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allowed = ALLOWED_TRANSITIONS[status];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus) return;
    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const result = await updateStatusLaporanAction(laporanId, {
        status: selectedStatus,
        catatan: catatan || undefined,
      });

      if (result.success) {
        setStatus(selectedStatus);
        setSelectedStatus("");
        setCatatan("");
        setSuccessMsg(`Status berhasil diubah ke "${STATUS_LAPORAN_LABEL[selectedStatus]}".`);
      } else {
        setError(result.error ?? "Gagal memperbarui status.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Perbarui Status Laporan</h3>

        {allowed.length === 0 ? (
          <div className="flex items-center gap-2 py-3 text-sm text-slate-500">
            <CheckCircle2 size={16} className={status === "SELESAI" ? "text-blue-500" : "text-red-400"} />
            Laporan ini sudah berstatus <strong>{STATUS_LAPORAN_LABEL[status]}</strong> dan tidak dapat diubah lagi.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {allowed.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl border text-left transition ${
                    selectedStatus === s
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {STATUS_ICON[s]}
                    <span className="text-xs font-medium text-slate-700">{STATUS_LAPORAN_LABEL[s]}</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedStatus && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Catatan / Alasan{" "}
                  {selectedStatus === "DITOLAK" ? (
                    <span className="text-red-500">*wajib untuk penolakan</span>
                  ) : (
                    "(opsional)"
                  )}
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  required={selectedStatus === "DITOLAK"}
                  maxLength={500}
                  placeholder={
                    selectedStatus === "DITOLAK"
                      ? "Jelaskan alasan penolakan laporan ini..."
                      : "Tambahkan catatan untuk warga (opsional)..."
                  }
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-[11px] text-slate-400 text-right">{catatan.length}/500</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <XCircle size={14} />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <CheckCircle2 size={14} />
                {successMsg}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!selectedStatus || isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition disabled:opacity-50"
                style={{ background: selectedStatus ? "#1E40AF" : undefined }}
              >
                {isPending ? "Menyimpan..." : "Simpan Perubahan Status"}
              </button>
              {selectedStatus && (
                <button
                  type="button"
                  onClick={() => { setSelectedStatus(""); setCatatan(""); }}
                  className="px-4 py-2.5 rounded-xl text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Riwayat Status</h3>

        {statusLog.length === 0 ? (
          <div className="flex gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${STATUS_LAPORAN_COLOR.DITERIMA}`}>
              {STATUS_ICON.DITERIMA}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Laporan Diterima</p>
              <p className="text-xs text-slate-400 mt-0.5">Sistem</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {statusLog.map((log, i) => (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      STATUS_LAPORAN_COLOR[log.status_baru]
                    }`}
                  >
                    {STATUS_ICON[log.status_baru]}
                  </div>
                  {i < statusLog.length - 1 && (
                    <div className="w-px flex-1 bg-slate-100 mt-1" />
                  )}
                </div>
                <div className="pb-4 min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    {STATUS_LAPORAN_LABEL[log.status_baru]}
                  </p>
                  {log.catatan && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{log.catatan}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(log.created_at), "d MMM yyyy, HH:mm", { locale: id })}
                    {log.user_profiles?.nama && ` · ${log.user_profiles.nama}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}