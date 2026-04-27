import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getCurrentUser();

  if (!data || !data.profile) {
    redirect("/login");
  }

  const profile = data.profile as typeof data.profile & {
    desa: { nama: string } | null;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}