import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side session state for the NBC Hospitality platform.
 *
 * One hook serves both audiences — customers and hotel partners — because they
 * share the same authentication service. Only the entry points differ.
 */

export interface NbcProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  country: string | null;
  preferredLanguage: string;
  avatarUrl: string | null;
  nbcAccountLinked: boolean;
}

export type NbcRole = "customer" | "hotel_admin" | "nbc_admin";

export interface NbcSession {
  loading: boolean;
  user: User | null;
  profile: NbcProfile | null;
  roles: NbcRole[];
  isVerified: boolean;
  refresh: () => Promise<void>;
}

const REMEMBER_KEY = "nbc.auth.remember";
const SESSION_SENTINEL = "nbc.auth.session-open";

/** Records the Remember Me choice made on the sign-in screen. */
export function setRememberMe(remember: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  window.sessionStorage.setItem(SESSION_SENTINEL, "1");
}

/**
 * Ends sessions that were not marked "remember me" once the browser session
 * has ended (the tab-scoped sentinel is gone but the token is still stored).
 */
export async function enforceRememberMe(): Promise<void> {
  if (typeof window === "undefined") return;
  const remember = window.localStorage.getItem(REMEMBER_KEY);
  if (remember !== "0") return;
  if (window.sessionStorage.getItem(SESSION_SENTINEL)) return;
  window.localStorage.removeItem(REMEMBER_KEY);
  await supabase.auth.signOut();
}

export async function signOutEverywhere(): Promise<void> {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(REMEMBER_KEY);
    window.sessionStorage.removeItem(SESSION_SENTINEL);
  }
  await supabase.auth.signOut();
}

function mapProfile(row: Record<string, unknown>): NbcProfile {
  return {
    id: row.id as string,
    firstName: (row.first_name as string) ?? "",
    lastName: (row.last_name as string) ?? "",
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    emailVerified: Boolean(row.email_verified),
    phoneVerified: Boolean(row.phone_verified),
    country: (row.country as string | null) ?? null,
    preferredLanguage: (row.preferred_language as string) ?? "en",
    avatarUrl: (row.avatar_url as string | null) ?? null,
    nbcAccountLinked: Boolean(row.nbc_account_linked),
  };
}

export function useNbcSession(): NbcSession {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<NbcProfile | null>(null);
  const [roles, setRoles] = useState<NbcRole[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const nextUser = data.user ?? null;
    setUser(nextUser);

    if (!nextUser) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const [profileResult, rolesResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", nextUser.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", nextUser.id),
    ]);

    setProfile(profileResult.data ? mapProfile(profileResult.data as Record<string, unknown>) : null);
    setRoles(((rolesResult.data ?? []) as { role: NbcRole }[]).map((row) => row.role));
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      await enforceRememberMe();
      if (active) await load();
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void load();
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [load]);

  return {
    loading,
    user,
    profile,
    roles,
    isVerified: Boolean(profile?.emailVerified && profile?.phoneVerified),
    refresh: load,
  };
}
