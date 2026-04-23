const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const missingEnvVars = [
  !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
  !supabaseKey ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" : null,
].filter(Boolean) as string[];

export type SupabaseConnectionState = {
  configured: boolean;
  status: "ready" | "missing-env";
  missingEnvVars: string[];
};

export const supabaseConnectionState: SupabaseConnectionState = {
  configured: missingEnvVars.length === 0,
  status: missingEnvVars.length === 0 ? "ready" : "missing-env",
  missingEnvVars,
};

export const getSupabaseEnv = () => ({
  url: supabaseUrl,
  key: supabaseKey,
});
