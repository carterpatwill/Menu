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
    <main className="wrap">
      <div className="page-head">
        <div>
          <Link href="/admin" className="back-link">← Overview</Link>
          <h1 className="greeting display">Settings</h1>
          <p className="subhead">Customise your menu appearance.</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 640 }}>
        <SettingsForm
          initialTheme={(restaurant.theme as Theme) ?? "warm"}
          initialTagline={restaurant.tagline ?? ""}
        />
      </div>
    </main>
  );
}
