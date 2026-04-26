import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const metadata: Metadata = { title: "Reset Password — DESATA" };

export default function ResetPasswordPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <h1 className="text-lg font-semibold text-slate-900 mb-1">Reset Password</h1>
      <p className="text-sm text-slate-500 mb-6">
        Masukkan email akun Anda. Kami akan kirim link untuk reset password.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
