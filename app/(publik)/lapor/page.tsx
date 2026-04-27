import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LaporWargaDashboard } from "@/components/laporan/lapor-warga-dashboard";

export const metadata: Metadata = { title: "Lapor Warga" };

export default async function LaporWargaAdminPage() {
  const data = await getCurrentUser();
  if (!data?.profile) redirect("/login");

  const supabase = await createClient();
  const { data: laporan } = await supabase
    .from("laporan_warga")
    .select("*, laporan_status_log(status_baru, catatan, created_at)")
    .eq("desa_id", data.profile.desa_id)
    .order("created_at", { ascending: false });

  return <LaporWargaDashboard laporan={laporan ?? []} userId={data.user.id} />;
}