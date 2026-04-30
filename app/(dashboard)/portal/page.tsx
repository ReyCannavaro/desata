import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import { getLaporanAdmin } from "@/actions/laporan";
import { TopBar } from "@/components/layout/top-bar";
import { createClient } from "@/lib/supabase/server";
import {
  Users, Home, Map, Building2,
  Eye, Target, Zap, Bell,
} from "lucide-react";

export const metadata: Metadata = { title: "Beranda" };

const DOT_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

export default async function BerandaAdminPage() {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const tahun = new Date().getFullYear();
  const profile = data.profile as typeof data.profile & {
    desa: { nama: string; kecamatan: string; kabupaten: string; provinsi: string } | null;
  };

  const supabase = await createClient();

  const { data: desaData } = await supabase
    .from("desa")
    .select("jumlah_penduduk, jumlah_kk, luas_wilayah_ha, jumlah_dusun, jumlah_rw, jumlah_rt, visi, misi")
    .eq("id", profile.desa_id)
    .single();

  const desa = desaData as typeof desaData & {
    jumlah_penduduk?: number | null;
    jumlah_kk?: number | null;
    luas_wilayah_ha?: number | null;
    jumlah_dusun?: number | null;
    jumlah_rw?: number | null;
    jumlah_rt?: number | null;
    visi?: string | null;
    misi?: string[] | null;
  };

  let pengumuman: { id: string; judul: string; isi: string; created_at: string }[] = [];
  try {
    const { data: pData } = await supabase
      .from("pengumuman" as never)
      .select("id, judul, isi, created_at")
      .eq("desa_id", profile.desa_id)
      .eq("aktif", true)
      .order("created_at", { ascending: false })
      .limit(5) as { data: typeof pengumuman | null };
    pengumuman = pData ?? [];
  } catch { }

  const laporanResult = await getLaporanAdmin({
    desaId: profile.desa_id,
    status: "DITERIMA",
    sortBy: "terbaru",
  }).catch(() => ({ laporan: [], total: 0 }));

  const laporanBaru = laporanResult.total;

  const statPenduduk = desa?.jumlah_penduduk ? desa.jumlah_penduduk.toLocaleString("id-ID") : "—";
  const statKK = desa?.jumlah_kk ? desa.jumlah_kk.toLocaleString("id-ID") : "—";
  const statLuas = desa?.luas_wilayah_ha ? `${Number(desa.luas_wilayah_ha).toLocaleString("id-ID")} ha` : "—";

  const wilayahParts = [];
  if (desa?.jumlah_dusun) wilayahParts.push(`${desa.jumlah_dusun} Dusun`);
  if (desa?.jumlah_rw) wilayahParts.push(`${desa.jumlah_rw} RW`);
  if (desa?.jumlah_rt) wilayahParts.push(`${desa.jumlah_rt} RT`);
  const statWilayah = wilayahParts.length > 0 ? wilayahParts.join(" · ") : "—";

  const visi = desa?.visi ?? "Terwujudnya desa yang mandiri, transparan, dan berdaya saing berbasis potensi lokal.";
  const misiList: string[] = desa?.misi ?? [
    "Meningkatkan kualitas infrastruktur dan pelayanan publik",
    "Mendorong transparansi pengelolaan keuangan desa",
    "Memberdayakan masyarakat melalui program ekonomi kreatif",
  ];

  const lokasi = [profile.desa?.kecamatan, profile.desa?.kabupaten, profile.desa?.provinsi]
    .filter(Boolean).join(", ");

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Beranda"
        subtitle={`Selamat datang di Portal ${profile.desa?.nama ?? "Desa"}`}
      />
      <main className="flex-1 p-6 space-y-5">

        <div className="relative rounded-2xl overflow-hidden p-7 text-white" style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 60%, #3B82F6 100%)" }}>
          <div className="absolute right-16 top-4 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="absolute right-6 top-10 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
          <p className="text-xs font-semibold tracking-widest mb-3 flex items-center gap-1.5" style={{ color: "#BFDBFE" }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#34D399" }} />
            PORTAL RESMI DESA
          </p>
          <h2 className="text-3xl font-bold mb-1">{profile.desa?.nama ?? "Desa"}</h2>
          {lokasi && <p className="text-sm mb-3" style={{ color: "#BFDBFE" }}>{lokasi}</p>}
          <p className="text-sm leading-relaxed mb-5 max-w-md" style={{ color: "#DBEAFE" }}>
            Berkomitmen mewujudkan pemerintahan yang transparan, akuntabel, dan partisipatif demi kesejahteraan seluruh warga.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users,     v: statPenduduk, label: "Jumlah Penduduk",      sub: "Data terkini", ic: "#3B82F6", ib: "#EFF6FF" },
            { icon: Home,      v: statKK,       label: "Kepala Keluarga",       sub: "Data terkini", ic: "#3B82F6", ib: "#EFF6FF" },
            { icon: Map,       v: statLuas,     label: "Luas Wilayah",          sub: "Data wilayah", ic: "#F59E0B", ib: "#FFFBEB" },
            { icon: Building2, v: statWilayah,  label: "Wilayah Administrasi",  sub: "Aktif semua",  ic: "#8B5CF6", ib: "#F5F3FF" },
          ].map(({ icon: I, v, label, sub, ic, ib }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: ib }}>
                <I size={18} style={{ color: ic }} />
              </div>
              <p className="text-xl font-bold text-slate-900">{v}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              <p className="text-xs font-medium mt-1" style={{ color: ic }}>{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1E40AF" }}>
                <Eye size={15} className="text-white" />
              </div>
              <h3 className="font-semibold text-slate-800">Visi Desa</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{visi}&rdquo;</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#10B981" }}>
                <Target size={15} className="text-white" />
              </div>
              <h3 className="font-semibold text-slate-800">Misi Desa</h3>
            </div>
            <ul className="space-y-2.5">
              {misiList.map((m) => (
                <li key={m} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#D1FAE5" }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2.5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </div>
                  <span className="text-sm text-slate-600">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} style={{ color: "#F59E0B" }} />
            <h3 className="font-semibold text-slate-800">Akses Cepat</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden p-6 text-white min-h-[170px]" style={{ background: "linear-gradient(135deg, #EA580C, #F97316)" }}>
              <div className="absolute right-4 top-4 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
              {laporanBaru > 0 && (
                <span className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "white", color: "#EA580C" }}>
                  {laporanBaru} baru
                </span>
              )}
              <h4 className="font-bold text-base mb-1 mt-2">Lapor Warga</h4>
              <p className="text-sm mb-4" style={{ color: "#FED7AA" }}>Kelola laporan masalah di lingkungan desa dan pantau statusnya secara real time.</p>
              <Link href="/laporan" className="inline-block text-white text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.2)" }}>
                Buka Laporan
              </Link>
            </div>
            <div className="relative rounded-2xl overflow-hidden p-6 text-white min-h-[170px]" style={{ background: "linear-gradient(135deg, #1E3A8A, #2563EB)" }}>
              <div className="absolute right-4 top-4 w-16 h-16 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#34D399", color: "#065F46" }}>On Track</span>
              <h4 className="font-bold text-base mb-1 mt-2">Dashboard</h4>
              <p className="text-sm mb-4" style={{ color: "#BFDBFE" }}>Lihat realisasi anggaran, program prioritas, dan statistik keuangan desa tahun {tahun}</p>
              <Link href="/dashboard" className="inline-block text-white text-xs font-semibold px-4 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.2)" }}>
                Buka Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={16} style={{ color: "#1E40AF" }} />
            <h3 className="font-semibold text-slate-800">Pengumuman Terbaru</h3>
          </div>
          {pengumuman.length > 0 ? (
            <div className="space-y-4">
              {pengumuman.map((p, i) => (
                <div key={p.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{p.judul}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.isi}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Bell size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-400">Belum ada pengumuman terbaru.</p>
              <p className="text-xs text-slate-300 mt-1">Pengumuman akan muncul setelah admin menambahkannya.</p>
            </div>
          )}
        </div>

      </main>
    </>
  );
}
