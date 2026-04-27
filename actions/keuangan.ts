"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "./auth";

const TransaksiSchema = z.object({
  jenis: z.enum(["pemasukan", "pengeluaran"]),
  kategori_id: z.string().uuid("Kategori tidak valid"),
  nominal: z.number().positive("Nominal harus lebih dari 0"),
  deskripsi: z.string().min(5, "Deskripsi terlalu singkat").max(500),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  bukti_url: z.string().url().optional().nullable(),
});

export type CreateTransaksiInput = z.infer<typeof TransaksiSchema>;

export async function createTransaksiAction(
  input: CreateTransaksiInput
): Promise<ActionResult & { id?: string; warningPagu?: string }> {
  const parsed = TransaksiSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validasi gagal" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("desa_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin_desa", "super_admin"].includes(profile.role)) {
    return { success: false, error: "Akses ditolak" };
  }

  let warningPagu: string | undefined;
  if (parsed.data.jenis === "pengeluaran") {
    const tahun = new Date(parsed.data.tanggal).getFullYear();
    const { data: warningRows } = await supabase.rpc("check_pagu_warning", {
      kategori_id_param: parsed.data.kategori_id,
      nominal_param: parsed.data.nominal,
      tahun_param: tahun,
    });

    const warning = Array.isArray(warningRows) ? warningRows[0] : null;
    if (warning?.is_warning) {
      warningPagu = `Pengeluaran ini akan mencapai ${Number(warning.percentage).toFixed(1)}% dari pagu anggaran. Sisa pagu: Rp ${Number(warning.sisa_pagu).toLocaleString("id-ID")}`;
    }
  }

  const { data, error } = await supabase
    .from("transaksi")
    .insert({
      ...parsed.data,
      desa_id: profile.desa_id,
      input_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createTransaksi error:", error);
    return { success: false, error: "Gagal menyimpan transaksi. Coba lagi." };
  }

  revalidatePath("/transparansi");
  revalidatePath("/keuangan");
  revalidatePath("/statistik");
  revalidatePath("/dashboard");
  return { success: true, id: data.id, warningPagu };
}

export async function updateTransaksiAction(
  id: string,
  input: Partial<CreateTransaksiInput>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("desa_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin_desa", "super_admin"].includes(profile.role)) {
    return { success: false, error: "Akses ditolak" };
  }

  const { data: existing } = await supabase
    .from("transaksi")
    .select("desa_id")
    .eq("id", id)
    .single();

  if (!existing) return { success: false, error: "Transaksi tidak ditemukan." };
  if (existing.desa_id !== profile.desa_id) return { success: false, error: "Akses ditolak" };

  const { error } = await supabase.from("transaksi").update(input).eq("id", id);
  if (error) return { success: false, error: "Gagal memperbarui transaksi." };

  revalidatePath("/transparansi");
  revalidatePath("/keuangan");
  revalidatePath("/statistik");
  return { success: true };
}

export async function deleteTransaksiAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("desa_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin_desa", "super_admin"].includes(profile.role)) {
    return { success: false, error: "Akses ditolak" };
  }

  const { data: transaksi } = await supabase
    .from("transaksi")
    .select("id, desa_id")
    .eq("id", id)
    .single();

  if (!transaksi) return { success: false, error: "Transaksi tidak ditemukan." };
  if (transaksi.desa_id !== profile.desa_id) return { success: false, error: "Akses ditolak" };

  const { error } = await supabase.from("transaksi").delete().eq("id", id);
  if (error) return { success: false, error: "Gagal menghapus transaksi." };

  revalidatePath("/transparansi");
  revalidatePath("/keuangan");
  revalidatePath("/statistik");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getKeuanganPublik(params: {
  desaId: string;
  tahun?: number;
  bulan?: number;
  kategoriId?: string;
}) {
  const supabase = await createClient();
  const tahun = params.tahun ?? new Date().getFullYear();

  let query = supabase
    .from("transaksi")
    .select("*, kategori_program(nama, warna)")
    .eq("desa_id", params.desaId)
    .gte("tanggal", `${tahun}-01-01`)
    .lte("tanggal", `${tahun}-12-31`)
    .order("tanggal", { ascending: false });

  if (params.bulan) {
    const bulanStr = params.bulan.toString().padStart(2, "0");
    const lastDay = new Date(tahun, params.bulan, 0).getDate();
    query = query
      .gte("tanggal", `${tahun}-${bulanStr}-01`)
      .lte("tanggal", `${tahun}-${bulanStr}-${lastDay}`);
  }

  if (params.kategoriId) {
    query = query.eq("kategori_id", params.kategoriId);
  }

  const { data, error } = await query;
  if (error) throw new Error("Gagal mengambil data keuangan");

  const totalPemasukan = data
    .filter((t) => t.jenis === "pemasukan")
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalPengeluaran = data
    .filter((t) => t.jenis === "pengeluaran")
    .reduce((sum, t) => sum + t.nominal, 0);

  return {
    transaksi: data,
    summary: {
      totalPemasukan,
      totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran,
    },
  };
}

export async function getKeuanganPerBulan(params: {
  desaId: string;
  tahun: number;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transaksi")
    .select("jenis, nominal, tanggal")
    .eq("desa_id", params.desaId)
    .gte("tanggal", `${params.tahun}-01-01`)
    .lte("tanggal", `${params.tahun}-12-31`);

  if (error) throw new Error("Gagal mengambil data per bulan");

  const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  return Array.from({ length: 12 }, (_, i) => {
    const bulan = (i + 1).toString().padStart(2, "0");
    const prefix = `${params.tahun}-${bulan}`;
    const filtered = (data ?? []).filter((t) => t.tanggal.startsWith(prefix));
    return {
      bulan: BULAN[i],
      pemasukan: filtered.filter((t) => t.jenis === "pemasukan").reduce((s, t) => s + t.nominal, 0),
      pengeluaran: filtered.filter((t) => t.jenis === "pengeluaran").reduce((s, t) => s + t.nominal, 0),
    };
  });
}

export async function getRealisasiAnggaran(params: {
  desaId: string;
  tahun: number;
}) {
  const supabase = await createClient();

  const [{ data: pagu }, { data: transaksi }] = await Promise.all([
    supabase
      .from("pagu_anggaran")
      .select("*, kategori_program(nama, warna)")
      .eq("desa_id", params.desaId)
      .eq("tahun", params.tahun),
    supabase
      .from("transaksi")
      .select("kategori_id, nominal")
      .eq("desa_id", params.desaId)
      .eq("jenis", "pengeluaran")
      .gte("tanggal", `${params.tahun}-01-01`)
      .lte("tanggal", `${params.tahun}-12-31`),
  ]);

  if (!pagu) return [];

  const realisasiMap: Record<string, number> = {};
  (transaksi ?? []).forEach((t) => {
    realisasiMap[t.kategori_id] = (realisasiMap[t.kategori_id] ?? 0) + t.nominal;
  });

  return pagu.map((p) => {
    const realisasi = realisasiMap[p.kategori_id] ?? 0;
    const persentase = p.nominal > 0 ? Math.min((realisasi / p.nominal) * 100, 100) : 0;
    const kategori = (Array.isArray(p.kategori_program) ? p.kategori_program[0] : p.kategori_program) as { nama: string; warna: string | null } | null;
    return {
      kategori_id: p.kategori_id,
      nama: kategori?.nama ?? "—",
      warna: kategori?.warna ?? "#94A3B8",
      pagu: p.nominal,
      realisasi,
      persentase: Math.round(persentase),
    };
  });
}

export async function setPaguAnggaranAction(input: {
  kategori_id: string;
  tahun: number;
  nominal: number;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("desa_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin_desa", "super_admin"].includes(profile.role)) {
    return { success: false, error: "Akses ditolak" };
  }

  const { error } = await supabase.from("pagu_anggaran").upsert(
    { ...input, desa_id: profile.desa_id },
    { onConflict: "desa_id,kategori_id,tahun" }
  );

  if (error) return { success: false, error: "Gagal menyimpan pagu anggaran." };

  revalidatePath("/keuangan");
  revalidatePath("/statistik");
  return { success: true };
}