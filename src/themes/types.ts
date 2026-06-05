export type Theme = "warm" | "minimal" | "bold";

export type Category = "specials" | "appetizers" | "mains" | "sides" | "drinks" | "desserts";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string | undefined;
  isFeatured: boolean;
  isAvailable: boolean;
}

export interface Restaurant {
  name: string;
  tagline: string;
  theme: Theme;
  enabledCategories: Category[];
  items: MenuItem[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  specials: "Specials",
  appetizers: "Appetizers",
  mains: "Mains",
  sides: "Sides",
  drinks: "Drinks",
  desserts: "Desserts",
};
