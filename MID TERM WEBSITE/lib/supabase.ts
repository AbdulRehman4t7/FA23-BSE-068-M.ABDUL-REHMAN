import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isRealSupabaseValue(value: string | undefined, placeholder: string) {
  return typeof value === "string" && value.length > 10 && !value.includes(placeholder);
}

export const isSupabaseConfigured =
  typeof supabaseUrl === "string" &&
  supabaseUrl.startsWith("http") &&
  isRealSupabaseValue(supabaseAnonKey, "your-anon-key") &&
  !supabaseUrl.includes("your-supabase-url");

export const isSupabaseAdminConfigured =
  isSupabaseConfigured && isRealSupabaseValue(supabaseServiceRoleKey, "your-service-role-key");

// Standard client for client-side and authenticated server-side
// In demo/assignment mode the env may contain placeholders; avoid import-time crashes.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : (null as any);

// Admin client for bypass RLS when needed (Server side only!)
export const getSupabaseAdmin = () => {
  if (!isSupabaseAdminConfigured) return null as any;
  return createClient(supabaseUrl as string, supabaseServiceRoleKey as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
