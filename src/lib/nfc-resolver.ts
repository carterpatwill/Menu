import type { Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type DbRestaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type DbNfcTag = Database["public"]["Tables"]["nfc_tags"]["Row"];
type DbMenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

export interface ResolvedTag {
  tag: DbNfcTag;
  restaurant: DbRestaurant;
  items: DbMenuItem[];
}

export async function resolveTag(
  nfcId: string,
  supabase: SupabaseClient<Database>
): Promise<ResolvedTag | null> {
  const { data: tag } = await supabase
    .from("nfc_tags")
    .select("*")
    .eq("id", nfcId)
    .single();

  if (!tag) return null;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", tag.restaurant_id)
    .single();

  if (!restaurant) return null;

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", tag.restaurant_id);

  return { tag, restaurant, items: items ?? [] };
}
