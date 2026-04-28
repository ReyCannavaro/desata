"use client";

import { useState, useRef } from "react";
import { createLaporanAction } from "@/actions/laporan";
import { uploadFotoLaporan } from "@/actions/storage";
import { CheckCircle2, ImagePlus, X, Loader2 } from "lucide-react";

const KATEGORI_OPTIONS = [
  { value: "INF", label: "Infrastruktur (jalan, drainase, gedung)" },
  { value: "KES", label: "Kesehatan (posyandu, sanitasi)" },
  { value: "PDD", label: "Pendidikan (sekolah, beasiswa)" },
  { value: "LNG", label: "Lingkungan (sampah, penghijauan)" },
  { value: "PLY", label: "Pelayanan Publik (KTP, administrasi)" },
  { value: "KAM", label: "Keamanan (ketertiban, PJU)" },
  { value: "LNY", label: "Lainnya" },
];

interface FotoItem {
  file: File;
  preview: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

interface Props {
  desaId: string;
}

export function LaporForm({ desaId }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiket, setTiket] = useState<string | null>(null);
  const [isAnonim, setIsAnonim] = useState(false);
  const [fotos, setFotos] = useState<FotoItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FOTO = 3;
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Reset input supaya file yang sama bisa dipilih lagi
    if (fileInputRef.current) fileInputRef.current.value = "";

    const sisa = MAX_FOTO - fotos.length;
    const toProcess = files.slice(0, sisa);

    for (const file of toProcess) {
      if (!ALLOWED.includes(file.type)) {
        setError(`${file.name}: format tidak didukung. Gunakan JPG, PNG, atau WEBP.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError(`${file.name}: ukuran terlalu besar (maks 5 MB).`);
        continue;
      }
      setError(null);

      const preview = URL.createObjectURL(file);
      const newItem: FotoItem = { file, preview, uploading: true };

      setFotos((prev) => [...prev, newItem]);

      const result = await uploadFotoLaporan(file, desaId);

      setFotos((prev) =>
        prev.map((f) =>
          f.preview === preview
            ? result.success
              ? { ...f, url: result.url, uploading: false }
              : { ...f, uploading: false, error: result.error }
            : f
        )
      );
    }
  }

  function removeFoto(preview: string) {
    setFotos((prev) => {
      const item = prev.find((f) => f.preview === preview);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.preview !== preview);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const stillUploading = fotos.some((f) => f.uploading);
    if (stillUploading) {
      setError("Tunggu sampai semua foto selesai diunggah.");
      setIsPending(false);
      return;
    }

    const fotoUrls = fotos
      .filter((f) => f.url && !f.error)
      .map((f) => f.url as string);

    const fd = new FormData(e.currentTarget);

    const result = await createLaporanAction({
      desa_id: desaId,
      judul: fd.get("judul") as string,
      kategori: fd.get("kategori") as
        | "INF" | "KES" | "PDD" | "LNG" | "PLY" | "KAM" | "LNY",
      deskripsi: fd.get("deskripsi") as string,
      nama_pelapor: isAnonim ? null : (fd.get("nama") as string) || null,
      email_pelapor: isAnonim ? null : (fd.get("email") as string) || null,
      wa_pelapor: isAnonim ? null : (fd.get("wa") as string) || null,
      is_anonim: isAnonim,
      foto_urls: fotoUrls,
      lokasi_lat: null,
      lokasi_lng: null,
      ip_address: null,
    });

    if (result.success && result.nomorTiket) {
      setTiket(result.nomorTiket);
    } else {
      setError(result.error ?? "Terjadi kesalahan. Coba lagi.");
    }
    setIsPending(false);
  }

  if (tiket) {
    return (
      <div className="text-center py-6 space-y-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "#D1FAE5" }}
        >
          <CheckCircle2 size={28} style={{ color: "#059669" }} />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-lg">
            Laporan Terkirim!
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Simpan nomor tiket berikut untuk memantau status laporan Anda.
          </p>
        </div>
        <div
          className="rounded-2xl p-5 border"
          style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
        >
          <p className="text-xs text-slate-500 mb-1">Nomor Tiket</p>
          <p className="text-2xl font-bold font-mono text-slate-800 tracking-widest">
            {tiket}
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <a
            href={`/cek-laporan?tiket=${tiket}`}
            className="px-5 py-2.5 text-white text-sm font-medium rounded-xl transition"
            style={{ background: "#1E40AF" }}
          >
            Pantau Laporan
          </a>
          <button
            onClick={() => {
              setTiket(null);
              setFotos([]);
              setIsAnonim(false);
              setError(null);
            }}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition"
          >
            Kirim Laporan Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Kategori Masalah <span className="text-red-500">*</span>
        </label>
        <select
          name="kategori"
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#1E40AF" } as React.CSSProperties}
        >
          <option value="">— Pilih kategori —</option>
          {KATEGORI_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Judul Laporan <span className="text-red-500">*</span>
        </label>
        <input
          name="judul"
          type="text"
          required
          minLength={10}
          maxLength={150}
          placeholder="Contoh: Jalan Rusak di RT 05 Depan SD"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#1E40AF" } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Deskripsi Lengkap <span className="text-red-500">*</span>
        </label>
        <textarea
          name="deskripsi"
          required
          minLength={30}
          maxLength={1000}
          rows={4}
          placeholder="Jelaskan masalah secara detail: lokasi, kondisi, dampak, dan harapan Anda..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-none"
          style={{ "--tw-ring-color": "#1E40AF" } as React.CSSProperties}
        />
        <p className="text-xs text-slate-400 mt-1">Minimal 30 karakter</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Foto Bukti{" "}
          <span className="text-slate-400">(opsional, maks {MAX_FOTO} foto · JPG/PNG/WEBP · 5 MB)</span>
        </label>

        {fotos.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {fotos.map((f) => (
              <div
                key={f.preview}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0"
              >
                <img
                  src={f.preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />

                {f.uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={20} className="text-white animate-spin" />
                  </div>
                )}

                {f.error && (
                  <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center p-1">
                    <p className="text-white text-[9px] text-center leading-tight">
                      Gagal upload
                    </p>
                  </div>
                )}

                {!f.uploading && (
                  <button
                    type="button"
                    onClick={() => removeFoto(f.preview)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition"
                  >
                    <X size={10} className="text-white" />
                  </button>
                )}

                {f.url && !f.error && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "#10B981" }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {fotos.length < MAX_FOTO && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition flex-shrink-0">
                <ImagePlus size={20} className="text-slate-400" />
                <span className="text-[10px] text-slate-400">Tambah</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFotoChange}
                />
              </label>
            )}
          </div>
        )}

        {fotos.length === 0 && (
          <label className="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-slate-200 rounded-xl py-8 px-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            <ImagePlus size={24} className="text-slate-400" />
            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium">
                Klik untuk pilih foto
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                JPG, PNG, WEBP · Maks 5 MB · Hingga {MAX_FOTO} foto
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFotoChange}
            />
          </label>
        )}
      </div>

      <div
        className="flex items-center gap-3 p-4 rounded-xl border"
        style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
      >
        <input
          type="checkbox"
          id="anonim"
          checked={isAnonim}
          onChange={(e) => setIsAnonim(e.target.checked)}
          className="w-4 h-4"
          style={{ accentColor: "#1E40AF" }}
        />
        <label htmlFor="anonim" className="text-sm text-slate-600 cursor-pointer">
          Kirim sebagai{" "}
          <span className="font-medium text-slate-800">anonim</span>{" "}
          (nama & kontak tidak ditampilkan)
        </label>
      </div>

      {!isAnonim && (
        <div
          className="space-y-3 p-4 rounded-xl border"
          style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
        >
          <p className="text-xs font-medium text-slate-600">
            Data Pelapor{" "}
            <span className="text-slate-400 font-normal">(opsional)</span>
          </p>
          <input
            name="nama"
            type="text"
            placeholder="Nama lengkap"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "#1E40AF" } as React.CSSProperties}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="email"
              type="email"
              placeholder="Email (opsional)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#1E40AF" } as React.CSSProperties}
            />
            <input
              name="wa"
              type="tel"
              placeholder="WhatsApp (opsional)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#1E40AF" } as React.CSSProperties}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Kontak hanya digunakan petugas untuk follow-up, tidak ditampilkan ke publik.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl border border-red-200 text-sm text-red-700 flex items-start gap-2"
          style={{ background: "#FEF2F2" }}>
          <span className="flex-shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || fotos.some((f) => f.uploading)}
        className="w-full py-3 text-white font-medium rounded-xl transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "#1E40AF" }}
      >
        {isPending
          ? "Mengirim Laporan..."
          : fotos.some((f) => f.uploading)
          ? "Mengunggah foto..."
          : "Kirim Laporan"}
      </button>
    </form>
  );
}