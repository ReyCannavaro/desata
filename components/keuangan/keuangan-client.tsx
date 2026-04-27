"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Landmark,
  Trash2,
  AlertTriangle,
  Paperclip,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  createTransaksiAction,
  deleteTransaksiAction,
} from "@/actions/keuangan";
import { uploadBuktiTransaksi } from "@/actions/storage";
import { createClient } from "@/lib/supabase/client";
import type { TransaksiWithKategori, KategoriProgram } from "@/lib/supabase/types";

interface Props {
  transaksi: TransaksiWithKategori[];
  summary: {
    totalPemasukan: number;
    totalPengeluaran: number;
    saldo: number;
  };
  tahun: number;
  desaId: string;
}

function formatRupiah(num: number) {
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export function KeuanganClient({ transaksi, summary, tahun, desaId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"semua" | "pemasukan" | "pengeluaran">("semua");

  const [kategoriList, setKategoriList] = useState<KategoriProgram[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("kategori_program")
      .select("*")
      .eq("desa_id", desaId)
      .order("nama")
      .then(({ data }) => {
        if (data) setKategoriList(data);
      });
  }, [desaId]);

  const filtered =
    filter === "semua"
      ? transaksi
      : transaksi.filter((t) => t.jenis === filter);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);
    setUploadedUrl(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const MAX = 5 * 1024 * 1024;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!ALLOWED.includes(file.type)) {
      setFileError("Format tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.");
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX) {
      setFileError(`File terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maks 5 MB.`);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }

  function handleClearFile() {
    setSelectedFile(null);
    setUploadedUrl(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setWarning(null);

    const fd = new FormData(e.currentTarget);
    let buktiUrl: string | null = null;
    if (selectedFile) {
      const uploadResult = await uploadBuktiTransaksi(selectedFile, desaId);
      if (!uploadResult.success) {
        setError(uploadResult.error);
        setIsPending(false);
        return;
      }
      buktiUrl = uploadResult.url;
      setUploadedUrl(uploadResult.url);
    }

    const result = await createTransaksiAction({
      jenis: fd.get("jenis") as "pemasukan" | "pengeluaran",
      kategori_id: fd.get("kategori_id") as string,
      nominal: parseFloat(fd.get("nominal") as string),
      deskripsi: fd.get("deskripsi") as string,
      tanggal: fd.get("tanggal") as string,
      bukti_url: buktiUrl,
    });

    if (result.success) {
      setShowForm(false);
      setSelectedFile(null);
      setUploadedUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (result.warningPagu) setWarning(result.warningPagu);
      router.refresh();
    } else {
      setError(result.error ?? "Gagal menyimpan.");
    }
    setIsPending(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    const result = await deleteTransaksiAction(id);
    if (result.success) router.refresh();
  }

  return (
    <div className="space-y-5">
      {warning && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
          <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
          {warning}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Pemasukan", value: summary.totalPemasukan, icon: TrendingUp, c: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Pengeluaran", value: summary.totalPengeluaran, icon: TrendingDown, c: "text-red-500", bg: "bg-red-50" },
          { label: "Saldo", value: summary.saldo, icon: Landmark, c: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ label, value, icon: Icon, c, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={c} />
            </div>
            <p className="text-xs text-slate-500">{label} {tahun}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(value)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1">
          {(["semua", "pemasukan", "pengeluaran"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filter === f
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition"
          style={{ background: "#1E40AF" }}
        >
          <Plus size={14} />
          Input Transaksi
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 space-y-4"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-800">Input Transaksi Baru</h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={16} className="text-slate-400 hover:text-slate-700" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Jenis</label>
              <select
                name="jenis"
                required
                defaultValue="pengeluaran"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tanggal</label>
              <input
                type="date"
                name="tanggal"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Kategori Program</label>
            <select
              name="kategori_id"
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih kategori...</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
            {kategoriList.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Belum ada kategori. Tambahkan kategori di Pengaturan terlebih dahulu.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Nominal (Rp)</label>
            <input
              type="number"
              name="nominal"
              required
              min={1}
              step="any"
              placeholder="Contoh: 5000000"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Deskripsi</label>
            <input
              type="text"
              name="deskripsi"
              required
              minLength={5}
              maxLength={500}
              placeholder="Keterangan singkat transaksi..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Bukti Transaksi <span className="text-slate-400">(opsional — JPG, PNG, PDF, maks 5 MB)</span>
            </label>

            {!selectedFile ? (
              <label className="flex items-center gap-2 w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition">
                <Paperclip size={15} className="flex-shrink-0" />
                <span>Klik untuk pilih file bukti...</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <FileText size={15} className="text-slate-500 flex-shrink-0" />
                <span className="text-sm text-slate-700 flex-1 truncate">{selectedFile.name}</span>
                <span className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                <button type="button" onClick={handleClearFile}>
                  <X size={14} className="text-slate-400 hover:text-red-500 transition" />
                </button>
              </div>
            )}

            {fileError && (
              <p className="text-xs text-red-500 mt-1">{fileError}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition"
              style={{ background: "#1E40AF" }}
            >
              {isPending ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Riwayat Transaksi {tahun}</p>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} transaksi</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">Tanggal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">Keterangan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">Kategori</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400">Jumlah</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400">Bukti</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                    {format(new Date(t.tanggal), "d MMM yyyy", { locale: id })}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">{t.deskripsi}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5">
                      {t.kategori_program?.warna && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: t.kategori_program.warna }}
                        />
                      )}
                      <span className="text-xs text-slate-500">{t.kategori_program?.nama ?? "—"}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span className={`font-semibold ${t.jenis === "pemasukan" ? "text-blue-600" : "text-red-500"}`}>
                      {t.jenis === "pemasukan" ? "+" : "−"} {formatRupiah(t.nominal)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {t.bukti_url ? (
                      <a
                        href={t.bukti_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <ExternalLink size={11} />
                        Lihat
                      </a>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-slate-300 hover:text-red-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    Belum ada data transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}