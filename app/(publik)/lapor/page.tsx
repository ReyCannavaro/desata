import type { Metadata } from "next";
import { getLaporanPublik } from "@/actions/laporan";
import { getPublikDesaIdSafe } from "@/lib/get-desa-id";
import { UpvoteButton } from "@/components/laporan-publik/upvote-button";
import { LaporanRealtime } from "@/components/laporan-publik/laporan-realtime";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  KATEGORI_LAPORAN_LABEL,
  STATUS_LAPORAN_LABEL,
  STATUS_LAPORAN_COLOR,
} from "@/lib/supabase/types";
import type { KategoriLaporan, StatusLaporan } from "@/lib/supabase/types";
import { PlusCircle, ListFilter } from "lucide-react";

export const metadata: Metadata = {
  title: "Laporan Warga — DESATA",
  description: "Pantau semua laporan dan aspirasi warga desa.",
};

const STATUS_OPTIONS = [
  { value: "",             label: "Semua" },
  { value: "DITERIMA",    label: "Diterima" },
  { value: "DIVERIFIKASI",label: "Diverifikasi" },
  { value: "DALAM_PROSES",label: "Dalam Proses" },
  { value: "SELESAI",     label: "Selesai" },
];

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "upvote",  label: "Terpopuler" },
];

export default async function LaporanPublikPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kategori?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const desaId = await getPublikDesaIdSafe();
  const page   = params.page ? parseInt(params.page) : 1;

  const result = desaId
    ? await getLaporanPublik({
        desaId,
        status:  params.status,
        kategori: params.kategori,
        sortBy:  (params.sort as "terbaru" | "upvote") ?? "terbaru",
        page,
      }).catch(() => ({ laporan: [], total: 0, page: 1, totalPages: 1 }))
    : { laporan: [], total: 0, page: 1, totalPages: 1 };

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams({
      ...(params.status   ? { status: params.status }     : {}),
      ...(params.kategori ? { kategori: params.kategori } : {}),
      ...(params.sort     ? { sort: params.sort }         : {}),
      ...(page > 1        ? { page: String(page) }        : {}),
      ...overrides,
    });
    return `/laporan?${p.toString()}`;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Warga</h1>
          <p className="text-sm text-slate-500 mt-1">
            {result.total} laporan tercatat — pantau progres dan dukung yang penting
          </p>
        </div>
        <Link
          href="/lapor"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition hover:opacity-90"
          style={{ background: "#1E40AF" }}
        >
          <PlusCircle size={15} />
          Buat Laporan
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <ListFilter size={13} className="text-slate-400" />
          {STATUS_OPTIONS.map((o) => (
            <Link
              key={o.value}
              href={buildUrl({ status: o.value, page: "1" })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                (params.status ?? "") === o.value
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {o.label}
            </Link>
          ))}
          <span className="ml-auto flex gap-1">
            {SORT_OPTIONS.map((o) => (
              <Link
                key={o.value}
                href={buildUrl({ sort: o.value, page: "1" })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  (params.sort ?? "terbaru") === o.value
                    ? "bg-slate-800 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {o.label}
              </Link>
            ))}
          </span>
        </div>
      </div>

      {desaId && <LaporanRealtime desaId={desaId} />}

      <div className="space-y-3">
        {result.laporan.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-sm text-slate-500">Belum ada laporan yang ditemukan.</p>
            <Link
              href="/lapor"
              className="inline-block mt-4 text-sm font-medium underline"
              style={{ color: "#1E40AF" }}
            >
              Jadilah yang pertama melapor →
            </Link>
          </div>
        ) : (
          result.laporan.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 transition"
            >
              <div className="flex items-start gap-3">
                {/* Upvote */}
                <div className="flex-shrink-0 pt-0.5">
                  <UpvoteButton laporanId={l.id} initialCount={l.upvote_count} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {l.is_prioritas_tinggi && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Prioritas Tinggi
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">{l.nomor_tiket}</span>
                    <span className="text-[10px] text-slate-400">
                      · {KATEGORI_LAPORAN_LABEL[l.kategori as KategoriLaporan]}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 leading-snug">{l.judul}</p>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{l.deskripsi}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{format(new Date(l.created_at), "d MMM yyyy", { locale: id })}</span>
                    {!l.is_anonim && l.nama_pelapor && (
                      <span>· {l.nama_pelapor}</span>
                    )}
                  </div>
                </div>

                <span
                  className={`flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    STATUS_LAPORAN_COLOR[l.status as StatusLaporan]
                  }`}
                >
                  {STATUS_LAPORAN_LABEL[l.status as StatusLaporan]}
                </span>
              </div>
            </div>
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
    </div>
  );
}
