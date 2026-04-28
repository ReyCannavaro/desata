"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/hooks/use-realtime";

interface Props {
  desaId: string;
}

export function LaporanRealtime({ desaId }: Props) {
  const router = useRouter();

  const handleChange = useCallback(() => {
    router.refresh();
  }, [router]);

  useRealtime("laporan_warga", "*", handleChange, `desa_id=eq.${desaId}`);

  return null;
}
