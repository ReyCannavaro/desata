"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { KATEGORI_LAPORAN_LABEL } from "@/lib/supabase/types";
import type { TransaksiWithKategori, LaporanWarga } from "@/lib/supabase/types";

interface Props {
  transaksi: TransaksiWithKategori[];
  laporan: Pick<LaporanWarga, "kategori" | "status" | "upvote_count" | "created_at">[];
  tahun: number;
}

function formatJuta(val: number) {
  return `${(val / 1_000_000).toFixed(1)} Jt`;
}

export function StatistikClient({ transaksi, laporan, tahun }: Props) {
  const pengeluaranPerKategori = transaksi
    .filter((t) => t.jenis === "pengeluaran")
    .reduce<Record<string, { nama: string; total: number; warna: string }>>(
      (acc, t) => {
        const key = t.kategori_id;
        const nama = t.kategori_program?.nama ?? "Lainnya";
        const warna = t.kategori_program?.warna ?? "#94A3B8";
        if (!acc[key]) acc[key] = { nama, total: 0, warna };
        acc[key].total += t.nominal;
        return acc;
      },
      {}
    );

  const pieData = Object.values(pengeluaranPerKategori).sort(
    (a, b) => b.total - a.total
  );

  const perBulan = Array.from({ length: 12 }, (_, i) => {
    const bulan = i + 1;
    const bulanStr = bulan.toString().padStart(2, "0");
    const prefix = `${tahun}-${bulanStr}`;
    const filtered = transaksi.filter((t) => t.tanggal.startsWith(prefix));
    return {
      bulan: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][i],
      pemasukan: filtered.filter((t) => t.jenis === "pemasukan").reduce((s, t) => s + t.nominal, 0),
      pengeluaran: filtered.filter((t) => t.jenis === "pengeluaran").reduce((s, t) => s + t.nominal, 0),
    };
  });

  const laporanPerKategori = laporan.reduce<Record<string, number>>((acc, l) => {
    acc[l.kategori] = (acc[l.kategori] ?? 0) + 1;
    return acc;
  }, {});

  const laporanChartData = Object.entries(laporanPerKategori).map(([k, v]) => ({
    name: KATEGORI_LAPORAN_LABEL[k as keyof typeof KATEGORI_LAPORAN_LABEL],
    total: v,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-5">
          Arus Kas Bulanan {tahun}
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={perBulan} barSize={12} barGap={4}>
            <XAxis dataKey="bulan" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatJuta} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
            <Tooltip
              formatter={(val: number) => `Rp ${val.toLocaleString("id-ID")}`}
              contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="pemasukan" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#F87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-5">
            Pengeluaran per Kategori
          </h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="total" nameKey="nama" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.warna} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => `Rp ${val.toLocaleString("id-ID")}`}
                    contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.slice(0, 5).map((d) => (
                  <div key={d.nama} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.warna }} />
                      <span className="text-slate-600">{d.nama}</span>
                    </div>
                    <span className="text-slate-500 font-mono">
                      {(d.total / 1_000_000).toFixed(1)} Jt
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-10">Belum ada data.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-5">
            Laporan per Kategori
          </h2>
          {laporanChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={laporanChartData} layout="vertical" barSize={16}>
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="total" name="Laporan" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-10">Belum ada data.</p>
          )}
        </div>
      </div>
    </div>
  );
}