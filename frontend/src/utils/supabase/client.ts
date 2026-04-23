import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, supabaseConnectionState } from "@/utils/supabase/state";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
	if (!supabaseConnectionState.configured) return null;

	if (!browserClient) {
		const { url, key } = getSupabaseEnv();
		browserClient = createBrowserClient(url!, key!);
	}

	return browserClient;
};

export { supabaseConnectionState };
