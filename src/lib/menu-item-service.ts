import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type MenuItemInsert = Database["public"]["Tables"]["menu_items"]["Insert"];
type MenuItemUpdate = Database["public"]["Tables"]["menu_items"]["Update"];
type Supabase = SupabaseClient<Database>;

export async function listItems(
  restaurantId: string,
  supabase: Supabase
): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("sort_order");
  if (error || !data) return [];
  return data;
}

export async function createItem(
  item: MenuItemInsert,
  supabase: Supabase
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("menu_items")
    .insert(item)
    .select("id")
    .single();
  if (error || !data) throw new Error("Failed to create item");
  return { id: data.id };
}

export async function updateItem(
  id: string,
  updates: MenuItemUpdate,
  supabase: Supabase
): Promise<void> {
  await supabase.from("menu_items").update(updates).eq("id", id);
}

export async function deleteItem(id: string, supabase: Supabase): Promise<void> {
  await supabase.from("menu_items").delete().eq("id", id);
}

export async function toggleAvailable(
  id: string,
  current: boolean,
  supabase: Supabase
): Promise<void> {
  await supabase
    .from("menu_items")
    .update({ is_available: !current })
    .eq("id", id);
}

export async function toggleFeatured(
  id: string,
  current: boolean,
  supabase: Supabase
): Promise<void> {
  await supabase
    .from("menu_items")
    .update({ is_featured: !current })
    .eq("id", id);
}
