import type { Metadata } from "next";
import { LaporForm } from "@/components/forms/lapor-form";

export const metadata: Metadata = { title: "Kirim Laporan — DESATA" };

const DEMO_DESA_ID = "11111111-1111-1111-1111-111111111111";

export default function LaporPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Kirim Laporan / Aspirasi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Sampaikan masalah atau aspirasi Anda. Laporan akan ditindaklanjuti perangkat desa.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <LaporForm desaId={DEMO_DESA_ID} />
      </div>
    </div>
  );
}