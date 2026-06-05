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
      <main style={{ padding: "2rem" }}>
        <p>No restaurant found for your account.</p>
      </main>
    );
  }

  const items = await listItems(restaurant.id, supabase);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{restaurant.name} — Menu Items</h1>
      <MenuManager restaurantId={restaurant.id} initialItems={items} initialRestaurant={restaurant} />
    </main>
  );
}
