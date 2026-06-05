import { describe, it, expect, vi } from "vitest";
import { toggleCategory, getRestaurantById } from "../restaurant-service";

function makeChain(resolveValue: unknown) {
  const chain: Record<string, unknown> = {};
  const resolve = () => Promise.resolve(resolveValue);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
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

describe("toggleCategory", () => {
  it("sets the has_specials flag for the specials category", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await toggleCategory("rest-1", "specials", true, { from } as any);
    expect(from).toHaveBeenCalledWith("restaurants");
    expect(chain.update).toHaveBeenCalledWith({ has_specials: true });
    expect(chain.eq).toHaveBeenCalledWith("id", "rest-1");
  });

  it("sets the has_desserts flag to false for the desserts category", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await toggleCategory("rest-1", "desserts", false, { from } as any);
    expect(chain.update).toHaveBeenCalledWith({ has_desserts: false });
  });

  it("maps all 6 categories to the correct flag column", async () => {
    const mapping: Record<string, string> = {
      specials: "has_specials",
      appetizers: "has_appetizers",
      mains: "has_mains",
      sides: "has_sides",
      drinks: "has_drinks",
      desserts: "has_desserts",
    };
    for (const [cat, flag] of Object.entries(mapping)) {
      const { from, chain } = makeSupabase({ data: null, error: null });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await toggleCategory("rest-1", cat as any, true, { from } as any);
      expect(chain.update).toHaveBeenCalledWith({ [flag]: true });
    }
  });
});

describe("getRestaurantById", () => {
  it("returns the restaurant row when found", async () => {
    const row = {
      id: "rest-1",
      name: "Test",
      slug: "test",
      owner_id: "user-1",
      has_specials: true,
      has_appetizers: true,
      has_mains: true,
      has_sides: true,
      has_drinks: true,
      has_desserts: true,
    };
    const { from } = makeSupabase({ data: row, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRestaurantById("rest-1", { from } as any);
    expect(result).toEqual(row);
  });

  it("returns null when not found", async () => {
    const { from } = makeSupabase({ data: null, error: { message: "not found" } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getRestaurantById("rest-1", { from } as any);
    expect(result).toBeNull();
  });
});
