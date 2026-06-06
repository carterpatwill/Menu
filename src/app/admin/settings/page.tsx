import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";
import type { Theme } from "@/themes/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("theme, tagline")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) redirect("/admin");

  return (
    <main style={{ minHeight: "100vh", background: "#faf9f7", padding: "2rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/admin"
            style={{ fontSize: "0.875rem", color: "#9ca3af", textDecoration: "none" }}
          >
            ← Admin
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: "0.5rem 0 0.25rem" }}>
            Settings
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: 0 }}>
            Customise your menu appearance
          </p>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "1.5rem" }}>
          <SettingsForm
            initialTheme={(restaurant.theme as Theme) ?? "warm"}
            initialTagline={restaurant.tagline ?? ""}
          />
        </div>
      </div>
    </main>
  );
}
