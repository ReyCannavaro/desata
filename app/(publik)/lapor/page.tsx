import type { Metadata } from "next";
import { LaporForm } from "@/components/forms/lapor-form";
import { getPublikDesaIdSafe } from "@/lib/get-desa-id"; // FIX #03

export const metadata: Metadata = {
  title: "Kirim Laporan — DESATA",
  description: "Sampaikan masalah atau aspirasi Anda kepada perangkat desa.",
};

export default async function LaporPage() {
  const desaId = await getPublikDesaIdSafe();

  if (!desaId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="font-medium text-amber-800">Layanan Laporan Tidak Tersedia</p>
          <p className="text-sm text-amber-600 mt-1">
            Konfigurasi desa belum diatur. Hubungi administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Kirim Laporan / Aspirasi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Sampaikan masalah atau aspirasi Anda. Laporan akan ditindaklanjuti perangkat desa.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <LaporForm desaId={desaId} />
      </div>
    </div>
  );
}