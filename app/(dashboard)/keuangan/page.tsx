import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getKeuanganPublik } from "@/actions/keuangan";
import { TopBar } from "@/components/layout/top-bar";
import { KeuanganClient } from "@/components/keuangan/keuangan-client";

export const metadata: Metadata = { title: "Keuangan" };

export default async function KeuanganPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string; bulan?: string; kategori?: string }>;
}) {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const params = await searchParams;
  const tahun = params.tahun ? parseInt(params.tahun) : new Date().getFullYear();

  const keuangan = await getKeuanganPublik({
    desaId: data.profile.desa_id,
    tahun,
    bulan: params.bulan ? parseInt(params.bulan) : undefined,
    kategoriId: params.kategori,
  }).catch(() => ({ transaksi: [], summary: { totalPemasukan: 0, totalPengeluaran: 0, saldo: 0 } }));

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Manajemen Keuangan"
        subtitle={`Data APBDes ${profile.desa?.nama ?? "Desa"}`}
      />
      <main className="flex-1 p-6">
        <KeuanganClient
          transaksi={keuangan.transaksi}
          summary={keuangan.summary}
          tahun={tahun}
          desaId={data.profile.desa_id}
        />
      </main>
    </>
  );
}