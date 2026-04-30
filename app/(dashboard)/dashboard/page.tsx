import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getCurrentUser } from "@/actions/auth";
import { getKeuanganPublik, getRealisasiAnggaran } from "@/actions/keuangan";
import { getLaporanAdmin } from "@/actions/laporan";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { DashboardRealtime } from "@/components/dashboard/dashboard-realtime";
import {
  KATEGORI_LAPORAN_LABEL,
  STATUS_LAPORAN_COLOR,
  STATUS_LAPORAN_LABEL,
} from "@/lib/supabase/types";
import {
  TrendingUp, TrendingDown, Landmark,
  AlertCircle, CheckCircle2, Clock, FileText,
  ChevronRight, Activity, Users, BarChart2,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard — DESATA" };

function formatRupiah(num: number) {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)} M`;
  if (num >= 1_000_000)     return `Rp ${(num / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${num.toLocaleString("id-ID")}`;
}

function pctColor(pct: number) {
  if (pct >= 90) return "#EF4444";
  if (pct >= 70) return "#F59E0B";
  return "#1E40AF";
}

export default async function DashboardPage() {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const desaId = data.profile.desa_id;
  const tahun  = new Date().getFullYear();
  const profile = data.profile as typeof data.profile & {
    desa: { nama: string; kecamatan: string; kabupaten: string } | null;
  };

  const supabase = await createClient();

  const [
    keuangan,
    realisasi,
    laporanDiterima,
    laporanVerif,
    laporanProses,
    laporanSelesai,
    laporanSemua,
    laporanTerbaru,
    desaData,
  ] = await Promise.all([
    getKeuanganPublik({ desaId, tahun }).catch(() => null),
    getRealisasiAnggaran({ desaId, tahun }).catch(() => []),
    getLaporanAdmin({ desaId, status: "DITERIMA",     sortBy: "terbaru" }).catch(() => null),
    getLaporanAdmin({ desaId, status: "DIVERIFIKASI", sortBy: "terbaru" }).catch(() => null),
    getLaporanAdmin({ desaId, status: "DALAM_PROSES", sortBy: "terbaru" }).catch(() => null),
    getLaporanAdmin({ desaId, status: "SELESAI",      sortBy: "terbaru" }).catch(() => null),
    getLaporanAdmin({ desaId,                          sortBy: "terbaru" }).catch(() => null),
    getLaporanAdmin({ desaId, sortBy: "terbaru", page: 1 }).catch(() => null),
    supabase.from("desa")
      .select("jumlah_penduduk, jumlah_kk, luas_wilayah_ha, jumlah_rt, jumlah_rw")
      .eq("id", desaId)
      .single(),
  ]);

  const summary      = keuangan?.summary;
  const jmlDiterima  = laporanDiterima?.total ?? 0;
  const jmlProses    = (laporanVerif?.total ?? 0) + (laporanProses?.total ?? 0);
  const jmlSelesai   = laporanSelesai?.total ?? 0;
  const jmlTotal     = laporanSemua?.total ?? 0;
  const laporanList  = laporanTerbaru?.laporan ?? [];
  const desa         = desaData.data as typeof desaData.data & {
    jumlah_penduduk?: number | null;
    jumlah_kk?: number | null;
    luas_wilayah_ha?: number | null;
    jumlah_rt?: number | null;
    jumlah_rw?: number | null;
  };

  const { data: transaksiTerbaru } = await supabase
    .from("transaksi")
    .select("id, deskripsi, nominal, jenis, tanggal, kategori_program(nama, warna)")
    .eq("desa_id", desaId)
    .order("tanggal", { ascending: false })
    .limit(5);

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Dashboard"
        subtitle={`${profile.desa?.nama ?? "Desa"} · Ringkasan Operasional ${tahun}`}
      />

      <DashboardRealtime desaId={desaId} />

      <main className="flex-1 p-6 space-y-5 overflow-y-auto">

        <div
          className="relative rounded-2xl p-6 text-white overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 70%, #3B82F6 100%)" }}
        >
          <div className="absolute right-10 top-0 w-40 h-40 rounded-full opacity-10 bg-white" />
          <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full opacity-5 bg-white" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-200 mb-1">SELAMAT DATANG</p>
              <h2 className="text-xl font-bold">{profile.nama}</h2>
              <p className="text-sm text-blue-200 mt-0.5 capitalize">{profile.role.replace(/_/g, " ")} · {profile.desa?.nama}</p>
            </div>
            <div className="text-right text-xs text-blue-200 flex-shrink-0">
              <p className="font-semibold text-white">{format(new Date(), "EEEE", { locale: id })}</p>
              <p>{format(new Date(), "d MMMM yyyy", { locale: id })}</p>
            </div>
          </div>

          {desa && (desa.jumlah_penduduk || desa.jumlah_kk) && (
            <div className="flex gap-4 mt-5 flex-wrap">
              {desa.jumlah_penduduk && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                  <Users size={13} className="text-blue-200" />
                  <span className="text-xs text-white font-medium">{desa.jumlah_penduduk.toLocaleString("id-ID")} Penduduk</span>
                </div>
              )}
              {desa.jumlah_kk && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                  <Users size={13} className="text-blue-200" />
                  <span className="text-xs text-white font-medium">{desa.jumlah_kk.toLocaleString("id-ID")} KK</span>
                </div>
              )}
              {desa.luas_wilayah_ha && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                  <Activity size={13} className="text-blue-200" />
                  <span className="text-xs text-white font-medium">{Number(desa.luas_wilayah_ha).toLocaleString("id-ID")} ha</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Pemasukan", val: summary?.totalPemasukan, icon: TrendingUp,   bg: "#EFF6FF", ic: "#1E40AF" },
            { label: "Total Pengeluaran", val: summary?.totalPengeluaran, icon: TrendingDown, bg: "#FEF2F2", ic: "#EF4444" },
            { label: "Saldo Kas",        val: summary?.saldo,           icon: Landmark,    bg: "#F0FDF4", ic: "#16A34A" },
          ].map(({ label, val, icon: Icon, bg, ic }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon size={18} style={{ color: ic }} />
                </div>
                <span className="text-xs text-slate-500 font-medium">{label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: val !== undefined && val < 0 ? "#EF4444" : "#0F172A" }}>
                {val !== undefined ? formatRupiah(val) : "—"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Realisasi tahun {tahun}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total",       val: jmlTotal,    icon: FileText,     bg: "#F8FAFC", ic: "#64748B" },
            { label: "Menunggu",    val: jmlDiterima, icon: AlertCircle,  bg: "#FFFBEB", ic: "#D97706" },
            { label: "Diproses",    val: jmlProses,   icon: Clock,        bg: "#EFF6FF", ic: "#1E40AF" },
            { label: "Selesai",     val: jmlSelesai,  icon: CheckCircle2, bg: "#F0FDF4", ic: "#16A34A" },
          ].map(({ label, val, icon: Icon, bg, ic }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon size={18} style={{ color: ic }} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{val}</p>
              <p className="text-xs text-slate-500 mt-0.5">Laporan {label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5">

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={15} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-800">Realisasi Anggaran {tahun}</h2>
              </div>
              <Link href="/keuangan" className="text-xs font-medium hover:underline" style={{ color: "#1E40AF" }}>
                Detail →
              </Link>
            </div>
            <div className="p-5 space-y-4">
              {realisasi.length === 0 ? (
                <div className="text-center py-6">
                  <BarChart2 size={28} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-xs text-slate-400">Belum ada data pagu anggaran.</p>
                  <Link href="/pengaturan" className="text-xs underline mt-1 block" style={{ color: "#1E40AF" }}>
                    Set pagu anggaran →
                  </Link>
                </div>
              ) : (
                realisasi.map((r) => (
                  <div key={r.kategori_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.warna }} />
                        <span className="text-xs font-medium text-slate-700">{r.nama}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{formatRupiah(r.realisasi)}</span>
                        <span className="font-semibold" style={{ color: pctColor(r.persentase) }}>
                          {r.persentase}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${r.persentase}%`,
                          background: pctColor(r.persentase),
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Pagu: {formatRupiah(r.pagu)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-orange-500" />
                <h2 className="text-sm font-semibold text-slate-800">Laporan Terbaru</h2>
              </div>
              <Link href="/laporan" className="text-xs font-medium hover:underline" style={{ color: "#1E40AF" }}>
                Lihat semua →
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {laporanList.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText size={28} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-xs text-slate-400">Belum ada laporan masuk.</p>
                </div>
              ) : laporanList.slice(0, 5).map((lap) => (
                <Link
                  key={lap.id}
                  href={`/laporan/${lap.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-mono text-slate-400">{lap.nomor_tiket}</span>
                      <span className="text-[9px] text-slate-300">·</span>
                      <span className="text-[9px] text-slate-400">{KATEGORI_LAPORAN_LABEL[lap.kategori]}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 truncate">{lap.judul}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {format(new Date(lap.created_at), "d MMM yyyy", { locale: id })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${STATUS_LAPORAN_COLOR[lap.status]}`}>
                      {STATUS_LAPORAN_LABEL[lap.status]}
                    </span>
                    <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-500 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-800">Transaksi Terbaru</h2>
            </div>
            <Link href="/keuangan" className="text-xs font-medium hover:underline" style={{ color: "#1E40AF" }}>
              Lihat semua →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {(!transaksiTerbaru || transaksiTerbaru.length === 0) ? (
              <div className="p-8 text-center">
                <Activity size={28} className="mx-auto mb-2 text-slate-200" />
                <p className="text-xs text-slate-400">Belum ada transaksi tercatat.</p>
              </div>
            ) : transaksiTerbaru.map((t) => {
              const kat = (t as typeof t & { kategori_program?: { nama: string; warna: string } | null }).kategori_program;
              return (
                <div key={t.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: t.jenis === "pemasukan" ? "#F0FDF4" : "#FEF2F2" }}
                  >
                    {t.jenis === "pemasukan"
                      ? <TrendingUp size={14} style={{ color: "#16A34A" }} />
                      : <TrendingDown size={14} style={{ color: "#EF4444" }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{t.deskripsi}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {kat?.warna && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: kat.warna }} />
                      )}
                      <p className="text-[10px] text-slate-400">
                        {kat?.nama ?? "—"} · {format(new Date(t.tanggal), "d MMM yyyy", { locale: id })}
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-sm font-bold flex-shrink-0"
                    style={{ color: t.jenis === "pemasukan" ? "#16A34A" : "#EF4444" }}
                  >
                    {t.jenis === "pemasukan" ? "+" : "−"} {formatRupiah(t.nominal)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </>
  );
}
