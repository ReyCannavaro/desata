import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getKeuanganPublik } from "@/actions/keuangan";
import { getLaporanPublik } from "@/actions/laporan";
import { TopBar } from "@/components/layout/top-bar";
import { StatistikClient } from "@/components/statistik/statistik-client";
import type { TransaksiWithKategori, LaporanWarga } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Statistik" };

export default async function StatistikPage() {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const desaId = data.profile.desa_id;
  const tahun = new Date().getFullYear();

  const [keuangan, laporan] = await Promise.all([
    getKeuanganPublik({ desaId, tahun }).catch(() => null),
    getLaporanPublik({ desaId }).catch(() => null),
  ]);

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Statistik"
        subtitle="Visualisasi data keuangan dan laporan"
      />
      <main className="flex-1 p-6">
        <StatistikClient
          transaksi={(keuangan?.transaksi ?? []) as unknown as TransaksiWithKategori[]}
          laporan={(laporan?.laporan ?? []) as unknown as Pick<LaporanWarga, "kategori" | "status" | "upvote_count" | "created_at">[]}
          tahun={tahun}
        />
      </main>
    </>
  );
}