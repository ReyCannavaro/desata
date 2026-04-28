import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { TopBar } from "@/components/layout/top-bar";
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileImage,
  Lock,
  BookOpen,
  Gavel,
  ScrollText,
} from "lucide-react";

export const metadata: Metadata = { title: "Dokumen — DESATA" };

const KATEGORI_DOKUMEN = [
  {
    id: "apbdes",
    label: "APBDes",
    icon: FileSpreadsheet,
    warna: "#1E40AF",
    bg: "#EFF6FF",
    deskripsi: "Anggaran Pendapatan dan Belanja Desa",
    dokumen: [
      { nama: "APBDes 2025 — Final", tipe: "PDF", ukuran: "2.4 MB", tanggal: "15 Jan 2025" },
      { nama: "APBDes 2024 — Final", tipe: "PDF", ukuran: "2.1 MB", tanggal: "10 Jan 2024" },
      { nama: "Perubahan APBDes 2024", tipe: "PDF", ukuran: "1.8 MB", tanggal: "5 Aug 2024" },
    ],
  },
  {
    id: "perdes",
    label: "Peraturan Desa",
    icon: Gavel,
    warna: "#7C3AED",
    bg: "#F5F3FF",
    deskripsi: "Peraturan dan kebijakan resmi desa",
    dokumen: [
      { nama: "Perdes No. 1/2025 — Tata Kelola", tipe: "PDF", ukuran: "890 KB", tanggal: "20 Feb 2025" },
      { nama: "Perdes No. 3/2024 — BUMDes", tipe: "PDF", ukuran: "1.2 MB", tanggal: "8 Mar 2024" },
    ],
  },
  {
    id: "rpjm",
    label: "RPJM Desa",
    icon: BookOpen,
    warna: "#059669",
    bg: "#ECFDF5",
    deskripsi: "Rencana Pembangunan Jangka Menengah",
    dokumen: [
      { nama: "RPJM Desa 2024–2029", tipe: "PDF", ukuran: "5.6 MB", tanggal: "3 Apr 2024" },
      { nama: "RKP Desa 2025", tipe: "PDF", ukuran: "3.1 MB", tanggal: "12 Dec 2024" },
    ],
  },
  {
    id: "laporan",
    label: "Laporan Realisasi",
    icon: ScrollText,
    warna: "#D97706",
    bg: "#FFFBEB",
    deskripsi: "Laporan realisasi anggaran per semester",
    dokumen: [
      { nama: "Laporan Realisasi Sem. 1 — 2025", tipe: "PDF", ukuran: "1.7 MB", tanggal: "15 Jul 2025" },
      { nama: "Laporan Realisasi Sem. 2 — 2024", tipe: "PDF", ukuran: "1.9 MB", tanggal: "10 Jan 2025" },
      { nama: "Laporan Akhir Tahun 2024", tipe: "PDF", ukuran: "4.2 MB", tanggal: "31 Jan 2025" },
    ],
  },
];

const IKON_TIPE: Record<string, typeof FileText> = {
  PDF: FileText,
  XLS: FileSpreadsheet,
  IMG: FileImage,
};

export default async function DokumenPage() {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Dokumen Desa"
        subtitle="Arsip dokumen resmi dan regulasi desa"
      />
      <main className="flex-1 p-6 space-y-6">

        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <Lock size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Dokumen ini tersimpan di sistem. Fitur upload dan manajemen dokumen akan segera tersedia.
            Hubungi administrator untuk akses dokumen tertentu.
          </p>
        </div>

        {/* Dokumen per kategori */}
        {KATEGORI_DOKUMEN.map((kat) => {
          const KatIcon = kat.icon;
          return (
            <div key={kat.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Header kategori */}
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: kat.bg }}
                >
                  <KatIcon size={17} style={{ color: kat.warna }} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">{kat.label}</h2>
                  <p className="text-xs text-slate-400">{kat.deskripsi}</p>
                </div>
                <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                  {kat.dokumen.length} dokumen
                </span>
              </div>

              <ul className="divide-y divide-slate-50">
                {kat.dokumen.map((dok) => {
                  const DokIcon = IKON_TIPE[dok.tipe] ?? FileText;
                  return (
                    <li
                      key={dok.nama}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: kat.bg }}
                      >
                        <DokIcon size={14} style={{ color: kat.warna }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{dok.nama}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {dok.tipe} · {dok.ukuran} · Diunggah {dok.tanggal}
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
                        style={{ color: kat.warna, background: kat.bg }}
                        title="Unduh dokumen"
                      >
                        <Download size={13} />
                        Unduh
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <FileText size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">Upload Dokumen Baru</p>
          <p className="text-xs text-slate-400 mt-1">Fitur upload dokumen akan tersedia segera</p>
        </div>

      </main>
    </>
  );
}
