import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type RestaurantUpdate = Database["public"]["Tables"]["restaurants"]["Update"];
type Category = Database["public"]["Enums"]["category"];
type Supabase = SupabaseClient<Database>;

const CATEGORY_TO_FLAG: Record<Category, keyof Pick<
  Restaurant,
  | "has_specials"
  | "has_appetizers"
  | "has_mains"
  | "has_sides"
  | "has_drinks"
  | "has_desserts"
>> = {
  specials: "has_specials",
  appetizers: "has_appetizers",
  mains: "has_mains",
  sides: "has_sides",
  drinks: "has_drinks",
  desserts: "has_desserts",
};

export async function toggleCategory(
  restaurantId: string,
  category: Category,
  enabled: boolean,
  supabase: Supabase
): Promise<void> {
  const flag = CATEGORY_TO_FLAG[category];
  const update: RestaurantUpdate = { [flag]: enabled };
  await supabase
    .from("restaurants")
    .update(update)
    .eq("id", restaurantId);
}

export async function getRestaurantById(
  restaurantId: string,
  supabase: Supabase
): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single();
  if (error || !data) return null;
  return data;
}
