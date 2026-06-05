import { describe, it, expect } from "vitest";
import { buildMenuSections } from "../menu-renderer";
import type { Database } from "@/lib/supabase/types";

type DbRestaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type DbMenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

const baseRestaurant: DbRestaurant = {
  id: "r1",
  name: "Test Restaurant",
  slug: "test",
  owner_id: "u1",
  has_specials: true,
  has_appetizers: true,
  has_mains: true,
  has_sides: false,
  has_drinks: false,
  has_desserts: false,
};

function makeItem(overrides: Partial<DbMenuItem> = {}): DbMenuItem {
  return {
    id: "item1",
    restaurant_id: "r1",
    name: "Test Item",
    description: "A test item",
    price: 10,
    category: "mains",
    image_url: null,
    is_featured: false,
    is_available: true,
    sort_order: 0,
    ...overrides,
  };
}

describe("buildMenuSections", () => {
  it("excludes unavailable items", () => {
    const items: DbMenuItem[] = [
      makeItem({ id: "a", is_available: true }),
      makeItem({ id: "b", is_available: false }),
    ];
    const result = buildMenuSections(baseRestaurant, items);
    const allItems = [
      ...result.featured,
      ...result.sections.flatMap((s) => s.items),
    ];
    expect(allItems.every((i) => i.isAvailable)).toBe(true);
    expect(allItems).toHaveLength(1);
  });

  it("puts featured available items in the featured array", () => {
    const items: DbMenuItem[] = [
      makeItem({ id: "a", is_featured: true, category: "mains" }),
      makeItem({ id: "b", is_featured: false, category: "mains" }),
    ];
    const result = buildMenuSections(baseRestaurant, items);
    expect(result.featured).toHaveLength(1);
    expect(result.featured[0].id).toBe("a");
  });

  it("groups non-featured items under their category section", () => {
    const items: DbMenuItem[] = [
      makeItem({ id: "a", category: "mains" }),
      makeItem({ id: "b", category: "appetizers" }),
      makeItem({ id: "c", category: "mains" }),
    ];
    const result = buildMenuSections(baseRestaurant, items);
    const mains = result.sections.find((s) => s.category === "mains");
    const apps = result.sections.find((s) => s.category === "appetizers");
    expect(mains?.items).toHaveLength(2);
    expect(apps?.items).toHaveLength(1);
  });

  it("omits sections for disabled categories", () => {
    const items: DbMenuItem[] = [
      makeItem({ id: "a", category: "mains" }),
      makeItem({ id: "b", category: "sides" }), // sides disabled
    ];
    const result = buildMenuSections(baseRestaurant, items);
    const categories = result.sections.map((s) => s.category);
    expect(categories).not.toContain("sides");
  });
});
