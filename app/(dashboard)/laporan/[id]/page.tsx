import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import { getLaporanDetailAdmin } from "@/actions/laporan";
import { TopBar } from "@/components/layout/top-bar";
import { LaporanDetailAdmin } from "@/components/laporan/laporan-detail-admin";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  KATEGORI_LAPORAN_LABEL,
  STATUS_LAPORAN_LABEL,
  STATUS_LAPORAN_COLOR,
} from "@/lib/supabase/types";
import type { KategoriLaporan, StatusLaporan } from "@/lib/supabase/types";
import { ArrowLeft, MapPin, ThumbsUp } from "lucide-react";

export const metadata: Metadata = { title: "Detail Laporan — Admin" };

export default async function LaporanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: laporanId } = await params;

  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const laporan = await getLaporanDetailAdmin(laporanId);
  if (!laporan) notFound();

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Detail Laporan"
        subtitle={laporan.nomor_tiket}
      />
      <main className="flex-1 p-6 max-w-4xl space-y-5">
        <Link
          href="/laporan"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={14} />
          Kembali ke Daftar Laporan
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-slate-400">{laporan.nomor_tiket}</span>
                {laporan.is_prioritas_tinggi && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Prioritas Tinggi
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-slate-800">{laporan.judul}</h2>
            </div>
            <span
              className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                STATUS_LAPORAN_COLOR[laporan.status as StatusLaporan]
              }`}
            >
              {STATUS_LAPORAN_LABEL[laporan.status as StatusLaporan]}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Kategori: <strong className="text-slate-700">{KATEGORI_LAPORAN_LABEL[laporan.kategori as KategoriLaporan]}</strong></span>
            <span>Dikirim: <strong className="text-slate-700">{format(new Date(laporan.created_at), "d MMMM yyyy, HH:mm", { locale: id })}</strong></span>
            <span className="flex items-center gap-1"><ThumbsUp size={12} /> <strong className="text-slate-700">{laporan.upvote_count}</strong> dukungan warga</span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">{laporan.deskripsi}</p>

          {laporan.foto_urls && laporan.foto_urls.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {laporan.foto_urls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Foto laporan ${i + 1}`}
                    className="w-28 h-28 object-cover rounded-xl border border-slate-200 hover:opacity-80 transition"
                  />
                </a>
              ))}
            </div>
          )}

          {laporan.lokasi_lat && laporan.lokasi_lng && (
            <a
              href={`https://maps.google.com/?q=${laporan.lokasi_lat},${laporan.lokasi_lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
            >
              <MapPin size={12} />
              Lihat lokasi di Google Maps ({laporan.lokasi_lat.toFixed(5)}, {laporan.lokasi_lng.toFixed(5)})
            </a>
          )}
        </div>

        {!laporan.is_anonim && (laporan.nama_pelapor || laporan.email_pelapor || laporan.wa_pelapor) && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Data Pelapor</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {laporan.nama_pelapor && (
                <div>
                  <p className="text-xs text-slate-400">Nama</p>
                  <p className="font-medium text-slate-700">{laporan.nama_pelapor}</p>
                </div>
              )}
              {laporan.email_pelapor && (
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <a href={`mailto:${laporan.email_pelapor}`} className="font-medium text-blue-600 hover:underline">
                    {laporan.email_pelapor}
                  </a>
                </div>
              )}
              {laporan.wa_pelapor && (
                <div>
                  <p className="text-xs text-slate-400">WhatsApp</p>
                  <a href={`https://wa.me/${laporan.wa_pelapor.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="font-medium text-green-600 hover:underline">
                    {laporan.wa_pelapor}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <LaporanDetailAdmin
          laporanId={laporan.id}
          currentStatus={laporan.status as StatusLaporan}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          statusLog={(laporan as any).laporan_status_log ?? []}
        />
      </main>
    </>
  );
}