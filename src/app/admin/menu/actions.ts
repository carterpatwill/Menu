"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  toggleAvailable,
  toggleFeatured,
} from "@/lib/menu-item-service";
import { toggleCategory } from "@/lib/restaurant-service";
import { validateAndUpload } from "@/lib/image-upload";
import type { Database } from "@/lib/supabase/types";

type Category = Database["public"]["Enums"]["category"];

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

export async function toggleAvailableAction(id: string, current: boolean) {
  const supabase = await createClient();
  await getRestaurantId(supabase);
  await toggleAvailable(id, current, supabase);
  revalidatePath("/admin/menu");
}

export async function toggleFeaturedAction(id: string, current: boolean) {
  const supabase = await createClient();
  await getRestaurantId(supabase);
  await toggleFeatured(id, current, supabase);
  revalidatePath("/admin/menu");
}

export async function toggleCategoryAction(category: Category, enabled: boolean) {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId(supabase);
  await toggleCategory(restaurantId, category, enabled, supabase);
  revalidatePath("/admin/menu");
}

export async function deleteItemAction(id: string) {
  const supabase = await createClient();
  await getRestaurantId(supabase);
  await deleteItem(id, supabase);
  revalidatePath("/admin/menu");
}

export async function saveItemAction(
  itemId: string | null,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId(supabase);

  const name = (formData.get("name") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const priceRaw = formData.get("price") as string | null;
  const category = formData.get("category") as Category | null;
  const photoFile = formData.get("photo") as File | null;
  const isAvailable = formData.get("is_available") === "on";

  if (!name) return { error: "Name is required" };
  if (!category) return { error: "Category is required" };
  const price = parseFloat(priceRaw ?? "");
  if (isNaN(price) || price < 0) return { error: "Price must be a non-negative number" };

  let imageUrl: string | null = null;
  if (photoFile && photoFile.size > 0) {
    const uploadResult = await validateAndUpload(photoFile, supabase);
    if ("error" in uploadResult) return { error: uploadResult.error };
    imageUrl = uploadResult.url;
  }

  if (itemId) {
    const updates: Record<string, unknown> = { name, description, price, category, is_available: isAvailable };
    if (imageUrl !== null) updates.image_url = imageUrl;
    await updateItem(itemId, updates, supabase);
  } else {
    await createItem(
      {
        restaurant_id: restaurantId,
        name,
        description,
        price,
        category,
        is_available: isAvailable,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      },
      supabase
    );
  }

  revalidatePath("/admin/menu");
  return {};
}

export { listItems };
