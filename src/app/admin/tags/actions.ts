"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTag, updateTagLabel } from "@/lib/nfc-tag-service";

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

export async function createTagAction(
  formData: FormData
): Promise<{ error?: string }> {
  const label = (formData.get("label") as string | null)?.trim();
  if (!label) return { error: "Label is required" };

  const supabase = await createClient();
  const restaurantId = await getRestaurantId(supabase);
  await createTag(restaurantId, label, supabase);
  revalidatePath("/admin/tags");
  return {};
}

export async function updateTagLabelAction(
  id: string,
  label: string
): Promise<{ error?: string }> {
  const trimmed = label.trim();
  if (!trimmed) return { error: "Label is required" };

  const supabase = await createClient();
  await getRestaurantId(supabase);
  await updateTagLabel(id, trimmed, supabase);
  revalidatePath("/admin/tags");
  return {};
}
