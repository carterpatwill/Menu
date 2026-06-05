import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveTag } from "@/lib/nfc-resolver";
import { toThemeRestaurant } from "@/lib/menu-renderer";
import { MenuTheme } from "@/themes";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ nfcId: string }>;
}) {
  const { nfcId } = await params;
  const supabase = await createClient();

  const resolved = await resolveTag(nfcId, supabase);
  if (!resolved) notFound();

  const { restaurant, tag, items } = resolved;

  await supabase.from("click_events").insert({
    restaurant_id: restaurant.id,
    nfc_tag_id: tag.id,
    event_type: "menu_open",
  });

  const themeRestaurant = toThemeRestaurant(restaurant, items);

  return <MenuTheme restaurant={themeRestaurant} tagLabel={tag.label} />;
}
