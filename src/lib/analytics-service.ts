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

export type Range = "7d" | "30d" | "90d";

export interface DailyPoint {
  date: string;
  opens: number;
  taps: number;
}

export interface HeatmapCell {
  dayOfWeek: number;
  bucket: number;
  count: number;
}

export interface RatingBucket {
  stars: number;
  count: number;
}

export interface RecentReview {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  tagLabel: string | null;
}

export interface TopItem {
  menuItemId: string;
  name: string;
  count: number;
}

export interface AnalyticsData {
  range: Range;
  opens: number;
  taps: number;
  conversion: number;
  prevOpens: number;
  prevTaps: number;
  prevConversion: number;
  reviewCount: number;
  prevReviewCount: number;
  avgRating: number;
  prevAvgRating: number;
  ratingDistribution: RatingBucket[];
  recentReviews: RecentReview[];
  daily: DailyPoint[];
  heatmap: HeatmapCell[];
  topItems: TopItem[];
}

function rangeDays(range: Range): number {
  if (range === "7d") return 7;
  if (range === "90d") return 90;
  return 30;
}

export async function getAnalytics(
  restaurantId: string,
  supabase: Supabase,
  range: Range,
  now: Date = new Date()
): Promise<AnalyticsData> {
  const days = rangeDays(range);
  const endExclusive = new Date(now);
  endExclusive.setUTCHours(0, 0, 0, 0);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  const currentStart = new Date(endExclusive);
  currentStart.setUTCDate(currentStart.getUTCDate() - days);
  const prevStart = new Date(currentStart);
  prevStart.setUTCDate(prevStart.getUTCDate() - days);

  const eventsRes = await supabase
    .from("click_events")
    .select("event_type, created_at, menu_item_id, menu_items(name)")
    .eq("restaurant_id", restaurantId)
    .gte("created_at", prevStart.toISOString())
    .lt("created_at", endExclusive.toISOString());

  const reviewsRes = await supabase
    .from("reviews")
    .select("id, rating, body, created_at, nfc_tag_id, nfc_tags(label)")
    .eq("restaurant_id", restaurantId)
    .gte("created_at", prevStart.toISOString())
    .lt("created_at", endExclusive.toISOString())
    .order("created_at", { ascending: false });

  const eventRows = (eventsRes.data ?? []) as unknown as Array<{
    event_type: string;
    created_at: string;
    menu_item_id: string | null;
    menu_items: { name: string } | null;
  }>;

  const reviewRows = (reviewsRes.data ?? []) as unknown as Array<{
    id: string;
    rating: number;
    body: string;
    created_at: string;
    nfc_tags: { label: string } | null;
  }>;

  let opens = 0;
  let taps = 0;
  let prevOpens = 0;
  let prevTaps = 0;
  const itemCounts = new Map<string, { name: string; count: number }>();

  const dailyMap = new Map<string, { opens: number; taps: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(currentStart);
    d.setUTCDate(d.getUTCDate() + i);
    dailyMap.set(formatDate(d), { opens: 0, taps: 0 });
  }

  const heatmap: HeatmapCell[] = [];
  for (let dow = 0; dow < 7; dow++) {
    for (let b = 0; b < BUCKET_COUNT; b++) {
      heatmap.push({ dayOfWeek: dow, bucket: b, count: 0 });
    }
  }
  const heatmapIndex = (dow: number, b: number) => dow * BUCKET_COUNT + b;

  for (const row of eventRows) {
    const ts = new Date(row.created_at);
    const inCurrent = ts >= currentStart && ts < endExclusive;
    if (inCurrent) {
      if (row.event_type === "menu_open") opens += 1;
      else if (row.event_type === "item_tap") {
        taps += 1;
        if (row.menu_item_id && row.menu_items) {
          const existing = itemCounts.get(row.menu_item_id);
          if (existing) existing.count += 1;
          else itemCounts.set(row.menu_item_id, { name: row.menu_items.name, count: 1 });
        }
      }
      const dp = dailyMap.get(formatDate(ts));
      if (dp) {
        if (row.event_type === "menu_open") dp.opens += 1;
        else if (row.event_type === "item_tap") dp.taps += 1;
      }
      const dow = ts.getUTCDay();
      const bucket = Math.floor(ts.getUTCHours() / BUCKET_HOURS);
      heatmap[heatmapIndex(dow, bucket)].count += 1;
    } else {
      if (row.event_type === "menu_open") prevOpens += 1;
      else if (row.event_type === "item_tap") prevTaps += 1;
    }
  }

  const currentReviews = reviewRows.filter((r) => {
    const ts = new Date(r.created_at);
    return ts >= currentStart && ts < endExclusive;
  });
  const prevReviews = reviewRows.filter((r) => {
    const ts = new Date(r.created_at);
    return ts >= prevStart && ts < currentStart;
  });

  const reviewCount = currentReviews.length;
  const prevReviewCount = prevReviews.length;
  const avgRating =
    reviewCount === 0 ? 0 : currentReviews.reduce((s, r) => s + r.rating, 0) / reviewCount;
  const prevAvgRating =
    prevReviews.length === 0
      ? 0
      : prevReviews.reduce((s, r) => s + r.rating, 0) / prevReviews.length;

  const ratingDistribution: RatingBucket[] = [1, 2, 3, 4, 5].map((stars) => ({
    stars,
    count: currentReviews.filter((r) => r.rating === stars).length,
  }));

  const recentReviews: RecentReview[] = currentReviews.slice(0, 3).map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body,
    createdAt: r.created_at,
    tagLabel: r.nfc_tags?.label ?? null,
  }));

  const daily: DailyPoint[] = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    opens: v.opens,
    taps: v.taps,
  }));

  const topItems: TopItem[] = Array.from(itemCounts.entries())
    .map(([menuItemId, { name, count }]) => ({ menuItemId, name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    range,
    opens,
    taps,
    conversion: opens === 0 ? 0 : taps / opens,
    prevOpens,
    prevTaps,
    prevConversion: prevOpens === 0 ? 0 : prevTaps / prevOpens,
    reviewCount,
    prevReviewCount,
    avgRating,
    prevAvgRating,
    ratingDistribution,
    recentReviews,
    daily,
    heatmap,
    topItems,
  };
}
