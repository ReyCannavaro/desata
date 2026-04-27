"use server";

import { createClient } from "@/lib/supabase/server";

export type UploadResult =
  | { success: true; url: string; path: string }
  | { success: false; error: string };

export async function uploadFotoLaporan(
  file: File,
  desaId: string
): Promise<UploadResult> {
  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

  if (!ALLOWED.includes(file.type)) {
    return { success: false, error: "Format foto harus JPG, PNG, atau WEBP." };
  }
  if (file.size > MAX_SIZE) {
    return {
      success: false,
      error: `Foto terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 5 MB.`,
    };
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const uuid = crypto.randomUUID();
  const path = `${desaId}/${uuid}.${ext}`;

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from("laporan-foto")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("uploadFotoLaporan error:", error);
    return { success: false, error: "Gagal mengunggah foto. Coba lagi." };
  }

  const { data } = supabase.storage.from("laporan-foto").getPublicUrl(path);
  return { success: true, url: data.publicUrl, path };
}

export async function uploadBuktiTransaksi(
  file: File,
  desaId: string
): Promise<UploadResult> {
  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_PREFIX = ["image/", "application/pdf"];

  const isAllowed = ALLOWED_PREFIX.some((p) => file.type.startsWith(p));
  if (!isAllowed) {
    return {
      success: false,
      error: "Format bukti harus gambar (JPG/PNG/WEBP) atau PDF.",
    };
  }
  if (file.size > MAX_SIZE) {
    return {
      success: false,
      error: `File terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 5 MB.`,
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const uuid = crypto.randomUUID();
  const tahun = new Date().getFullYear();
  const path = `${desaId}/${tahun}/${uuid}.${ext}`;

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from("transaksi-dokumen")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("uploadBuktiTransaksi error:", error);
    return { success: false, error: "Gagal mengunggah bukti. Coba lagi." };
  }

  const { data } = supabase.storage
    .from("transaksi-dokumen")
    .getPublicUrl(path);
  return { success: true, url: data.publicUrl, path };
}

export async function deleteStorageFile(
  bucket: "laporan-foto" | "transaksi-dokumen",
  path: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.storage.from(bucket).remove([path]);
}