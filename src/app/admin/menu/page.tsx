import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listItems } from "@/lib/menu-item-service";
import { MenuManager } from "./MenuManager";

export default async function AdminMenuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#fff9f3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            color: "#9ca3af",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "1.125rem",
            fontStyle: "italic",
          }}
        >
          No restaurant found for your account.
        </p>
      </main>
    );
  }

  const items = await listItems(restaurant.id, supabase);

  const { data: firstTag } = await supabase
    .from("nfc_tags")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .limit(1)
    .single();

  return (
    <main>
      <MenuManager
        restaurantId={restaurant.id}
        initialItems={items}
        initialRestaurant={restaurant}
        previewTagId={firstTag?.id ?? null}
      />
    </main>
  );
}
