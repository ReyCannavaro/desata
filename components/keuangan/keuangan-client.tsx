"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  createTransaksiAction,
  deleteTransaksiAction,
} from "@/actions/keuangan";
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
  const [showForm, setShowForm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"semua" | "pemasukan" | "pengeluaran">(
    "semua"
  );

  const [kategoriList, setKategoriList] = useState<KategoriProgram[]>([]);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setWarning(null);

    const fd = new FormData(e.currentTarget);
    const result = await createTransaksiAction({
      jenis: fd.get("jenis") as "pemasukan" | "pengeluaran",
      kategori_id: fd.get("kategori_id") as string,
      nominal: parseFloat(fd.get("nominal") as string),
      deskripsi: fd.get("deskripsi") as string,
      tanggal: fd.get("tanggal") as string,
      bukti_url: (fd.get("bukti_url") as string) || null,
    });

    if (result.success) {
      setShowForm(false);
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
    if (result.success) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      {warning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle
            size={16}
            className="text-amber-600 flex-shrink-0 mt-0.5"
          />
          <p className="text-sm text-amber-700">{warning}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Pemasukan",
            value: summary.totalPemasukan,
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Pengeluaran",
            value: summary.totalPengeluaran,
            icon: TrendingDown,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Saldo",
            value: summary.saldo,
            icon: Landmark,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
          >
            <div
              className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}
            >
              <Icon size={16} className={color} />
            </div>
            <p className="text-xs text-slate-500">
              {label} {tahun}
            </p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">
              {formatRupiah(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(["semua", "pemasukan", "pengeluaran"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                filter === f
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition"
        >
          <Plus size={15} />
          Tambah Transaksi
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Tambah Transaksi Baru
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Jenis
              </label>
              <select
                name="jenis"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nominal (Rp)
              </label>
              <input
                name="nominal"
                type="number"
                min={1}
                required
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tanggal
              </label>
              <input
                name="tanggal"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Kategori
              </label>
              <select
                name="kategori_id"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Pilih kategori —</option>
                {kategoriList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
              {kategoriList.length === 0 && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Belum ada kategori. Tambahkan dulu di pengaturan.
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Deskripsi
              </label>
              <input
                name="deskripsi"
                type="text"
                required
                minLength={5}
                maxLength={500}
                placeholder="Keterangan transaksi..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                URL Bukti (opsional)
              </label>
              <input
                name="bukti_url"
                type="url"
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error && (
              <div className="col-span-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition"
              >
                {isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                Tanggal
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                Deskripsi
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                Kategori
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">
                Nominal
              </th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                  {format(new Date(t.tanggal), "d MMM yyyy", { locale: id })}
                </td>
                <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">
                  {t.deskripsi}
                </td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1.5">
                    {t.kategori_program?.warna && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: t.kategori_program.warna }}
                      />
                    )}
                    <span className="text-xs text-slate-500">
                      {t.kategori_program?.nama ?? "—"}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <span
                    className={`font-semibold ${
                      t.jenis === "pemasukan"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {t.jenis === "pemasukan" ? "+" : "−"}{" "}
                    {formatRupiah(t.nominal)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-slate-300 hover:text-red-500 transition p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-sm text-slate-400"
                >
                  Tidak ada data transaksi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}