"use client";

import { Bell } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/supabase/types";

interface TopBarProps {
  user: User;
  profile: UserProfile & { desa: { nama: string } | null };
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TopBar({ profile, title, subtitle, action }: TopBarProps) {
  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        )}
        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {action}

        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 transition">
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs text-slate-400 hover:text-slate-600 transition px-2 py-1 rounded hover:bg-slate-50"
          >
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
