"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { upvoteLaporanAction } from "@/actions/laporan";

interface Props {
  laporanId: string;
  initialCount: number;
}

function getFingerprint(): string {
  const KEY = "desata_fp";
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, fp);
  }
  return fp;
}

export function UpvoteButton({ laporanId, initialCount }: Props) {
  const [count, setCount]         = useState(initialCount);
  const [voted, setVoted]         = useState(false);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const voted = localStorage.getItem(`upvote_${laporanId}`);
    if (voted) setVoted(true);
  }, [laporanId]);

  async function handleUpvote(e: React.MouseEvent) {
    e.preventDefault(); // jangan trigger Link parent
    e.stopPropagation();
    if (voted || loading) return;

    setLoading(true);
    const fp = getFingerprint();
    const result = await upvoteLaporanAction(laporanId, fp);

    if (result.success) {
      setCount((c) => c + 1);
      setVoted(true);
      localStorage.setItem(`upvote_${laporanId}`, "1");
    } else if (result.alreadyVoted) {
      setVoted(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={voted || loading}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition select-none ${
        voted
          ? "bg-blue-100 text-blue-700 cursor-default"
          : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
      }`}
      title={voted ? "Sudah didukung" : "Dukung laporan ini"}
    >
      <ChevronUp size={13} className={loading ? "animate-bounce" : ""} />
      {count}
    </button>
  );
}
