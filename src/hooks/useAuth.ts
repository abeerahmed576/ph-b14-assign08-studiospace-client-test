"use client";

import { useSession, signOut } from "@/lib/auth-client";
import type { User, Session } from "@/types/user";

export function useAuth() {
  const { data: sessionData, isPending, error, refetch } = useSession();

  return {
    user: (sessionData?.user ?? null) as User | null,
    session: (sessionData?.session ?? null) as Session["session"] | null,
    isAuthenticated: !!sessionData?.user,
    isPending,
    error,
    signOut,
    refetch,
  };
}
