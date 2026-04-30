"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Eye, Download, FileText, Image, Upload } from "lucide-react";
import type { TransaksiWithKategori } from "@/lib/supabase/types";

interface Props {
  dokumen: TransaksiWithKategori[];
}

function getTipe(url: string): "JPG" | "PNG" | "PDF" | "DOC" {
  const lower = url.toLowerCase();
  if (lower.includes(".pdf")) return "PDF";
  if (lower.includes(".png")) return "PNG";
  if (lower.includes(".doc")) return "DOC";
  return "JPG";
}

function getTipeColor(tipe: string) {
  if (tipe === "PDF") return { bg: "#EFF6FF", text: "#1E40AF" };
  if (tipe === "PNG") return { bg: "#F0FDF4", text: "#16A34A" };
  if (tipe === "DOC") return { bg: "#FEF9C3", text: "#CA8A04" };
  return { bg: "#EFF6FF", text: "#1E40AF" };
}

function isImage(url: string) {
  return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url);
}

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

const KATEGORI_SEMUA = "semua";

export function DokumenClient({ dokumen }: Props) {
  const [search, setSearch] = useState("");
  const [filterTipe, setFilterTipe] = useState("semua");
  const [filterKategori, setFilterKategori] = useState(KATEGORI_SEMUA);
  const [preview, setPreview] = useState<TransaksiWithKategori | null>(null);

  const kategoriList = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; nama: string }[] = [];
    dokumen.forEach((d) => {
      const nama = d.kategori_program?.nama;
      if (nama && !seen.has(nama)) {
        seen.add(nama);
        list.push({ id: nama, nama });
      }
    });
    return list;
  }, [dokumen]);

  const filtered = useMemo(() => {
    return dokumen.filter((d) => {
      if (!d.bukti_url) return false;
      const tipe = getTipe(d.bukti_url);
      const matchSearch =
        !search ||
        d.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
        (d.kategori_program?.nama ?? "").toLowerCase().includes(search.toLowerCase());
      const matchTipe = filterTipe === "semua" || tipe === filterTipe;
      const matchKat =
        filterKategori === KATEGORI_SEMUA ||
        d.kategori_program?.nama === filterKategori;
      return matchSearch && matchTipe && matchKat;
    });
  }, [dokumen, search, filterTipe, filterKategori]);

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterTipe}
          onChange={(e) => setFilterTipe(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="semua">Semua Tipe</option>
          <option value="JPG">JPG</option>
          <option value="PNG">PNG</option>
          <option value="PDF">PDF</option>
        </select>

        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={KATEGORI_SEMUA}>Semua Kategori</option>
          {kategoriList.map((k) => (
            <option key={k.id} value={k.nama}>{k.nama}</option>
          ))}
        </select>

        <button
          disabled
          title="Fitur upload dokumen akan segera tersedia"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white opacity-70 cursor-not-allowed"
          style={{ background: "#1E40AF" }}
        >
          <Upload size={14} />
          Upload Dokumen
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <FileText size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">Belum ada dokumen</p>
          <p className="text-xs text-slate-400 mt-1">
            Dokumen muncul otomatis saat transaksi memiliki bukti terlampir
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => {
            const url = d.bukti_url!;
            const tipe = getTipe(url);
            const warna = getTipeColor(tipe);
            const gambar = isImage(url);
            const kategoriNama = d.kategori_program?.nama ?? "—";
            const tanggal = format(new Date(d.tanggal), "d MMM yyyy", { locale: id });

            return (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-200 transition group"
              >
                <div className="relative h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {gambar ? (
                    <img
                      src={url}
                      alt={d.deskripsi}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={36} className="text-slate-300" />
                      <span className="text-xs text-slate-400 font-medium">{tipe}</span>
                    </div>
                  )}

                  <span
                    className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: warna.text, color: "#fff" }}
                  >
                    {tipe}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{d.deskripsi}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {kategoriNama} · {tanggal}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400">
                      {d.jenis === "pengeluaran" ? "−" : "+"} Rp {d.nominal.toLocaleString("id-ID")}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreview(d)}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition hover:bg-blue-50 text-blue-600"
                      >
                        <Eye size={12} />
                        Lihat
                      </button>
                      <a
                        href={url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition hover:bg-slate-100 text-slate-500"
                      >
                        <Download size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800 line-clamp-1">{preview.deskripsi}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {preview.kategori_program?.nama ?? "—"} · {format(new Date(preview.tanggal), "d MMM yyyy", { locale: id })}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <a
                  href={preview.bukti_url!}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  <Download size={12} />
                  Unduh
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 bg-slate-50 flex items-center justify-center min-h-64">
              {isImage(preview.bukti_url!) ? (
                <img
                  src={preview.bukti_url!}
                  alt={preview.deskripsi}
                  className="max-w-full max-h-[70vh] rounded-xl object-contain"
                />
              ) : (
                <iframe
                  src={preview.bukti_url!}
                  className="w-full h-[70vh] rounded-xl"
                  title={preview.deskripsi}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
