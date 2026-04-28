import type { Metadata } from "next";
import { getKeuanganPublik } from "@/actions/keuangan";
import { getLaporanPublik } from "@/actions/laporan";
import { getPublikDesaIdSafe } from "@/lib/get-desa-id";
import { StatistikClient } from "@/components/statistik/statistik-client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { TrendingUp, TrendingDown, Landmark } from "lucide-react";

export const metadata: Metadata = { title: "Transparansi Keuangan — DESATA" };

function formatRupiah(num: number) {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)} M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export default async function TransparansiPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const params = await searchParams;
  const tahun = params.tahun ? parseInt(params.tahun) : new Date().getFullYear();

  const desaId = await getPublikDesaIdSafe();

  const [keuangan, laporanResult] = await Promise.all([
    desaId
      ? getKeuanganPublik({ desaId, tahun }).catch(() => ({
          transaksi: [],
          summary: { totalPemasukan: 0, totalPengeluaran: 0, saldo: 0 },
        }))
      : Promise.resolve({
          transaksi: [],
          summary: { totalPemasukan: 0, totalPengeluaran: 0, saldo: 0 },
        }),
    desaId
      ? getLaporanPublik({ desaId, sortBy: "terbaru" }).catch(() => ({
          laporan: [],
          total: 0,
          page: 1,
          totalPages: 1,
        }))
      : Promise.resolve({ laporan: [], total: 0, page: 1, totalPages: 1 }),
  ]);

  const { transaksi, summary } = keuangan;
  const laporan = laporanResult.laporan;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Transparansi Keuangan Desa</h1>
        <p className="text-sm text-slate-500 mt-1">
          Data APBDes yang dapat diakses seluruh warga
        </p>
      </div>

      {!desaId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          Konfigurasi desa belum diatur. Hubungi administrator.
        </div>
      )}

      <div className="flex gap-2">
        {[tahun - 1, tahun].map((t) => (
          <a
            key={t}
            href={`/transparansi?tahun=${t}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              t === tahun
                ? "text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            style={t === tahun ? { background: "#1E40AF" } : {}}
          >
            {t}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Pemasukan",
            value: summary.totalPemasukan,
            icon: TrendingUp,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Total Pengeluaran",
            value: summary.totalPengeluaran,
            icon: TrendingDown,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Saldo Saat Ini",
            value: summary.saldo,
            icon: Landmark,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-xs text-slate-500">
              {label} {tahun}
            </p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(value)}</p>
          </div>
        ))}
      </div>

      <StatistikClient
        transaksi={transaksi as Parameters<typeof StatistikClient>[0]["transaksi"]}
        laporan={laporan}
        tahun={tahun}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Riwayat Transaksi {tahun}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{transaksi.length} transaksi ditemukan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">Tanggal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">Keterangan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400">Kategori</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transaksi.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                    {format(new Date(t.tanggal), "d MMM yyyy", { locale: id })}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 max-w-xs">{t.deskripsi}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5">
                      {(
                        t as typeof t & {
                          kategori_program?: { warna: string } | null;
                        }
                      ).kategori_program?.warna && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              (
                                t as typeof t & {
                                  kategori_program?: { warna: string } | null;
                                }
                              ).kategori_program?.warna ?? "#94A3B8",
                          }}
                        />
                      )}
                      <span className="text-xs text-slate-500">
                        {(
                          t as typeof t & {
                            kategori_program?: { nama: string } | null;
                          }
                        ).kategori_program?.nama ?? "—"}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        t.jenis === "pemasukan" ? "text-blue-600" : "text-red-500"
                      }`}
                    >
                      {t.jenis === "pemasukan" ? "+" : "−"} {formatRupiah(t.nominal)}
                    </span>
                  </td>
                </tr>
              ))}
              {transaksi.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">
                    Belum ada data transaksi untuk tahun {tahun}.
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
