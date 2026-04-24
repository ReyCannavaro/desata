"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/supabase/types";

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setState({ user, profile, isLoading: false });
      } else {
        setState({ user: null, profile: null, isLoading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setState({ user: session.user, profile, isLoading: false });
        } else {
          setState({ user: null, profile: null, isLoading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
}