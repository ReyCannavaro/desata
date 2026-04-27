import type { Metadata } from "next";
import { getLaporanByTiket } from "@/actions/laporan";
import { CekLaporanClient } from "@/components/cek-laporan/cek-laporan-client";

export const metadata: Metadata = {
  title: "Cek Status Laporan — DESATA",
  description: "Pantau perkembangan laporan pengaduan warga desa.",
};

const DEMO_DESA_ID = "11111111-1111-1111-1111-111111111111";

export default async function CekLaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ tiket?: string }>;
}) {
  const params = await searchParams;
  const tiket = params.tiket?.trim().toUpperCase();

  // Fetch laporan dari server — null jika tiket tidak ada / tidak ditemukan
  const laporan = tiket ? await getLaporanByTiket(tiket) : null;

  // Hapus desa_id dari props (keamanan)
  void DEMO_DESA_ID;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cek Status Laporan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Masukkan nomor tiket untuk memantau perkembangan laporan Anda.
        </p>
      </div>

      <CekLaporanClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        laporan={laporan as any}
        initialTiket={tiket}
      />
    </div>
  );
}