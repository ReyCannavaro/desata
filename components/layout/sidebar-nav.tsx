"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Globe, Wallet, ClipboardList,
  BarChart3, FolderOpen, Settings, ChevronRight,
  LogOut, MapPin,
} from "lucide-react";
import type { UserProfile } from "@/lib/supabase/types";
import { logoutAction } from "@/actions/auth";

interface Props { profile: UserProfile & { desa: { nama: string } | null } }

const MENU_UTAMA = [
  { label: "Dashboard",   href: "/dashboard",  icon: LayoutDashboard },
  { label: "Portal",      href: "/portal",      icon: Globe },
  { label: "Keuangan",    href: "/keuangan",    icon: Wallet },
  { label: "Lapor Warga", href: "/laporan",     icon: ClipboardList },
  { label: "Statistik",   href: "/statistik",   icon: BarChart3 },
];
const MENU_LAINNYA = [
  { label: "Dokumen",     href: "/dokumen",     icon: FolderOpen },
  { label: "Pengaturan",  href: "/pengaturan",  icon: Settings },
];

export function SidebarNav({ profile }: Props) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      className="w-[240px] min-h-screen flex flex-col flex-shrink-0"
      style={{ background: "linear-gradient(180deg, #1E3A8A 0%, #1E2D6B 100%)" }}
    >
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
            <MapPin size={17} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base tracking-wide leading-none">DESATA</p>
            <p className="text-white/50 text-[10px] mt-0.5 truncate max-w-[130px]">
              {profile.desa?.nama ?? "Desa"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        <div>
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] px-3 mb-2">
            Menu Utama
          </p>
          <div className="space-y-0.5">
            {MENU_UTAMA.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-white shadow-sm"
                      : "text-white/65 hover:text-white hover:bg-white/8"
                  }`}
                  style={active ? { background: "rgba(255,255,255,0.18)" } : {}}
                >
                  <Icon size={17} strokeWidth={active ? 2.5 : 1.8} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={13} className="opacity-50" />}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] px-3 mb-2">
            Lainnya
          </p>
          <div className="space-y-0.5">
            {MENU_LAINNYA.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-white"
                      : "text-white/65 hover:text-white hover:bg-white/8"
                  }`}
                  style={active ? { background: "rgba(255,255,255,0.18)" } : {}}
                >
                  <Icon size={17} strokeWidth={active ? 2.5 : 1.8} className="flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={13} className="opacity-50" />}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="mx-3 mb-4 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            {profile.nama?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{profile.nama}</p>
            <p className="text-white/45 text-[10px] capitalize mt-0.5">
              {profile.role.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <LogOut size={13} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
