import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv, supabaseConnectionState } from "@/utils/supabase/state";

export const createClient = (request: NextRequest) => {
  if (!supabaseConnectionState.configured) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  const { url, key } = getSupabaseEnv();

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  createServerClient(url!, key!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  return supabaseResponse;
};
