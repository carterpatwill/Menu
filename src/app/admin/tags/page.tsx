import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listTags } from "@/lib/nfc-tag-service";
import { TagsManager } from "./TagsManager";

export default async function AdminTagsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return (
      <main style={{ padding: "2rem" }}>
        <p>No restaurant found for your account.</p>
      </main>
    );
  }

  const tags = await listTags(restaurant.id, supabase);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{restaurant.name} — NFC Tags</h1>
      <p style={{ color: "#555" }}>
        Each tag below is permanently linked to your restaurant. Program the URL
        shown onto the physical NFC tag.
      </p>
      <TagsManager initialTags={tags} />
    </main>
  );
}
