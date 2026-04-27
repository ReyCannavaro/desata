import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = { title: "Login — DESATA" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <h1 className="text-lg font-semibold text-slate-900 mb-1">
        Masuk ke Dashboard
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Khusus perangkat desa yang terdaftar
      </p>

      {params.message === "password-updated" && (
        <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          ✓ Password berhasil diperbarui. Silakan login.
        </div>
      )}

      <LoginForm redirectTo={params.redirect} />

      <p className="mt-6 text-center text-xs text-slate-400">
        Belum punya akun?{" "}
        <span className="text-slate-500">Hubungi Super Admin desa Anda.</span>
      </p>
    </div>
  );
}