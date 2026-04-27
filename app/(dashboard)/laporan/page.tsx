import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import { getLaporanAdmin } from "@/actions/laporan";
import { TopBar } from "@/components/layout/top-bar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  KATEGORI_LAPORAN_LABEL,
  STATUS_LAPORAN_LABEL,
  STATUS_LAPORAN_COLOR,
} from "@/lib/supabase/types";
import type { KategoriLaporan, StatusLaporan } from "@/lib/supabase/types";
import { AlertTriangle, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Laporan Warga — Admin" };

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "DITERIMA", label: "Diterima" },
  { value: "DIVERIFIKASI", label: "Diverifikasi" },
  { value: "DALAM_PROSES", label: "Dalam Proses" },
  { value: "DITOLAK", label: "Ditolak" },
  { value: "SELESAI", label: "Selesai" },
];

const KATEGORI_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua Kategori" },
  ...Object.entries(KATEGORI_LAPORAN_LABEL).map(([k, v]) => ({ value: k, label: v })),
];

export default async function LaporanAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kategori?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const result = await getLaporanAdmin({
    desaId: data.profile.desa_id,
    status: params.status,
    kategori: params.kategori,
    sortBy: (params.sort as "terbaru" | "upvote" | "prioritas") ?? "terbaru",
    page,
  }).catch(() => ({ laporan: [], total: 0, page: 1, totalPages: 1 }));

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  const pendingCount = result.laporan.filter((l) =>
    ["DITERIMA", "DIVERIFIKASI"].includes(l.status)
  ).length;

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams({
      ...(params.status ? { status: params.status } : {}),
      ...(params.kategori ? { kategori: params.kategori } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
      ...overrides,
    });
    return `/laporan?${p.toString()}`;
  }

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Laporan Warga"
        subtitle={`${result.total} laporan ditemukan`}
      />
      <main className="flex-1 p-6 space-y-5">
        {pendingCount > 5 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Ada <strong>{pendingCount} laporan</strong> yang menunggu verifikasi.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <select
            defaultValue={params.status ?? ""}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              void e;
            }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <div className="flex gap-1 flex-wrap">
            {STATUS_OPTIONS.map((o) => (
              <Link
                key={o.value}
                href={buildUrl({ status: o.value, page: "1" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  (params.status ?? "") === o.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {o.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-1 flex-wrap">
          {KATEGORI_OPTIONS.map((o) => (
            <Link
              key={o.value}
              href={buildUrl({ kategori: o.value, page: "1" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                (params.kategori ?? "") === o.value
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {o.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-1">
          {(["terbaru", "upvote", "prioritas"] as const).map((s) => (
            <Link
              key={s}
              href={buildUrl({ sort: s, page: "1" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                (params.sort ?? "terbaru") === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s === "terbaru" ? "Terbaru" : s === "upvote" ? "Upvote Terbanyak" : "Prioritas Tinggi"}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {result.laporan.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-400">
              Tidak ada laporan ditemukan.
            </div>
          ) : (
            result.laporan.map((l) => (
              <Link
                key={l.id}
                href={`/laporan/${l.id}`}
                className="block bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {l.is_prioritas_tinggi && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Prioritas Tinggi
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">{l.nomor_tiket}</span>
                      <span className="text-xs text-slate-400">
                        · {KATEGORI_LAPORAN_LABEL[l.kategori as KategoriLaporan]}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 truncate">{l.judul}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{l.deskripsi}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>
                        {format(new Date(l.created_at), "d MMM yyyy", { locale: id })}
                      </span>
                      {!l.is_anonim && l.nama_pelapor && (
                        <span>· {l.nama_pelapor}</span>
                      )}
                      <span>· ▲ {l.upvote_count} dukungan</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        STATUS_LAPORAN_COLOR[l.status as StatusLaporan]
                      }`}
                    >
                      {STATUS_LAPORAN_LABEL[l.status as StatusLaporan]}
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-slate-500 transition"
                    />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {result.totalPages > 1 && (
          <div className="flex gap-2 justify-center">
            {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildUrl({ page: String(p) })}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                  p === page
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}