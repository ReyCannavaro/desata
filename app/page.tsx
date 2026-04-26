import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = { title: "Dashboard — DESATA" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("nama, role, desa(nama)")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Selamat datang, {profile?.nama} 
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {/* @ts-expect-error desa is joined object */}
          {profile?.desa?.nama} · {profile?.role?.replace("_", " ")}
        </p>
      </div>

      {/* Stats cards — akan diisi data real di step integrasi frontend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Transaksi", value: "—", sub: "tahun ini" },
          { label: "Total Pemasukan", value: "—", sub: "tahun ini" },
          { label: "Total Pengeluaran", value: "—", sub: "tahun ini" },
          { label: "Laporan Masuk", value: "—", sub: "bulan ini" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-800">
        <p className="font-medium mb-1">Backend setup selesai!</p>
        <p className="text-emerald-700">
          Auth, database, RLS, dan middleware sudah berjalan. Lanjutkan ke integrasi modul keuangan dan laporan.
        </p>
      </div>
    </div>
  );
}