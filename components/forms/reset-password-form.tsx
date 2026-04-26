"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await resetPasswordAction(formData);
    setStatus(result.success ? "success" : "error");
    setIsPending(false);
  }

  if (status === "success") {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-emerald-600 text-xl">✓</span>
        </div>
        <p className="text-sm font-medium text-slate-800 mb-1">Email terkirim!</p>
        <p className="text-sm text-slate-500 mb-6">
          Cek inbox Anda dan klik link reset password. Link berlaku 1 jam.
        </p>
        <Link href="/login" className="text-sm text-emerald-600 hover:underline">
          Kembali ke Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="admin@desata.id"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>

      {status === "error" && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          Terjadi kesalahan. Coba lagi.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
      >
        {isPending ? "Mengirim..." : "Kirim Link Reset"}
      </button>

      <div className="text-center">
        <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">
          ← Kembali ke Login
        </Link>
      </div>
    </form>
  );
}
