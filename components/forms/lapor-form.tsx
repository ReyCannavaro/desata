"use client";

import { useState } from "react";
import { createLaporanAction } from "@/actions/laporan";
import { CheckCircle2 } from "lucide-react";

const KATEGORI_OPTIONS = [
  { value: "INF", label: "Infrastruktur (jalan, drainase, gedung)" },
  { value: "KES", label: "Kesehatan (posyandu, sanitasi)" },
  { value: "PDD", label: "Pendidikan (sekolah, beasiswa)" },
  { value: "LNG", label: "Lingkungan (sampah, penghijauan)" },
  { value: "PLY", label: "Pelayanan Publik (KTP, administrasi)" },
  { value: "KAM", label: "Keamanan (ketertiban, PJU)" },
  { value: "LNY", label: "Lainnya" },
];

interface Props {
  desaId: string;
}

export function LaporForm({ desaId }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiket, setTiket] = useState<string | null>(null);
  const [isAnonim, setIsAnonim] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const fd = new FormData(e.currentTarget);

    const result = await createLaporanAction({
      desa_id: desaId,
      judul: fd.get("judul") as string,
      kategori: fd.get("kategori") as "INF" | "KES" | "PDD" | "LNG" | "PLY" | "KAM" | "LNY",
      deskripsi: fd.get("deskripsi") as string,
      nama_pelapor: isAnonim ? null : (fd.get("nama") as string) || null,
      email_pelapor: isAnonim ? null : (fd.get("email") as string) || null,
      wa_pelapor: isAnonim ? null : (fd.get("wa") as string) || null,
      is_anonim: isAnonim,
      foto_urls: [],
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
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{background:'#DBEAFE',width:'3.5rem',height:'3.5rem',borderRadius:'50%'}}">
          <CheckCircle2 size={28} className="" style={{color:'#1E40AF'}}" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-lg">Laporan Terkirim!</p>
          <p className="text-sm text-slate-500 mt-1">
            Simpan nomor tiket berikut untuk memantau status laporan Anda.
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Nomor Tiket</p>
          <p className="text-2xl font-bold font-mono text-slate-800 tracking-widest">{tiket}</p>
        </div>
        <div className="flex gap-2 justify-center">
          <a
            href={`/cek-laporan?tiket=${tiket}`}
            className="px-5 py-2.5 text-white text-sm font-medium rounded-xl transition" style={{background:'#1E40AF'}}"
          >
            Pantau Laporan
          </a>
          <button
            onClick={() => setTiket(null)}
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
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">Minimal 30 karakter</p>
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <input
          type="checkbox"
          id="anonim"
          checked={isAnonim}
          onChange={(e) => setIsAnonim(e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        <label htmlFor="anonim" className="text-sm text-slate-600 cursor-pointer">
          Kirim sebagai <span className="font-medium">anonim</span> (nama & kontak tidak ditampilkan)
        </label>
      </div>

      {!isAnonim && (
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-medium text-slate-600">Data Pelapor (opsional)</p>
          <input
            name="nama"
            type="text"
            placeholder="Nama lengkap"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="email"
              type="email"
              placeholder="Email (opsional)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="wa"
              type="tel"
              placeholder="WhatsApp (opsional)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Kontak hanya digunakan petugas untuk follow-up dan tidak ditampilkan publik.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
          <span className="flex-shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-xl transition text-sm" style={{background:'#1E40AF'}}"
      >
        {isPending ? "Mengirim Laporan..." : "Kirim Laporan"}
      </button>
    </form>
  );
}