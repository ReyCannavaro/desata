import type { Metadata } from "next";
import { getLaporanByTiket } from "@/actions/laporan";
import { CekLaporanClient } from "@/components/cek-laporan/cek-laporan-client";

export const metadata: Metadata = { title: "Cek Status Laporan — DESATA" };

export default async function CekLaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ tiket?: string }>;
}) {
  const params = await searchParams;
  const tiket = params.tiket?.toUpperCase();

  const laporan = tiket ? await getLaporanByTiket(tiket).catch(() => null) : null;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Cek Status Laporan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Masukkan nomor tiket yang diterima saat mengirim laporan.
        </p>
      </div>

      <CekLaporanClient initialTiket={tiket} laporan={laporan} />
    </div>
  );
}