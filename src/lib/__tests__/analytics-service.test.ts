import { describe, it, expect, vi } from "vitest";
import {
  getDailyMenuOpens,
  getItemTapCounts,
  getHourlyBreakdown,
} from "../analytics-service";

function makeChain(resolveValue: unknown) {
  const chain: Record<string, unknown> = {};
  const resolve = () => Promise.resolve(resolveValue);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.then = (
    onfulfilled: (v: unknown) => unknown,
    onrejected: (e: unknown) => unknown
  ) => resolve().then(onfulfilled, onrejected);
  return chain;
}

function makeSupabase(returnVal: unknown) {
  const chain = makeChain(returnVal);
  const from = vi.fn().mockReturnValue(chain);
  return { from, chain };
}

describe("getDailyMenuOpens", () => {
  const now = new Date("2026-06-10T12:00:00Z");

  it("queries click_events scoped to restaurant + menu_open event with gte created_at", async () => {
    const { from, chain } = makeSupabase({ data: [], error: null });
    await getDailyMenuOpens(
      "rest-1",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { from } as any,
      30,
      now
    );
    expect(from).toHaveBeenCalledWith("click_events");
    expect(chain.select).toHaveBeenCalledWith(expect.stringContaining("created_at"));
    expect(chain.eq).toHaveBeenCalledWith("restaurant_id", "rest-1");
    expect(chain.eq).toHaveBeenCalledWith("event_type", "menu_open");
    expect(chain.gte).toHaveBeenCalled();
  });

  it("returns one entry per day for the requested window, including zero days", async () => {
    const { from } = makeSupabase({ data: [], error: null });
    const result = await getDailyMenuOpens(
      "rest-1",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { from } as any,
      30,
      now
    );
    expect(result).toHaveLength(30);
    expect(result.every((d) => d.count === 0)).toBe(true);
    // ascending order, ending on today
    expect(result[result.length - 1].date).toBe("2026-06-10");
    expect(result[0].date).toBe("2026-05-12");
  });

  it("buckets events into the correct calendar day", async () => {
    const { from } = makeSupabase({
      data: [
        { created_at: "2026-06-10T08:00:00Z" },
        { created_at: "2026-06-10T18:30:00Z" },
        { created_at: "2026-06-09T23:59:00Z" },
      ],
      error: null,
    });
    const result = await getDailyMenuOpens(
      "rest-1",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { from } as any,
      30,
      now
    );
    const byDate = Object.fromEntries(result.map((d) => [d.date, d.count]));
    expect(byDate["2026-06-10"]).toBe(2);
    expect(byDate["2026-06-09"]).toBe(1);
    expect(byDate["2026-06-08"]).toBe(0);
  });

  it("returns the zero-filled window on error", async () => {
    const { from } = makeSupabase({ data: null, error: { message: "rls" } });
    const result = await getDailyMenuOpens(
      "rest-1",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { from } as any,
      30,
      now
    );
    expect(result).toHaveLength(30);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });
});

describe("getItemTapCounts", () => {
  it("queries click_events scoped to restaurant + item_tap, joining menu_items name", async () => {
    const { from, chain } = makeSupabase({ data: [], error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await getItemTapCounts("rest-1", { from } as any);
    expect(from).toHaveBeenCalledWith("click_events");
    expect(chain.select).toHaveBeenCalledWith(expect.stringContaining("menu_items"));
    expect(chain.eq).toHaveBeenCalledWith("restaurant_id", "rest-1");
    expect(chain.eq).toHaveBeenCalledWith("event_type", "item_tap");
  });

  it("aggregates tap counts per item and ranks descending", async () => {
    const { from } = makeSupabase({
      data: [
        { menu_item_id: "i1", menu_items: { name: "Pasta" } },
        { menu_item_id: "i2", menu_items: { name: "Pizza" } },
        { menu_item_id: "i1", menu_items: { name: "Pasta" } },
        { menu_item_id: "i1", menu_items: { name: "Pasta" } },
        { menu_item_id: "i2", menu_items: { name: "Pizza" } },
      ],
      error: null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getItemTapCounts("rest-1", { from } as any);
    expect(result).toEqual([
      { menuItemId: "i1", name: "Pasta", count: 3 },
      { menuItemId: "i2", name: "Pizza", count: 2 },
    ]);
  });

  it("skips rows missing the joined item (deleted or RLS-hidden)", async () => {
    const { from } = makeSupabase({
      data: [
        { menu_item_id: "i1", menu_items: { name: "Pasta" } },
        { menu_item_id: null, menu_items: null },
        { menu_item_id: "i2", menu_items: null },
      ],
      error: null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getItemTapCounts("rest-1", { from } as any);
    expect(result).toEqual([{ menuItemId: "i1", name: "Pasta", count: 1 }]);
  });

  it("returns [] on error", async () => {
    const { from } = makeSupabase({ data: null, error: { message: "rls" } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getItemTapCounts("rest-1", { from } as any);
    expect(result).toEqual([]);
  });
});

describe("getHourlyBreakdown", () => {
  it("queries click_events scoped to restaurant", async () => {
    const { from, chain } = makeSupabase({ data: [], error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await getHourlyBreakdown("rest-1", { from } as any);
    expect(from).toHaveBeenCalledWith("click_events");
    expect(chain.eq).toHaveBeenCalledWith("restaurant_id", "rest-1");
  });

  it("returns 12 two-hour buckets covering 00-02 through 22-24, zero-filled when empty", async () => {
    const { from } = makeSupabase({ data: [], error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getHourlyBreakdown("rest-1", { from } as any);
    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ bucket: "00-02", opens: 0, taps: 0 });
    expect(result[11]).toEqual({ bucket: "22-24", opens: 0, taps: 0 });
  });

  it("groups menu_open and item_tap events into their bucket separately", async () => {
    const { from } = makeSupabase({
      data: [
        { created_at: "2026-06-10T00:30:00Z", event_type: "menu_open" },
        { created_at: "2026-06-10T01:45:00Z", event_type: "menu_open" },
        { created_at: "2026-06-10T01:46:00Z", event_type: "item_tap" },
        { created_at: "2026-06-10T13:00:00Z", event_type: "menu_open" },
        { created_at: "2026-06-10T14:00:00Z", event_type: "item_tap" },
        { created_at: "2026-06-10T23:59:00Z", event_type: "item_tap" },
      ],
      error: null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getHourlyBreakdown("rest-1", { from } as any);
    const byBucket = Object.fromEntries(result.map((b) => [b.bucket, b]));
    expect(byBucket["00-02"]).toEqual({ bucket: "00-02", opens: 2, taps: 1 });
    expect(byBucket["12-14"]).toEqual({ bucket: "12-14", opens: 1, taps: 0 });
    expect(byBucket["14-16"]).toEqual({ bucket: "14-16", opens: 0, taps: 1 });
    expect(byBucket["22-24"]).toEqual({ bucket: "22-24", opens: 0, taps: 1 });
  });

  it("returns zero-filled buckets on error", async () => {
    const { from } = makeSupabase({ data: null, error: { message: "rls" } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getHourlyBreakdown("rest-1", { from } as any);
    expect(result).toHaveLength(12);
    expect(result.every((b) => b.opens === 0 && b.taps === 0)).toBe(true);
  });
});
