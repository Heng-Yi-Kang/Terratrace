import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv, supabaseConnectionState } from "@/utils/supabase/state";

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  if (!supabaseConnectionState.configured) return null;

  const { url, key } = getSupabaseEnv();

  return createServerClient(url!, key!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The setAll method can be called from a Server Component.
          // This is expected when middleware handles session refresh.
        }
      },
    },
  });
};

export { supabaseConnectionState };
