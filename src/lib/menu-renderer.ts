import type { Database } from "@/lib/supabase/types";
import type { MenuItem, Category, Restaurant } from "@/themes/types";

type DbRestaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type DbMenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

export interface MenuSection {
  category: Category;
  items: MenuItem[];
}

export interface MenuData {
  featured: MenuItem[];
  sections: MenuSection[];
}

const CATEGORY_FLAGS: Record<
  Category,
  keyof Pick<
    DbRestaurant,
    | "has_specials"
    | "has_appetizers"
    | "has_mains"
    | "has_sides"
    | "has_drinks"
    | "has_desserts"
  >
> = {
  specials: "has_specials",
  appetizers: "has_appetizers",
  mains: "has_mains",
  sides: "has_sides",
  drinks: "has_drinks",
  desserts: "has_desserts",
};

function toMenuItem(row: DbMenuItem): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category as Category,
    imageUrl: row.image_url ?? "",
    isFeatured: row.is_featured,
    isAvailable: row.is_available,
  };
}

export function toThemeRestaurant(
  restaurant: DbRestaurant,
  items: DbMenuItem[]
): Restaurant {
  const enabledCategories = (Object.keys(CATEGORY_FLAGS) as Category[]).filter(
    (cat) => restaurant[CATEGORY_FLAGS[cat]]
  );
  return {
    name: restaurant.name,
    tagline: "",
    theme: "warm",
    enabledCategories,
    items: items.map(toMenuItem),
  };
}

export function buildMenuSections(
  restaurant: DbRestaurant,
  items: DbMenuItem[]
): MenuData {
  const enabledCategories = (Object.keys(CATEGORY_FLAGS) as Category[]).filter(
    (cat) => restaurant[CATEGORY_FLAGS[cat]]
  );

  const available = items.filter((i) => i.is_available);

  const featured = available
    .filter((i) => i.is_featured)
    .map(toMenuItem);

  const sections: MenuSection[] = enabledCategories
    .map((cat) => ({
      category: cat,
      items: available
        .filter((i) => !i.is_featured && i.category === cat)
        .map(toMenuItem),
    }))
    .filter((s) => s.items.length > 0);

  return { featured, sections };
}
