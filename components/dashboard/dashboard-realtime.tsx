"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/hooks/use-realtime";
import { Bell } from "lucide-react";
import { useState } from "react";

interface Props {
  desaId: string;
}

export function DashboardRealtime({ desaId }: Props) {
  const router = useRouter();
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const addToast = (msg: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev.slice(-2), { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const handleNewLaporan = useCallback(
    (payload: Record<string, unknown>) => {
      const judul = (payload.judul as string) ?? "Laporan baru";
      addToast(`📋 Laporan baru masuk: "${judul}"`);
      router.refresh();
    },
    [router]
  );

  const handleNewTransaksi = useCallback(
    (payload: Record<string, unknown>) => {
      const nominal = (payload.nominal as number) ?? 0;
      const jenis = (payload.jenis as string) ?? "transaksi";
      addToast(
        `💰 Transaksi ${jenis} baru: Rp ${nominal.toLocaleString("id-ID")}`
      );
      router.refresh();
    },
    [router]
  );

  useRealtime(
    "laporan_warga",
    "INSERT",
    handleNewLaporan,
    `desa_id=eq.${desaId}`
  );

  useRealtime(
    "transaksi",
    "INSERT",
    handleNewTransaksi,
    `desa_id=eq.${desaId}`
  );

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-slate-800 text-white text-sm px-4 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2"
          style={{ maxWidth: 320 }}
        >
          <Bell size={14} className="flex-shrink-0 text-blue-400" />
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
