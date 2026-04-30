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
  jumlah_penduduk: number | null;
  jumlah_kk: number | null;
  luas_wilayah_ha: number | null;
  jumlah_dusun: number | null;
  jumlah_rw: number | null;
  jumlah_rt: number | null;
  kode_desa: string | null;
  tahun_berdiri: number | null;
  visi: string | null;
  misi: string[] | null;
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


export async function getBerandaData(): Promise<BerandaData> {
  const desaId = await getPublikDesaIdSafe();
  const supabase = await createClient();

  let desa: DesaPublikInfo | null = null;
  if (desaId) {
    const { data } = await supabase
      .from("desa")
      .select("id, nama, kecamatan, kabupaten, provinsi, logo_url, jumlah_penduduk, jumlah_kk, luas_wilayah_ha, jumlah_dusun, jumlah_rw, jumlah_rt, kode_desa, tahun_berdiri, visi, misi")
      .eq("id", desaId)
      .single();
    desa = (data ?? null) as unknown as DesaPublikInfo | null;
  }

  const desaExt = desa;

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
  } catch { }

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
  } catch { laporanBaru = 0; }

  const jumlahPenduduk = desaExt?.jumlah_penduduk ?? parseInt(process.env.DESA_JUMLAH_PENDUDUK ?? "0");
  const jumlahKK = desaExt?.jumlah_kk ?? parseInt(process.env.DESA_JUMLAH_KK ?? "0");

  let luasWilayah = "—";
  if (desaExt?.luas_wilayah_ha) {
    luasWilayah = `${Number(desaExt.luas_wilayah_ha).toLocaleString("id-ID")} ha`;
  } else if (process.env.DESA_LUAS_WILAYAH) {
    luasWilayah = process.env.DESA_LUAS_WILAYAH;
  }

  let wilayahAdmin = "—";
  if (desaExt?.jumlah_dusun || desaExt?.jumlah_rw || desaExt?.jumlah_rt) {
    const parts = [];
    if (desaExt.jumlah_dusun) parts.push(`${desaExt.jumlah_dusun} Dusun`);
    if (desaExt.jumlah_rw) parts.push(`${desaExt.jumlah_rw} RW`);
    if (desaExt.jumlah_rt) parts.push(`${desaExt.jumlah_rt} RT`);
    wilayahAdmin = parts.join(" · ");
  } else if (process.env.DESA_WILAYAH_ADMIN) {
    wilayahAdmin = process.env.DESA_WILAYAH_ADMIN;
  }

  const visi =
    desaExt?.visi ??
    process.env.DESA_VISI ??
    "Terwujudnya desa yang mandiri, transparan, dan berdaya saing berbasis potensi lokal untuk kesejahteraan masyarakat yang berkeadilan.";

  const misi =
    desaExt?.misi ??
    (process.env.DESA_MISI ? process.env.DESA_MISI.split("|") : [
      "Meningkatkan kualitas infrastruktur dan pelayanan publik",
      "Mendorong transparansi pengelolaan keuangan desa",
      "Memberdayakan masyarakat melalui program ekonomi kreatif",
    ]);

  return {
    desa,
    pengumuman,
    stats: { jumlahPenduduk, jumlahKK, luasWilayah, wilayahAdmin },
    visi,
    misi,
    laporanBaru,
  };
}