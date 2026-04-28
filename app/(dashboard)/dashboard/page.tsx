import type { Metadata } from "next";
import { TopBar } from "@/components/layout/top-bar";
import { getCurrentUser } from "@/actions/auth";
import { getKeuanganPublik } from "@/actions/keuangan";
import { getLaporanAdmin } from "@/actions/laporan";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Landmark,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  KATEGORI_LAPORAN_LABEL,
  STATUS_LAPORAN_COLOR,
  STATUS_LAPORAN_LABEL,
} from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Dashboard" };

function formatRupiah(num: number) {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export default async function DashboardPage() {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const desaId = data.profile.desa_id;
  const tahun = new Date().getFullYear();

  const [keuangan, semuaLaporan, laporanTerbaru] = await Promise.all([
    getKeuanganPublik({ desaId, tahun }).catch(() => null),
    Promise.all([
      getLaporanAdmin({ desaId, status: "DITERIMA",     sortBy: "terbaru" }).catch(() => null),
      getLaporanAdmin({ desaId, status: "DIVERIFIKASI", sortBy: "terbaru" }).catch(() => null),
      getLaporanAdmin({ desaId, status: "DALAM_PROSES", sortBy: "terbaru" }).catch(() => null),
      getLaporanAdmin({ desaId, status: "SELESAI",      sortBy: "terbaru" }).catch(() => null),
      getLaporanAdmin({ desaId,                          sortBy: "terbaru" }).catch(() => null),
    ]),
    getLaporanAdmin({ desaId, sortBy: "terbaru", page: 1 }).catch(() => null),
  ]);

  const [diterima, diverifikasi, dalamProses, selesai, semua] = semuaLaporan;

  const summary = keuangan?.summary;
  const laporanBaru    = diterima?.total ?? 0;
  const laporanProses  = (diverifikasi?.total ?? 0) + (dalamProses?.total ?? 0);
  const laporanSelesai = selesai?.total ?? 0;
  const totalLaporan   = semua?.total ?? 0;
  const laporanList    = laporanTerbaru?.laporan ?? [];

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Dashboard"
        subtitle={`Ringkasan data ${profile.desa?.nama ?? "Desa"} — ${tahun}`}
      />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Pemasukan", val: summary?.totalPemasukan, icon: TrendingUp, bg: "bg-blue-50", ic: "text-blue-600" },
            { label: "Total Pengeluaran", val: summary?.totalPengeluaran, icon: TrendingDown, bg: "bg-red-50", ic: "text-red-500" },
            { label: "Saldo", val: summary?.saldo, icon: Landmark, bg: "bg-blue-50", ic: "text-blue-600" },
          ].map(({ label, val, icon: Icon, bg, ic }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className={`flex items-center gap-3 mb-3`}>
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={18} className={ic} />
                </div>
                <span className="text-sm text-slate-500">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${val !== undefined && val < 0 ? "text-red-600" : "text-slate-800"}`}>
                {val !== undefined ? formatRupiah(val) : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-1">Tahun {tahun}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Laporan",  value: totalLaporan,   icon: FileText,      color: "bg-slate-50 text-slate-600" },
            { label: "Laporan Baru",   value: laporanBaru,    icon: AlertCircle,   color: "bg-amber-50 text-amber-600" },
            { label: "Dalam Proses",   value: laporanProses,  icon: Clock,         color: "bg-blue-50 text-blue-600" },
            { label: "Selesai",        value: laporanSelesai, icon: CheckCircle2,  color: "bg-emerald-50 text-emerald-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Laporan Terbaru</h2>
            <Link href="/laporan" className="text-xs hover:underline" style={{ color: "#1E40AF" }}>
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {laporanList.slice(0, 5).map((lap) => (
              <Link
                key={lap.id}
                href={`/laporan/${lap.id}`}
                className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition block"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-400">{lap.nomor_tiket}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-400">
                      {KATEGORI_LAPORAN_LABEL[lap.kategori]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 truncate">{lap.judul}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {format(new Date(lap.created_at), "d MMM yyyy", { locale: id })}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 text-[10px] font-medium px-2 py-1 rounded-full ${
                    STATUS_LAPORAN_COLOR[lap.status]
                  }`}
                >
                  {STATUS_LAPORAN_LABEL[lap.status]}
                </span>
              </Link>
            ))}

            {laporanList.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                Belum ada laporan masuk.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}