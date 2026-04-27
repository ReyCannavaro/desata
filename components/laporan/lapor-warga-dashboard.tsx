"use client";
import { useState } from "react";
import { Plus, ThumbsUp, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

type Status = "DITERIMA" | "DIVERIFIKASI" | "DALAM_PROSES" | "DITOLAK" | "SELESAI";
type Kategori = "INF" | "KES" | "PDD" | "LNG" | "PLY" | "KAM" | "LNY";

const STATUS_MAP: Record<Status, { label: string; bg: string; color: string }> = {
  DITERIMA:     { label: "Menunggu",  bg: "#F1F5F9", color: "#475569" },
  DIVERIFIKASI: { label: "Menunggu",  bg: "#F1F5F9", color: "#475569" },
  DALAM_PROSES: { label: "Diproses",  bg: "#FEF3C7", color: "#92400E" },
  DITOLAK:      { label: "Ditolak",   bg: "#FEE2E2", color: "#991B1B" },
  SELESAI:      { label: "Selesai",   bg: "#D1FAE5", color: "#065F46" },
};

const KATEGORI_MAP: Record<Kategori, string> = {
  INF: "Infrastruktur", KES: "Kesehatan", PDD: "Pendidikan",
  LNG: "Lingkungan", PLY: "Pelayanan", KAM: "Keamanan", LNY: "Lainnya",
};

const STEPS: Status[] = ["DITERIMA", "DIVERIFIKASI", "DALAM_PROSES", "SELESAI"];
const STEP_LABELS = ["Diterima", "Diverifikasi", "Diproses", "Selesai"];

function StatusStepper({ current }: { current: Status }) {
  const idx = current === "DITOLAK" ? -1 : STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1 flex-wrap mt-3">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        return (
          <div key={s} className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: done ? "#10B981" : "#E2E8F0" }}>
                {done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
              </div>
              <span className="text-[10px]" style={{ color: done ? "#059669" : "#94A3B8" }}>{STEP_LABELS[i]}</span>
            </div>
            {i < STEPS.length - 1 && (
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="flex-shrink-0">
                <path d="M1 4H11M11 4L8 1M11 4L8 7" stroke={done && i < idx ? "#10B981" : "#CBD5E1"} strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "waiting", label: "Menunggu" },
  { key: "process", label: "Diproses" },
  { key: "done", label: "Selesai" },
];

export function LaporWargaDashboard({ laporan, userId }: { laporan: Record<string, unknown>[]; userId: string }) {
  const [filter, setFilter] = useState("all");

  const filtered = laporan.filter((l) => {
    const s = l.status as Status;
    if (filter === "waiting") return ["DITERIMA", "DIVERIFIKASI"].includes(s);
    if (filter === "process") return s === "DALAM_PROSES";
    if (filter === "done") return s === "SELESAI";
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Lapor Warga</h1>
          <p className="text-sm text-slate-500">Sampaikan keluhan & kerusakan fasilitas desa</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
            style={{ background: "#1E40AF" }}>
            <Plus size={15} />Buat Laporan
          </button>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 transition">
            <Bell size={18} className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-5 py-2 rounded-full text-sm font-medium transition"
              style={filter === key
                ? { background: "#1E40AF", color: "#fff" }
                : { background: "#fff", color: "#475569", border: "1px solid #E2E8F0" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">Tidak ada laporan ditemukan</div>
          ) : filtered.map((l) => {
            const status = STATUS_MAP[l.status as Status] ?? STATUS_MAP.DITERIMA;
            const kategori = KATEGORI_MAP[l.kategori as Kategori] ?? String(l.kategori);
            const waktu = formatDistanceToNow(new Date(l.created_at as string), { locale: id, addSuffix: true });
            const pelapor = l.is_anonim ? "Anonim" : ((l.nama_pelapor as string) ?? "Warga");
            return (
              <div key={l.id as string} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-sm transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#EFF6FF", color: "#1E40AF" }}>{kategori}</span>
                    <span className="text-xs text-slate-400">{waktu}</span>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: status.bg, color: status.color }}>{status.label}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{l.judul as string}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{l.deskripsi as string}</p>
                <StatusStepper current={l.status as Status} />
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                    style={{ background: "#FEF3C7", color: "#92400E" }}>
                    <ThumbsUp size={12} />{l.upvote_count as number} Dukung
                  </button>
                  <p className="text-xs text-slate-400">
                    Dilaporkan oleh <span className="font-semibold text-slate-600">{pelapor}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}