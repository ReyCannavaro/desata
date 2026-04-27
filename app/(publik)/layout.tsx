import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { TopBar } from "@/components/layout/top-bar";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  const data = await getCurrentUser();
  if (!data || !data.profile) redirect("/login");

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  return (
    <>
      <TopBar
        user={data.user}
        profile={profile}
        title="Pengaturan"
        subtitle="Kelola akun dan konfigurasi desa"
      />
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-lg">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Profil Akun</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Nama</p>
              <p className="text-sm font-medium text-slate-700">{profile.nama}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm font-medium text-slate-700 capitalize">
                {profile.role.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Desa</p>
              <p className="text-sm font-medium text-slate-700">
                {profile.desa?.nama ?? "—"}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Untuk mengubah email atau reset password, gunakan menu Lupa Password di halaman login.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}