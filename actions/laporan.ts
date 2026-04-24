"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "./auth";
import type { StatusLaporan } from "@/lib/supabase/types";

const CreateLaporanSchema = z.object({
  judul: z.string().min(10, "Judul minimal 10 karakter").max(150),
  kategori: z.enum(["INF", "KES", "PDD", "LNG", "PLY", "KAM", "LNY"]),
  deskripsi: z.string().min(30, "Deskripsi minimal 30 karakter").max(1000),
  foto_urls: z.array(z.string().url()).max(3).optional().default([]),
  lokasi_lat: z.number().optional().nullable(),
  lokasi_lng: z.number().optional().nullable(),
  nama_pelapor: z.string().max(100).optional().nullable(),
  email_pelapor: z.string().email().optional().nullable(),
  wa_pelapor: z.string().optional().nullable(),
  is_anonim: z.boolean().default(false),
  desa_id: z.string().uuid(),
  ip_address: z.string().optional().nullable(),
});

export type CreateLaporanInput = z.infer<typeof CreateLaporanSchema>;

const UpdateStatusSchema = z.object({
  status: z.enum(["DITERIMA", "DIVERIFIKASI", "DALAM_PROSES", "DITOLAK", "SELESAI"]),
  catatan: z.string().optional(),
});

export async function createLaporanAction(
  input: CreateLaporanInput
): Promise<ActionResult & { nomorTiket?: string }> {
  const parsed = CreateLaporanSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  if (parsed.data.ip_address) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("laporan_warga")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", parsed.data.ip_address)
      .eq("desa_id", parsed.data.desa_id)
      .gte("created_at", yesterday);

    if ((count ?? 0) >= 3) {
      return {
        success: false,
        error: "Anda telah mengirim 3 laporan hari ini. Batas pengiriman adalah 3 laporan per hari.",
      };
    }
  }

  const { data: tiketData, error: tiketError } = await supabase.rpc(
    "generate_nomor_tiket",
    { desa_id_param: parsed.data.desa_id }
  );

  if (tiketError || !tiketData) {
    return { success: false, error: "Gagal membuat nomor tiket. Coba lagi." };
  }

  const { data, error } = await supabase
    .from("laporan_warga")
    .insert({
      ...parsed.data,
      nomor_tiket: tiketData,
      status: "DITERIMA",
      upvote_count: 0,
      is_prioritas_tinggi: false,
    })
    .select("nomor_tiket")
    .single();

  if (error) {
    console.error("createLaporan error:", error);
    return { success: false, error: "Gagal mengirim laporan. Coba lagi." };
  }

  revalidatePath("/lapor");
  return { success: true, nomorTiket: data.nomor_tiket };
}

export async function updateStatusLaporanAction(
  laporanId: string,
  input: z.infer<typeof UpdateStatusSchema>
): Promise<ActionResult> {
  const parsed = UpdateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data: laporan } = await supabase
    .from("laporan_warga")
    .select("status")
    .eq("id", laporanId)
    .single();

  if (!laporan) return { success: false, error: "Laporan tidak ditemukan" };

  if (laporan.status === "SELESAI") {
    return { success: false, error: "Laporan yang sudah selesai tidak dapat diubah statusnya." };
  }

  const { error } = await supabase
    .from("laporan_warga")
    .update({ status: parsed.data.status as StatusLaporan })
    .eq("id", laporanId);

  if (error) return { success: false, error: "Gagal memperbarui status laporan." };

  await supabase.from("laporan_status_log").insert({
    laporan_id: laporanId,
    status_lama: laporan.status,
    status_baru: parsed.data.status,
    catatan: parsed.data.catatan,
    changed_by: user.id,
  });

  revalidatePath("/laporan");
  revalidatePath(`/laporan/${laporanId}`);
  return { success: true };
}

export async function upvoteLaporanAction(
  laporanId: string,
  fingerprint: string,
  ipAddress?: string
): Promise<ActionResult & { newCount?: number }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("upvotes")
    .select("id")
    .eq("laporan_id", laporanId)
    .eq("fingerprint", fingerprint)
    .single();

  if (existing) {
    return { success: false, error: "Anda sudah mendukung laporan ini." };
  }

  const { error: upvoteError } = await supabase.from("upvotes").insert({
    laporan_id: laporanId,
    fingerprint,
    ip_address: ipAddress,
  });

  if (upvoteError) return { success: false, error: "Gagal memberikan dukungan." };

  const { data: laporan } = await supabase
    .from("laporan_warga")
    .select("upvote_count")
    .eq("id", laporanId)
    .single();

  const newCount = (laporan?.upvote_count ?? 0) + 1;

  await supabase
    .from("laporan_warga")
    .update({
      upvote_count: newCount,
      is_prioritas_tinggi: newCount > 50,
    })
    .eq("id", laporanId);

  revalidatePath("/lapor");
  return { success: true, newCount };
}

export async function getLaporanByTiket(nomorTiket: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("laporan_warga")
    .select("*, laporan_status_log(*, user_profiles(nama))")
    .eq("nomor_tiket", nomorTiket.toUpperCase())
    .single();

  if (error || !data) return null;

  const { email_pelapor, wa_pelapor, ip_address, ...publicData } = data;
  void email_pelapor; void wa_pelapor; void ip_address;

  return publicData;
}

export async function getLaporanPublik(params: {
  desaId: string;
  page?: number;
  kategori?: string;
  status?: string;
  sortBy?: "terbaru" | "upvote";
}) {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("laporan_warga")
    .select("id, nomor_tiket, judul, kategori, deskripsi, foto_urls, lokasi_lat, lokasi_lng, status, upvote_count, is_prioritas_tinggi, is_anonim, nama_pelapor, created_at", { count: "exact" })
    .eq("desa_id", params.desaId)
    .neq("status", "DITOLAK")
    .range(offset, offset + limit - 1);

  if (params.kategori) query = query.eq("kategori", params.kategori);
  if (params.status) query = query.eq("status", params.status);

  if (params.sortBy === "upvote") {
    query = query.order("upvote_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) throw new Error("Gagal mengambil daftar laporan");

  return { laporan: data, total: count ?? 0, page, totalPages: Math.ceil((count ?? 0) / limit) };
}