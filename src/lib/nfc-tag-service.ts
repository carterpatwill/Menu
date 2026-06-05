import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

type NfcTag = Database["public"]["Tables"]["nfc_tags"]["Row"];
type Supabase = SupabaseClient<Database>;

export async function listTags(
  restaurantId: string,
  supabase: Supabase
): Promise<NfcTag[]> {
  const { data, error } = await supabase
    .from("nfc_tags")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at");
  if (error || !data) return [];
  return data;
}

export async function createTag(
  restaurantId: string,
  label: string,
  supabase: Supabase
): Promise<NfcTag> {
  const { data, error } = await supabase
    .from("nfc_tags")
    .insert({ restaurant_id: restaurantId, label })
    .select("*")
    .single();
  if (error || !data) throw new Error("Failed to create tag");
  return data;
}

export async function updateTagLabel(
  id: string,
  label: string,
  supabase: Supabase
): Promise<void> {
  await supabase.from("nfc_tags").update({ label }).eq("id", id);
}
