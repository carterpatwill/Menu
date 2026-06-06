import { describe, it, expect } from "vitest";
import { resolveTag } from "../nfc-resolver";
import type { Database } from "@/lib/supabase/types";

type DbRestaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type DbNfcTag = Database["public"]["Tables"]["nfc_tags"]["Row"];
type DbMenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

const TAG: DbNfcTag = {
  id: "tag-123",
  restaurant_id: "rest-1",
  label: "Table 4",
  created_at: "2024-01-01T00:00:00Z",
};

const RESTAURANT: DbRestaurant = {
  id: "rest-1",
  name: "The Test Kitchen",
  slug: "test-kitchen",
  owner_id: "user-1",
  theme: "warm",
  tagline: "",
  has_specials: true,
  has_appetizers: false,
  has_mains: true,
  has_sides: false,
  has_drinks: true,
  has_desserts: false,
};

const ITEMS: DbMenuItem[] = [
  {
    id: "item-1",
    restaurant_id: "rest-1",
    name: "Burger",
    description: "Classic",
    price: 15,
    category: "mains",
    image_url: null,
    is_featured: false,
    is_available: true,
    sort_order: 0,
  },
];

function makeMockSupabase(data: {
  tag: DbNfcTag | null;
  restaurant: DbRestaurant | null;
  items: DbMenuItem[];
}) {
  function makeChain(tableData: unknown): Record<string, unknown> {
    const chain: Record<string, unknown> = {
      then(resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) {
        return Promise.resolve({ data: tableData, error: null }).then(
          resolve,
          reject
        );
      },
      catch(reject: (e: unknown) => unknown) {
        return Promise.resolve({ data: tableData, error: null }).catch(reject);
      },
      single: () =>
        Promise.resolve({
          data: tableData,
          error: tableData ? null : { message: "not found" },
        }),
      eq: (_col: string, _val: unknown) => chain,
      select: (_cols?: string) => chain,
    };
    return chain;
  }

  return {
    from(table: string) {
      if (table === "nfc_tags") return makeChain(data.tag);
      if (table === "restaurants") return makeChain(data.restaurant);
      if (table === "menu_items") return makeChain(data.items);
      return makeChain(null);
    },
  };
}

describe("resolveTag", () => {
  it("returns restaurant, tag, and items for a known nfcId", async () => {
    const supabase = makeMockSupabase({
      tag: TAG,
      restaurant: RESTAURANT,
      items: ITEMS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await resolveTag("tag-123", supabase as any);

    expect(result).not.toBeNull();
    expect(result?.tag.id).toBe("tag-123");
    expect(result?.restaurant.id).toBe("rest-1");
    expect(result?.items).toHaveLength(1);
  });

  it("returns null for an unknown nfcId", async () => {
    const supabase = makeMockSupabase({
      tag: null,
      restaurant: RESTAURANT,
      items: ITEMS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await resolveTag("unknown-id", supabase as any);

    expect(result).toBeNull();
  });
});
