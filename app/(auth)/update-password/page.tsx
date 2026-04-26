import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";

export const metadata: Metadata = { title: "Buat Password Baru — DESATA" };

export default function UpdatePasswordPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <h1 className="text-lg font-semibold text-slate-900 mb-1">Buat Password Baru</h1>
      <p className="text-sm text-slate-500 mb-6">
        Password minimal 8 karakter, mengandung huruf besar dan angka.
      </p>
      <UpdatePasswordForm />
    </div>
  );
}
