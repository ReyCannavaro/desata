"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export function useRealtime<T extends Record<string, unknown>>(
  table: string,
  event: RealtimeEvent,
  onUpdate: (payload: T) => void,
  filter?: string
) {
  useEffect(() => {
    const supabase = createClient();
    const channelName = `realtime-${table}-${event}-${filter ?? "all"}`;

    const channel = supabase
      .channel(channelName)
      .on<T>(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (event === "DELETE") {
            onUpdate(payload.old as T);
          } else {
            onUpdate(payload.new as T);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, onUpdate]);
}

export function useLaporanStatusRealtime(
  laporanId: string,
  onStatusUpdate: (status: string) => void
) {
  const handleUpdate = useCallback(
    (payload: Record<string, unknown>) => {
      if (payload.status) onStatusUpdate(payload.status as string);
    },
    [onStatusUpdate]
  );

  useRealtime("laporan_warga", "UPDATE", handleUpdate, `id=eq.${laporanId}`);
}

export function useTransaksiRealtime(
  desaId: string,
  onNewTransaksi: (transaksi: Record<string, unknown>) => void
) {
  const handleInsert = useCallback(
    (transaksi: Record<string, unknown>) => onNewTransaksi(transaksi),
    [onNewTransaksi]
  );

  useRealtime("transaksi", "INSERT", handleInsert, `desa_id=eq.${desaId}`);
}

export function useLaporanRealtime(
  desaId: string,
  onUpdate: (laporan: Record<string, unknown>) => void
) {
  const handleUpdate = useCallback(
    (laporan: Record<string, unknown>) => onUpdate(laporan),
    [onUpdate]
  );

  useRealtime("laporan_warga", "*", handleUpdate, `desa_id=eq.${desaId}`);
}