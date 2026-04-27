"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, Wallet, Flag, BarChart3, FileText, Settings } from "lucide-react";
import type { UserProfile } from "@/lib/supabase/types";

interface Props { profile: UserProfile & { desa: { nama: string } | null } }

const MENU_UTAMA = [
  { label: "Dashboard",   href: "/dashboard",  icon: LayoutDashboard },
  { label: "Portal",     href: "/portal",     icon: Home },
  { label: "Keuangan",    href: "/keuangan",    icon: Wallet },
  { label: "Lapor Warga", href: "/laporan",     icon: Flag },
  { label: "Statistik",   href: "/statistik",   icon: BarChart3 },
];
const MENU_LAINNYA = [
  { label: "Dokumen",     href: "/dokumen",     icon: FileText },
  { label: "Pengaturan",  href: "/pengaturan",  icon: Settings },
];

export function SidebarNav({ profile }: Props) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="w-[220px] min-h-screen flex flex-col flex-shrink-0" style={{ background: "#1E3A8A" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="DESATA" className="w-7 h-8 flex-shrink-0" />
          <span className="text-white font-bold text-lg tracking-wide">DESATA</span>
        </div>
        <p className="text-white/40 text-[10px] mt-1 truncate pl-[36px]">
          {profile.desa?.nama ?? "Desa"}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div>
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">Menu Utama</p>
          <div className="space-y-0.5">
            {MENU_UTAMA.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                  style={active ? { background: "rgba(255,255,255,0.15)" } : {}}>
                  <Icon size={17} strokeWidth={active ? 2.5 : 2} />{label}
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">Lainnya</p>
          <div className="space-y-0.5">
            {MENU_LAINNYA.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                  style={active ? { background: "rgba(255,255,255,0.15)" } : {}}>
                  <Icon size={17} />{label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
            <span className="text-white text-xs font-semibold">{profile.nama?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile.nama}</p>
            <p className="text-white/40 text-[10px] capitalize">{profile.role.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}