"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getResend, EMAIL_FROM } from "./resend";
import { templateLaporanMasuk, type LaporanEmailData } from "./templates";
import type { KategoriLaporan } from "@/lib/supabase/types";

export async function sendEmailLaporanMasuk(params: {
  desaId: string;
  nomorTiket: string;
  judul: string;
  kategori: KategoriLaporan;
  deskripsi: string;
  namaPelapor: string | null;
  isAnonim: boolean;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const supabase = await createAdminClient();

    const { data: desa } = await supabase
      .from("desa")
      .select("nama")
      .eq("id", params.desaId)
      .single();

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("desa_id", params.desaId)
      .in("role", ["admin_desa", "super_admin"])
      .eq("is_active", true);

    if (!profiles || profiles.length === 0) return;

    const adminIds = new Set(profiles.map((p) => p.id));

    const { data: authData } = await supabase.auth.admin.listUsers();
    const adminEmails: string[] = (authData?.users ?? [])
      .filter((u: { id: string; email?: string }) => adminIds.has(u.id) && !!u.email)
      .map((u: { id: string; email?: string }) => u.email as string);

    if (adminEmails.length === 0) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const desaNama = desa?.nama ?? "Desa";

    const emailData: LaporanEmailData = {
      nomorTiket: params.nomorTiket,
      judul: params.judul,
      kategori: params.kategori,
      deskripsi: params.deskripsi,
      namaPelapor: params.namaPelapor,
      isAnonim: params.isAnonim,
      desaNama,
      appUrl,
    };

    await getResend().emails.send({
      from: EMAIL_FROM,
      to: adminEmails,
      subject: `[${params.nomorTiket}] Laporan Baru: ${params.judul}`,
      html: templateLaporanMasuk(emailData),
    });
  } catch (err) {
    console.error("[sendEmailLaporanMasuk] error:", err);
  }
}
