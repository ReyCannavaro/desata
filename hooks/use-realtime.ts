"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

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
      .on(
        "postgres_changes" as Parameters<typeof channel.on>[0],
        {
          event,
          schema: "public",
          table,
          filter,
        },
        (payload: { new: T; old: T }) => {
          onUpdate(event === "DELETE" ? payload.old : payload.new);
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

  useRealtime(
    "laporan_warga",
    "UPDATE",
    handleUpdate,
    `id=eq.${laporanId}`
  );
}

export function useTransaksiRealtime(
  desaId: string,
  onNewTransaksi: (transaksi: Record<string, unknown>) => void
) {
  const handleInsert = useCallback(onNewTransaksi, [onNewTransaksi]);

  useRealtime(
    "transaksi",
    "INSERT",
    handleInsert,
    `desa_id=eq.${desaId}`
  );
}