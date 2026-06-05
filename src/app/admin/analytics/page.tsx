import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MousePointerClick,
  Zap,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getAnalytics,
  type Range,
  type AnalyticsData,
  type DailyPoint,
  type HeatmapCell,
  type RatingBucket,
  type RecentReview,
  type TopItem,
} from "@/lib/analytics-service";
import { TrendChart } from "./TrendChart";

const RANGES: { value: Range; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

const OPENS_COLOR = "#3a7bd5";
const TAPS_COLOR = "#e8a52b";
const CONVERSION_COLOR = "#7c3aed";
const RATING_COLOR = "#f59e0b";

function parseRange(v: string | undefined): Range {
  if (v === "7d" || v === "30d" || v === "90d") return v;
  return "30d";
}

function formatInt(n: number): string {
  return n.toLocaleString();
}

function formatPercent(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

function formatRating(r: number): string {
  return r === 0 ? "—" : r.toFixed(1);
}

function relativeTime(iso: string, now = new Date()): string {
  const then = new Date(iso);
  const ms = now.getTime() - then.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function DeltaChip({
  current,
  previous,
  kind,
}: {
  current: number;
  previous: number;
  kind: "count" | "rate" | "rating";
}) {
  if (previous === 0 && current === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-400">
        no data
      </span>
    );
  }

  let label: string;
  let positive: boolean;

  if (kind === "count" || kind === "rate") {
    if (previous === 0) {
      label = "new";
      positive = current > 0;
    } else {
      const pct = ((current - previous) / previous) * 100;
      positive = pct >= 0;
      label = `${positive ? "+" : ""}${pct.toFixed(0)}%`;
    }
  } else {
    const diff = current - previous;
    positive = diff >= 0;
    label = `${positive ? "+" : ""}${diff.toFixed(1)}`;
  }

  const bg = positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${bg}`}>
      <Icon size={11} strokeWidth={2.5} />
      {label}
    </span>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 100;
  const H = 28;
  const max = Math.max(1, ...values);
  if (values.length < 2 || max === 0) {
    return <div style={{ width: W, height: H }} />;
  }
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * W},${H - (v / max) * (H - 2) - 1}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} preserveAspectRatio="none" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KpiTile({
  label,
  value,
  previous,
  formatted,
  sparkline,
  color,
  icon,
  kind,
  footer,
}: {
  label: string;
  value: number;
  previous: number;
  formatted: string;
  sparkline: number[];
  color: string;
  icon: React.ReactNode;
  kind: "count" | "rate" | "rating";
  footer?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: `${color}14`, color }}
          >
            {icon}
          </span>
          {label}
        </div>
        <DeltaChip current={value} previous={previous} kind={kind} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-3xl font-semibold tabular-nums text-gray-900">{formatted}</div>
          {footer && <div className="mt-0.5 text-xs text-gray-400">{footer}</div>}
        </div>
        <Sparkline values={sparkline} color={color} />
      </div>
    </div>
  );
}

function RangeTabs({ current }: { current: Range }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
      {RANGES.map((r) => {
        const active = r.value === current;
        return (
          <Link
            key={r.value}
            href={`/admin/analytics?range=${r.value}`}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              active ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-gray-500">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function TopItemsList({ items }: { items: TopItem[] }) {
  if (items.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No item taps in this range.</div>;
  }
  const max = Math.max(...items.map((i) => i.count));
  return (
    <ol className="space-y-2.5">
      {items.map((item, idx) => {
        const pct = (item.count / max) * 100;
        return (
          <li key={item.menuItemId}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-4 shrink-0 text-xs font-medium tabular-nums text-gray-400">
                  {idx + 1}
                </span>
                <span className="truncate text-gray-900">{item.name}</span>
              </span>
              <span className="ml-3 shrink-0 tabular-nums text-gray-500">{item.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: TAPS_COLOR }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon-first

function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const max = Math.max(1, ...cells.map((c) => c.count));
  const total = cells.reduce((s, c) => s + c.count, 0);
  if (total === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No activity in this range.</div>;
  }
  const get = (dow: number, b: number) =>
    cells.find((c) => c.dayOfWeek === dow && c.bucket === b)?.count ?? 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-[3px]">
        <thead>
          <tr>
            <th className="w-5"></th>
            {Array.from({ length: 12 }, (_, b) =>
              b % 2 === 0 ? (
                <th
                  key={b}
                  colSpan={2}
                  className="text-[10px] font-normal text-gray-400"
                >
                  {String(b * 2).padStart(2, "0")}
                </th>
              ) : null
            )}
          </tr>
        </thead>
        <tbody>
          {DOW_ORDER.map((dow, rowIdx) => (
            <tr key={dow}>
              <td className="pr-1 text-right text-[10px] font-medium text-gray-400">
                {DOW_LABELS[dow]}
              </td>
              {Array.from({ length: 12 }, (_, b) => {
                const count = get(dow, b);
                const intensity = count === 0 ? 0 : 0.15 + 0.85 * (count / max);
                const bg =
                  count === 0
                    ? "#f3f4f6"
                    : `rgba(232, 165, 43, ${intensity.toFixed(2)})`;
                const hourStart = String(b * 2).padStart(2, "0");
                const hourEnd = String(b * 2 + 2).padStart(2, "0");
                return (
                  <td
                    key={b}
                    className="h-7 w-full min-w-[18px] rounded"
                    style={{ background: bg }}
                    title={`${DOW_LABELS[dow]} ${hourStart}:00–${hourEnd}:00 · ${count}`}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-gray-400">
        Less
        {[0.15, 0.4, 0.65, 0.9].map((a) => (
          <span
            key={a}
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: `rgba(232, 165, 43, ${a})` }}
          />
        ))}
        More
      </div>
    </div>
  );
}

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          strokeWidth={1.5}
          fill={s <= rounded ? RATING_COLOR : "transparent"}
          color={s <= rounded ? RATING_COLOR : "#d1d5db"}
        />
      ))}
    </span>
  );
}

function RatingDistribution({
  buckets,
  total,
  avg,
}: {
  buckets: RatingBucket[];
  total: number;
  avg: number;
}) {
  if (total === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No reviews in this range.</div>;
  }
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3">
        <div className="text-3xl font-semibold tabular-nums text-gray-900">{avg.toFixed(1)}</div>
        <Stars rating={avg} size={16} />
        <div className="text-xs text-gray-500">{total} {total === 1 ? "review" : "reviews"}</div>
      </div>
      <div className="space-y-1.5">
        {[...buckets].reverse().map((b) => {
          const pct = (b.count / max) * 100;
          return (
            <div key={b.stars} className="flex items-center gap-2 text-xs">
              <span className="flex w-6 items-center gap-0.5 tabular-nums text-gray-500">
                {b.stars}
                <Star size={10} fill={RATING_COLOR} color={RATING_COLOR} strokeWidth={0} />
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: RATING_COLOR }}
                />
              </div>
              <span className="w-6 text-right tabular-nums text-gray-500">{b.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentReviewsList({ reviews }: { reviews: RecentReview[] }) {
  if (reviews.length === 0) {
    return (
      <div>
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
          Recent
        </div>
        <div className="py-8 text-center text-sm text-gray-400">No recent reviews.</div>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        Recent
      </div>
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <Stars rating={r.rating} />
              <span className="text-[11px] text-gray-400">
                {r.tagLabel ? `${r.tagLabel} · ` : ""}{relativeTime(r.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">{r.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp.range);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-[#faf9f7] p-8">
        <p className="text-gray-600">No restaurant found for your account.</p>
      </main>
    );
  }

  const data: AnalyticsData = await getAnalytics(restaurant.id, supabase, range);
  const conversionSpark = data.daily.map((d: DailyPoint) =>
    d.opens === 0 ? 0 : d.taps / d.opens
  );

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={12} /> Back to admin
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{restaurant.name}</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Analytics overview · last {range === "7d" ? "7" : range === "30d" ? "30" : "90"} days
            </p>
          </div>
          <RangeTabs current={range} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            label="Menu opens"
            value={data.opens}
            previous={data.prevOpens}
            formatted={formatInt(data.opens)}
            sparkline={data.daily.map((d) => d.opens)}
            color={OPENS_COLOR}
            icon={<Eye size={13} strokeWidth={2} />}
            kind="count"
          />
          <KpiTile
            label="Item taps"
            value={data.taps}
            previous={data.prevTaps}
            formatted={formatInt(data.taps)}
            sparkline={data.daily.map((d) => d.taps)}
            color={TAPS_COLOR}
            icon={<MousePointerClick size={13} strokeWidth={2} />}
            kind="count"
          />
          <KpiTile
            label="Conversion"
            value={data.conversion}
            previous={data.prevConversion}
            formatted={data.opens === 0 ? "—" : formatPercent(data.conversion)}
            sparkline={conversionSpark}
            color={CONVERSION_COLOR}
            icon={<Zap size={13} strokeWidth={2} />}
            kind="rate"
            footer="taps per open"
          />
          <KpiTile
            label="Avg rating"
            value={data.avgRating}
            previous={data.prevAvgRating}
            formatted={formatRating(data.avgRating)}
            sparkline={[]}
            color={RATING_COLOR}
            icon={<Star size={13} strokeWidth={2} />}
            kind="rating"
            footer={`${data.reviewCount} ${data.reviewCount === 1 ? "review" : "reviews"}`}
          />
        </div>

        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Daily trend</h2>
            <div className="flex items-center gap-4 text-xs">
              <LegendDot color={OPENS_COLOR} label="Opens" />
              <LegendDot color={TAPS_COLOR} label="Taps" />
            </div>
          </div>
          <TrendChart data={data.daily} />
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Top items</h2>
            <TopItemsList items={data.topItems} />
          </section>
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              When people scan
              <span className="ml-2 text-xs font-normal text-gray-400">UTC</span>
            </h2>
            <Heatmap cells={data.heatmap} />
          </section>
        </div>

        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Reviews</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <RatingDistribution
              buckets={data.ratingDistribution}
              total={data.reviewCount}
              avg={data.avgRating}
            />
            <RecentReviewsList reviews={data.recentReviews} />
          </div>
        </section>
      </div>
    </main>
  );
}
