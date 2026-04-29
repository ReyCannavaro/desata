"use client";

import { Bell, ChevronDown } from "lucide-react";
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
    <header className="bg-white border-b border-slate-100 px-6 py-0 flex items-center justify-between flex-shrink-0 h-16 gap-4">
      {/* Title */}
      <div className="min-w-0">
        {title && (
          <h1 className="text-base font-semibold text-slate-800 leading-tight">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {action}

        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-50 transition border border-slate-100">
          <Bell size={16} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "#1E40AF" }}
          >
            {profile.nama?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700 leading-tight">{profile.nama}</p>
            <p className="text-[10px] text-slate-400 capitalize">
              {profile.role.replace(/_/g, " ")}
            </p>
          </div>
          <ChevronDown size={13} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}
