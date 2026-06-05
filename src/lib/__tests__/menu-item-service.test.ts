import { describe, it, expect, vi } from "vitest";
import {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  toggleAvailable,
} from "../menu-item-service";
import type { Database } from "../supabase/types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

const sampleItem: MenuItem = {
  id: "item-1",
  restaurant_id: "rest-1",
  name: "Burger",
  description: "A great burger",
  price: 12.99,
  category: "mains",
  image_url: null,
  is_featured: false,
  is_available: true,
  sort_order: 0,
};

function makeChain(resolveValue: unknown) {
  const chain: Record<string, unknown> = {};
  const resolve = () => Promise.resolve(resolveValue);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockImplementation(resolve);
  chain.then = (
    onfulfilled: (v: unknown) => unknown,
    onrejected: (e: unknown) => unknown
  ) => resolve().then(onfulfilled, onrejected);
  return chain;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSupabase(returnVal: unknown): { from: ReturnType<typeof vi.fn>; chain: any } {
  const chain = makeChain(returnVal);
  const from = vi.fn().mockReturnValue(chain);
  return { from, chain };
}

describe("listItems", () => {
  it("queries menu_items for the given restaurantId", async () => {
    const { from, chain } = makeSupabase({ data: [sampleItem], error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await listItems("rest-1", { from } as any);
    expect(from).toHaveBeenCalledWith("menu_items");
    expect(chain.select).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("restaurant_id", "rest-1");
  });

  it("returns items array on success", async () => {
    const { from } = makeSupabase({ data: [sampleItem], error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await listItems("rest-1", { from } as any);
    expect(result).toEqual([sampleItem]);
  });

  it("returns empty array on error", async () => {
    const { from } = makeSupabase({ data: null, error: { message: "fail" } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await listItems("rest-1", { from } as any);
    expect(result).toEqual([]);
  });
});

describe("createItem", () => {
  it("inserts a menu item and returns its id", async () => {
    const { from, chain } = makeSupabase({ data: { id: "new-id" }, error: null });
    const result = await createItem(
      {
        restaurant_id: "rest-1",
        name: "Pizza",
        description: "Cheesy",
        price: 9.99,
        category: "mains",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { from } as any
    );
    expect(from).toHaveBeenCalledWith("menu_items");
    expect(chain.insert).toHaveBeenCalled();
    expect(result).toEqual({ id: "new-id" });
  });
});

describe("updateItem", () => {
  it("updates the item by id", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateItem("item-1", { name: "Updated Burger" }, { from } as any);
    expect(from).toHaveBeenCalledWith("menu_items");
    expect(chain.update).toHaveBeenCalledWith({ name: "Updated Burger" });
    expect(chain.eq).toHaveBeenCalledWith("id", "item-1");
  });
});

describe("deleteItem", () => {
  it("deletes the item by id", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await deleteItem("item-1", { from } as any);
    expect(from).toHaveBeenCalledWith("menu_items");
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("id", "item-1");
  });
});

describe("toggleAvailable", () => {
  it("sets is_available to false when current is true", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await toggleAvailable("item-1", true, { from } as any);
    expect(chain.update).toHaveBeenCalledWith({ is_available: false });
  });

  it("sets is_available to true when current is false", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await toggleAvailable("item-1", false, { from } as any);
    expect(chain.update).toHaveBeenCalledWith({ is_available: true });
  });
});
