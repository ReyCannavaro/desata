"use server";

import { createClient } from "@/lib/supabase/server";
import { getPublikDesaIdSafe } from "@/lib/get-desa-id";

export interface DesaPublikInfo {
  id: string;
  nama: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  logo_url: string | null;
}

export interface PengumumanItem {
  id: string;
  judul: string;
  isi: string;
  created_at: string;
}

export interface BerandaData {
  desa: DesaPublikInfo | null;
  pengumuman: PengumumanItem[];
  stats: {
    jumlahPenduduk: number;
    jumlahKK: number;
    luasWilayah: string;
    wilayahAdmin: string;
  };
  visi: string;
  misi: string[];
  laporanBaru: number;
}

function getFallbackStats() {
  return {
    jumlahPenduduk: parseInt(process.env.DESA_JUMLAH_PENDUDUK ?? "0"),
    jumlahKK: parseInt(process.env.DESA_JUMLAH_KK ?? "0"),
    luasWilayah: process.env.DESA_LUAS_WILAYAH ?? "—",
    wilayahAdmin: process.env.DESA_WILAYAH_ADMIN ?? "—",
  };
}

export async function getBerandaData(): Promise<BerandaData> {
  const desaId = await getPublikDesaIdSafe();
  const supabase = await createClient();

  let desa: DesaPublikInfo | null = null;
  if (desaId) {
    const { data } = await supabase
      .from("desa")
      .select("id, nama, kecamatan, kabupaten, provinsi, logo_url")
      .eq("id", desaId)
      .single();
    desa = data ?? null;
  }

  let pengumuman: PengumumanItem[] = [];
  try {
    if (desaId) {
      const { data } = await supabase
        .from("pengumuman" as never)
        .select("id, judul, isi, created_at")
        .eq("desa_id", desaId)
        .eq("aktif", true)
        .order("created_at", { ascending: false })
        .limit(5) as { data: PengumumanItem[] | null };
      pengumuman = data ?? [];
    }
  } catch {
  }

  let laporanBaru = 0;
  try {
    if (desaId) {
      const { count } = await supabase
        .from("laporan_warga")
        .select("id", { count: "exact", head: true })
        .eq("desa_id", desaId)
        .eq("status", "DITERIMA");
      laporanBaru = count ?? 0;
    }
  } catch {
    laporanBaru = 0;
  }

  const visi =
    process.env.DESA_VISI ??
    "Terwujudnya desa yang mandiri, transparan, dan berdaya saing berbasis potensi lokal untuk kesejahteraan masyarakat yang berkeadilan.";

  const misi = process.env.DESA_MISI
    ? process.env.DESA_MISI.split("|")
    : [
        "Meningkatkan kualitas infrastruktur dan pelayanan publik",
        "Mendorong transparansi pengelolaan keuangan desa",
        "Memberdayakan masyarakat melalui program ekonomi kreatif",
      ];

  return {
    desa,
    pengumuman,
    stats: getFallbackStats(),
    visi,
    misi,
    laporanBaru,
  };
}