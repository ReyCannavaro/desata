import type { Metadata } from "next";
import { getLaporanByTiket } from "@/actions/laporan";
import { CekLaporanClient } from "@/components/cek-laporan/cek-laporan-client";
export const metadata: Metadata = {
  title: "Cek Status Laporan — DESATA",
  description: "Pantau perkembangan laporan pengaduan warga desa.",
};

export default async function CekLaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ tiket?: string }>;
}) {
  const params = await searchParams;
  const tiket = params.tiket?.trim().toUpperCase();
  const laporan = tiket ? await getLaporanByTiket(tiket) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cek Status Laporan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Masukkan nomor tiket untuk memantau perkembangan laporan Anda.
        </p>
      </div>

      <CekLaporanClient
        laporan={laporan as Parameters<typeof CekLaporanClient>[0]["laporan"]}
        initialTiket={tiket}
      />
    </div>
  );
}