"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateRestaurantSettings } from "@/lib/restaurant-service";

async function getRestaurantId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!data) throw new Error("Restaurant not found");
  return data.id;
}

const VALID_THEMES = ["warm", "minimal", "bold"] as const;

export async function saveSettingsAction(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId(supabase);

  const theme = formData.get("theme") as string | null;
  const tagline = (formData.get("tagline") as string | null)?.trim() ?? "";

  if (!theme || !VALID_THEMES.includes(theme as (typeof VALID_THEMES)[number])) {
    return { error: "Invalid theme" };
  }

  await updateRestaurantSettings(restaurantId, { theme, tagline }, supabase);
  revalidatePath("/admin/settings");
  revalidatePath("/r");
  return {};
}
