import type { SupabaseClient } from "@supabase/supabase-js";

export async function isAuthenticated(
  supabase: Pick<SupabaseClient, "auth">
): Promise<boolean> {
  const { data, error } = await supabase.auth.getUser();
  return !error && data.user !== null;
}
