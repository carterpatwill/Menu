import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

type Supabase = SupabaseClient<Database>;

export interface DailyOpens {
  date: string;
  count: number;
}

export interface ItemTapCount {
  menuItemId: string;
  name: string;
  count: number;
}

export interface HourBucket {
  bucket: string;
  opens: number;
  taps: number;
}

const BUCKET_HOURS = 2;
const BUCKET_COUNT = 24 / BUCKET_HOURS;

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function bucketLabel(idx: number): string {
  const start = idx * BUCKET_HOURS;
  const end = start + BUCKET_HOURS;
  return `${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")}`;
}

export async function getDailyMenuOpens(
  restaurantId: string,
  supabase: Supabase,
  days = 30,
  now: Date = new Date()
): Promise<DailyOpens[]> {
  const since = new Date(now);
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const { data, error } = await supabase
    .from("click_events")
    .select("created_at")
    .eq("restaurant_id", restaurantId)
    .eq("event_type", "menu_open")
    .gte("created_at", since.toISOString());

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    counts.set(formatDate(d), 0);
  }

  if (!error && data) {
    for (const row of data as Array<{ created_at: string }>) {
      const key = formatDate(new Date(row.created_at));
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

export async function getItemTapCounts(
  restaurantId: string,
  supabase: Supabase
): Promise<ItemTapCount[]> {
  const { data, error } = await supabase
    .from("click_events")
    .select("menu_item_id, menu_items(name)")
    .eq("restaurant_id", restaurantId)
    .eq("event_type", "item_tap");

  if (error || !data) return [];

  const rows = data as unknown as Array<{
    menu_item_id: string | null;
    menu_items: { name: string } | null;
  }>;

  const counts = new Map<string, { name: string; count: number }>();
  for (const row of rows) {
    if (!row.menu_item_id || !row.menu_items) continue;
    const existing = counts.get(row.menu_item_id);
    if (existing) existing.count += 1;
    else counts.set(row.menu_item_id, { name: row.menu_items.name, count: 1 });
  }

  return Array.from(counts.entries())
    .map(([menuItemId, { name, count }]) => ({ menuItemId, name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getHourlyBreakdown(
  restaurantId: string,
  supabase: Supabase
): Promise<HourBucket[]> {
  const { data, error } = await supabase
    .from("click_events")
    .select("created_at, event_type")
    .eq("restaurant_id", restaurantId);

  const buckets: HourBucket[] = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
    bucket: bucketLabel(i),
    opens: 0,
    taps: 0,
  }));

  if (!error && data) {
    for (const row of data as Array<{ created_at: string; event_type: string }>) {
      const hour = new Date(row.created_at).getUTCHours();
      const idx = Math.floor(hour / BUCKET_HOURS);
      if (row.event_type === "menu_open") buckets[idx].opens += 1;
      else if (row.event_type === "item_tap") buckets[idx].taps += 1;
    }
  }

  return buckets;
}
