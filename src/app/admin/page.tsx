import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Utensils, Tag, BarChart2, Star } from "lucide-react";

const sections = [
  {
    href: "/admin/menu",
    icon: Utensils,
    title: "Menu",
    description: "Add, edit, and organise menu items and categories",
  },
  {
    href: "/admin/tags",
    icon: Tag,
    title: "Tags",
    description: "Manage NFC tags and assign them to menu locations",
  },
  {
    href: "/admin/analytics",
    icon: BarChart2,
    title: "Analytics",
    description: "View menu opens, item taps, and engagement trends",
  },
  {
    href: "/admin/reviews",
    icon: Star,
    title: "Reviews",
    description: "Read customer reviews and star ratings",
  },
];

export default async function AdminPage() {
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#faf9f7", padding: "2rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              Admin
            </h1>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: "0.25rem 0 0" }}>
              Tappi dashboard
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              style={{
                background: "none",
                border: "1.5px solid #e5e7eb",
                borderRadius: 9999,
                padding: "0.4rem 1rem",
                fontSize: "0.85rem",
                color: "#6b7280",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Sign out
            </button>
          </form>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {sections.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "block",
                background: "#ffffff",
                border: "1.5px solid #e5e7eb",
                borderRadius: 12,
                padding: "1.5rem",
                textDecoration: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.85rem",
                }}
              >
                <Icon size={20} strokeWidth={1.5} color="#374151" />
              </div>
              <div
                style={{ fontSize: "1.05rem", fontWeight: 600, color: "#111827", marginBottom: "0.35rem" }}
              >
                {title}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.5 }}>
                {description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
