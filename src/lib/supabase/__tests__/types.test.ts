import { describe, it, expectTypeOf } from "vitest";
import type { Database } from "@/lib/supabase/types";

type Tables = Database["public"]["Tables"];
type Enums = Database["public"]["Enums"];

describe("Database type", () => {
  it("has a restaurants table", () => {
    expectTypeOf<Tables>().toHaveProperty("restaurants");
  });

  it("has all 5 tables", () => {
    expectTypeOf<Tables>().toHaveProperty("restaurants");
    expectTypeOf<Tables>().toHaveProperty("menu_items");
    expectTypeOf<Tables>().toHaveProperty("nfc_tags");
    expectTypeOf<Tables>().toHaveProperty("click_events");
    expectTypeOf<Tables>().toHaveProperty("reviews");
  });

  it("has category enum with all 6 values", () => {
    type CategoryEnum = Enums["category"];
    // Each valid value must be assignable to the enum type
    const _s: CategoryEnum = "specials";
    const _a: CategoryEnum = "appetizers";
    const _m: CategoryEnum = "mains";
    const _si: CategoryEnum = "sides";
    const _d: CategoryEnum = "drinks";
    const _de: CategoryEnum = "desserts";
    void _s; void _a; void _m; void _si; void _d; void _de;
    expectTypeOf<CategoryEnum>().toEqualTypeOf<
      "specials" | "appetizers" | "mains" | "sides" | "drinks" | "desserts"
    >();
  });

  it("has event_type enum with menu_open and item_tap", () => {
    type EventTypeEnum = Enums["event_type"];
    expectTypeOf<EventTypeEnum>().toEqualTypeOf<"menu_open" | "item_tap">();
  });

  it("restaurants row has owner_id and category toggle booleans", () => {
    type RestaurantRow = Tables["restaurants"]["Row"];
    expectTypeOf<RestaurantRow>().toHaveProperty("id");
    expectTypeOf<RestaurantRow>().toHaveProperty("owner_id");
    expectTypeOf<RestaurantRow>().toHaveProperty("has_specials");
    expectTypeOf<RestaurantRow>().toHaveProperty("has_appetizers");
    expectTypeOf<RestaurantRow>().toHaveProperty("has_mains");
    expectTypeOf<RestaurantRow>().toHaveProperty("has_sides");
    expectTypeOf<RestaurantRow>().toHaveProperty("has_drinks");
    expectTypeOf<RestaurantRow>().toHaveProperty("has_desserts");
  });

  it("menu_items row has all product fields", () => {
    type MenuItemRow = Tables["menu_items"]["Row"];
    expectTypeOf<MenuItemRow>().toHaveProperty("id");
    expectTypeOf<MenuItemRow>().toHaveProperty("restaurant_id");
    expectTypeOf<MenuItemRow>().toHaveProperty("name");
    expectTypeOf<MenuItemRow>().toHaveProperty("description");
    expectTypeOf<MenuItemRow>().toHaveProperty("price");
    expectTypeOf<MenuItemRow>().toHaveProperty("category");
    expectTypeOf<MenuItemRow>().toHaveProperty("image_url");
    expectTypeOf<MenuItemRow>().toHaveProperty("is_featured");
    expectTypeOf<MenuItemRow>().toHaveProperty("is_available");
    expectTypeOf<MenuItemRow>().toHaveProperty("sort_order");
  });

  it("click_events row has nullable menu_item_id", () => {
    type ClickEventRow = Tables["click_events"]["Row"];
    expectTypeOf<ClickEventRow["menu_item_id"]>().toEqualTypeOf<string | null>();
  });

  it("reviews row has rating as number", () => {
    type ReviewRow = Tables["reviews"]["Row"];
    expectTypeOf<ReviewRow["rating"]>().toEqualTypeOf<number>();
  });
});
