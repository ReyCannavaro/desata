import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { DokumenClient } from "@/components/dokumen/dokumen-client";
import type { TransaksiWithKategori } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Dokumen Pendukung — DESATA" };

export default async function DokumenPage() {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  const supabase = await createClient();

  const { data: transaksi } = await supabase
    .from("transaksi")
    .select("*, kategori_program(nama, warna)")
    .eq("desa_id", profile.desa_id)
    .not("bukti_url", "is", null)
    .order("tanggal", { ascending: false });

  const dokumen = (transaksi ?? []) as unknown as TransaksiWithKategori[];

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Dokumen Pendukung"
        subtitle="Bukti foto & dokumen setiap transaksi pengeluaran"
      />
      <main className="flex-1 p-6">
        <DokumenClient dokumen={dokumen} />
      </main>
    </>
  );
}
