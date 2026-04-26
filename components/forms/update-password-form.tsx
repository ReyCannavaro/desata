"use client";

import { useState } from "react";
import { updatePasswordAction } from "@/actions/auth";

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsPending(true);
    const result = await updatePasswordAction(formData);
    if (result && !result.success) {
      setError(result.error ?? "Terjadi kesalahan.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
          Password Baru
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Min. 8 karakter"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
          Konfirmasi Password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          placeholder="Ulangi password"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
          <span className="flex-shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
      >
        {isPending ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
    </form>
  );
}
