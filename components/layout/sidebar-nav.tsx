"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Wallet,
  Flag,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";
import type { UserProfile } from "@/lib/supabase/types";

interface SidebarNavProps {
  profile: UserProfile & { desa: { nama: string } | null };
}

const MENU_UTAMA = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Keuangan", href: "/keuangan", icon: Wallet },
  { label: "Laporan Warga", href: "/laporan/admin", icon: Flag },
  { label: "Statistik", href: "/statistik", icon: BarChart3 },
];

const MENU_LAINNYA = [
  { label: "Dokumen", href: "/dokumen", icon: FileText },
  { label: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export function SidebarNav({ profile }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside
      className="w-[220px] min-h-screen flex flex-col flex-shrink-0"
      style={{ background: "#1E3A8A" }}
    >
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 100 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 100 C15 100 5 85 5 60 C5 35 20 15 45 8 L65 5 C80 3 95 15 95 35 C95 55 80 65 65 70 L40 78 C25 83 20 92 25 105 Z"
              fill="#60A5FA"
            />
            <path
              d="M25 108 C25 108 18 95 20 75 C22 55 35 42 55 38 L72 35 C83 33 90 42 88 55 C86 68 76 75 65 78 L45 84 C32 89 28 98 32 110 Z"
              fill="#3B82F6"
            />
            <path
              d="M35 112 C35 112 30 100 33 85 C36 70 47 60 63 57 L76 55 C84 54 89 61 87 70 C85 79 77 85 68 87 L52 92 C42 96 38 104 40 114 Z"
              fill="#93C5FD"
            />
          </svg>
          <span className="text-white font-bold text-lg tracking-wide">
            DESATA
          </span>
        </div>
        <p className="text-white/40 text-[10px] mt-1 leading-tight">
          {profile.desa?.nama ?? "Desa"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div>
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
            Menu Utama
          </p>
          <div className="space-y-0.5">
            {MENU_UTAMA.map(({ label, href, icon: Icon }) => {
              const active =
                pathname !== null &&
                (pathname === href || pathname.startsWith(href + "/"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon size={17} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
            Lainnya
          </p>
          <div className="space-y-0.5">
            {MENU_LAINNYA.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-400/30 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {profile.nama?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {profile.nama}
            </p>
            <p className="text-white/40 text-[10px] capitalize">
              {profile.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}