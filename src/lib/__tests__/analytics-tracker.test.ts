import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAnalyticsTracker } from "../analytics-tracker";

function makeSupabase() {
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn().mockReturnValue({ insert });
  return { supabase: { from }, insert };
}

describe("analytics tracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("inserts correct payload on item tap", async () => {
    const { supabase, insert } = makeSupabase();
    const tracker = createAnalyticsTracker(supabase);

    await tracker.trackItemTap({
      restaurantId: "r1",
      nfcTagId: "tag1",
      menuItemId: "item1",
    });

    expect(insert).toHaveBeenCalledOnce();
    expect(insert).toHaveBeenCalledWith({
      restaurant_id: "r1",
      nfc_tag_id: "tag1",
      menu_item_id: "item1",
      event_type: "item_tap",
    });
  });

  it("does not insert a duplicate when the same item is tapped within the debounce window", async () => {
    const { supabase, insert } = makeSupabase();
    const tracker = createAnalyticsTracker(supabase, 2000);

    await tracker.trackItemTap({ restaurantId: "r1", nfcTagId: "tag1", menuItemId: "item1" });
    vi.advanceTimersByTime(1000);
    await tracker.trackItemTap({ restaurantId: "r1", nfcTagId: "tag1", menuItemId: "item1" });

    expect(insert).toHaveBeenCalledOnce();
  });

  it("fires again after the debounce window expires", async () => {
    const { supabase, insert } = makeSupabase();
    const tracker = createAnalyticsTracker(supabase, 2000);

    await tracker.trackItemTap({ restaurantId: "r1", nfcTagId: "tag1", menuItemId: "item1" });
    vi.advanceTimersByTime(2001);
    await tracker.trackItemTap({ restaurantId: "r1", nfcTagId: "tag1", menuItemId: "item1" });

    expect(insert).toHaveBeenCalledTimes(2);
  });

  it("debounces per item — tapping different items both fire", async () => {
    const { supabase, insert } = makeSupabase();
    const tracker = createAnalyticsTracker(supabase, 2000);

    await tracker.trackItemTap({ restaurantId: "r1", nfcTagId: "tag1", menuItemId: "item1" });
    await tracker.trackItemTap({ restaurantId: "r1", nfcTagId: "tag1", menuItemId: "item2" });

    expect(insert).toHaveBeenCalledTimes(2);
  });
});
