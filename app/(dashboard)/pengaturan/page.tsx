import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getUsersAction } from "@/actions/users";
import { getRealisasiAnggaran } from "@/actions/keuangan";
import { TopBar } from "@/components/layout/top-bar";
import { createClient } from "@/lib/supabase/server";
import { PengaturanClient } from "@/components/pengaturan/pengaturan-client";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  const supabase = await createClient();
  const tahun = new Date().getFullYear();

  const [users, kategoriResult, realisasi] = await Promise.all([
    getUsersAction(profile.desa_id).catch(() => []),
    supabase
      .from("kategori_program")
      .select("*")
      .eq("desa_id", profile.desa_id)
      .order("nama"),
    getRealisasiAnggaran({ desaId: profile.desa_id, tahun }).catch(() => []),
  ]);

  const kategoriList = kategoriResult.data ?? [];

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Pengaturan"
        subtitle="Kelola akun, kategori, dan anggaran desa"
      />
      <main className="flex-1 p-6">
        <PengaturanClient
          profile={profile}
          users={users}
          kategoriList={kategoriList}
          realisasiList={realisasi}
          desaId={profile.desa_id}
          tahun={tahun}
          isSuperAdmin={profile.role === "super_admin"}
        />
      </main>
    </>
  );
}