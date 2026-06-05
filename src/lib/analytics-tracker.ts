export interface TrackPayload {
  restaurantId: string;
  nfcTagId: string;
  menuItemId: string;
}

export interface SupabaseInsertClient {
  from(table: string): { insert(row: object): PromiseLike<unknown> };
}

export function createAnalyticsTracker(
  supabase: SupabaseInsertClient,
  debounceMs = 2000
) {
  const lastFired = new Map<string, number>();

  return {
    async trackItemTap(payload: TrackPayload): Promise<void> {
      const now = Date.now();
      const last = lastFired.get(payload.menuItemId);
      if (last !== undefined && now - last < debounceMs) return;

      lastFired.set(payload.menuItemId, now);
      await supabase.from("click_events").insert({
        restaurant_id: payload.restaurantId,
        nfc_tag_id: payload.nfcTagId,
        menu_item_id: payload.menuItemId,
        event_type: "item_tap",
      });
    },
  };
}
