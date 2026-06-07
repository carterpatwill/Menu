import { redirect } from "next/navigation";
import Link from "next/link";
import {
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
    return <span className="chip" style={{ cursor: "default", fontSize: 11 }}>no data</span>;
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

  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`delta ${positive ? "up" : "down"}`} style={{ fontSize: 12 }}>
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
    <div className="stat">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="stat-label">
          <span
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: 24,
              height: 24,
              borderRadius: 7,
              background: `${color}1f`,
              color,
            }}
          >
            {icon}
          </span>
          {label}
        </div>
        <DeltaChip current={value} previous={previous} kind={kind} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div className="stat-value" style={{ fontSize: 30 }}>{formatted}</div>
          {footer && <div style={{ marginTop: 6, fontSize: 12, color: "var(--ink-faint)" }}>{footer}</div>}
        </div>
        <Sparkline values={sparkline} color={color} />
      </div>
    </div>
  );
}

function RangeTabs({ current }: { current: Range }) {
  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: 10,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        padding: 3,
        boxShadow: "var(--shadow)",
      }}
    >
      {RANGES.map((r) => {
        const active = r.value === current;
        return (
          <Link
            key={r.value}
            href={`/admin/analytics?range=${r.value}`}
            style={{
              padding: "6px 12px",
              borderRadius: 7,
              fontSize: 12.5,
              fontWeight: 600,
              color: active ? "#fff" : "var(--ink-soft)",
              background: active ? "var(--ink)" : "transparent",
              transition: "all .15s ease",
            }}
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-soft)", fontSize: 12 }}>
      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: color }} />
      {label}
    </span>
  );
}

function TopItemsList({ items, accent }: { items: TopItem[]; accent: string }) {
  if (items.length === 0) {
    return <div className="empty">No item taps in this range.</div>;
  }
  const max = Math.max(...items.map((i) => i.count));
  return (
    <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, idx) => {
        const pct = (item.count / max) * 100;
        return (
          <li key={item.menuItemId}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13.5 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ width: 16, color: "var(--ink-faint)", fontVariantNumeric: "tabular-nums", fontSize: 12 }}>
                  {idx + 1}
                </span>
                <span style={{ color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.name}
                </span>
              </span>
              <span style={{ marginLeft: 12, color: "var(--ink-soft)", fontVariantNumeric: "tabular-nums" }}>
                {item.count}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: accent }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];

function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const max = Math.max(1, ...cells.map((c) => c.count));
  const total = cells.reduce((s, c) => s + c.count, 0);
  if (total === 0) {
    return <div className="empty">No activity in this range.</div>;
  }
  const get = (dow: number, b: number) =>
    cells.find((c) => c.dayOfWeek === dow && c.bucket === b)?.count ?? 0;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderSpacing: 3, borderCollapse: "separate" }}>
        <thead>
          <tr>
            <th style={{ width: 20 }}></th>
            {Array.from({ length: 12 }, (_, b) =>
              b % 2 === 0 ? (
                <th key={b} colSpan={2} style={{ fontSize: 10, fontWeight: 400, color: "var(--ink-faint)" }}>
                  {String(b * 2).padStart(2, "0")}
                </th>
              ) : null
            )}
          </tr>
        </thead>
        <tbody>
          {DOW_ORDER.map((dow) => (
            <tr key={dow}>
              <td style={{ paddingRight: 4, textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--ink-faint)" }}>
                {DOW_LABELS[dow]}
              </td>
              {Array.from({ length: 12 }, (_, b) => {
                const count = get(dow, b);
                const intensity = count === 0 ? 0 : 0.15 + 0.85 * (count / max);
                const bg = count === 0 ? "var(--surface-2)" : `rgba(61, 90, 39, ${intensity.toFixed(2)})`;
                const hourStart = String(b * 2).padStart(2, "0");
                const hourEnd = String(b * 2 + 2).padStart(2, "0");
                return (
                  <td
                    key={b}
                    style={{ height: 26, minWidth: 18, borderRadius: 4, background: bg }}
                    title={`${DOW_LABELS[dow]} ${hourStart}:00–${hourEnd}:00 · ${count}`}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, fontSize: 10, color: "var(--ink-faint)" }}>
        Less
        {[0.15, 0.4, 0.65, 0.9].map((a) => (
          <span
            key={a}
            style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: `rgba(61, 90, 39, ${a})` }}
          />
        ))}
        More
      </div>
    </div>
  );
}

function StarsRow({ rating, size = 13 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="stars-inline">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          strokeWidth={1.5}
          fill={s <= rounded ? "var(--star)" : "transparent"}
          color={s <= rounded ? "var(--star)" : "var(--line)"}
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
    return <div className="empty">No reviews in this range.</div>;
  }
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <div className="stat-value" style={{ fontSize: 30 }}>{avg.toFixed(1)}</div>
        <StarsRow rating={avg} size={16} />
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
          {total} {total === 1 ? "review" : "reviews"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[...buckets].reverse().map((b) => {
          const pct = (b.count / max) * 100;
          return (
            <div key={b.stars} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <span style={{ width: 24, display: "inline-flex", alignItems: "center", gap: 2, color: "var(--ink-soft)", fontVariantNumeric: "tabular-nums" }}>
                {b.stars}
                <Star size={10} fill="var(--star)" color="var(--star)" strokeWidth={0} />
              </span>
              <div style={{ height: 6, flex: 1, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "var(--star)" }} />
              </div>
              <span style={{ width: 24, textAlign: "right", color: "var(--ink-soft)", fontVariantNumeric: "tabular-nums" }}>
                {b.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentReviewsList({ reviews }: { reviews: RecentReview[] }) {
  return (
    <div>
      <p className="section-label" style={{ margin: "0 0 12px" }}>Recent</p>
      {reviews.length === 0 ? (
        <div className="empty">No recent reviews.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {reviews.map((r) => (
            <li
              key={r.id}
              style={{
                border: "1px solid var(--line)",
                background: "var(--surface-2)",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                <StarsRow rating={r.rating} />
                <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                  {r.tagLabel ? `${r.tagLabel} · ` : ""}{relativeTime(r.createdAt)}
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0 }}>{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const OPENS_COLOR = "#3D5A27";
const TAPS_COLOR = "#5d7a52";
const CONVERSION_COLOR = "#7c3aed";
const RATING_COLOR = "#d4972c";

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
      <main className="wrap">
        <p style={{ color: "var(--ink-soft)" }}>No restaurant found for your account.</p>
      </main>
    );
  }

  const data: AnalyticsData = await getAnalytics(restaurant.id, supabase, range);
  const conversionSpark = data.daily.map((d: DailyPoint) =>
    d.opens === 0 ? 0 : d.taps / d.opens
  );

  return (
    <main className="wrap">
      <div className="page-head">
        <div>
          <Link href="/admin" className="back-link">← Overview</Link>
          <h1 className="greeting display">Analytics</h1>
          <p className="subhead">
            Last {range === "7d" ? "7" : range === "30d" ? "30" : "90"} days
          </p>
        </div>
        <RangeTabs current={range} />
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
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
      </section>

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <h2 className="panel-title display">Daily trend</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <LegendDot color={OPENS_COLOR} label="Opens" />
            <LegendDot color={TAPS_COLOR} label="Taps" />
          </div>
        </div>
        <TrendChart data={data.daily} />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="analytics-two-col">
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title display">Top items</h2>
          </div>
          <TopItemsList items={data.topItems} accent={TAPS_COLOR} />
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title display">
              When people scan{" "}
              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--ink-faint)", marginLeft: 6 }}>
                UTC
              </span>
            </h2>
          </div>
          <Heatmap cells={data.heatmap} />
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title display">Reviews</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}
          className="analytics-two-col"
        >
          <RatingDistribution
            buckets={data.ratingDistribution}
            total={data.reviewCount}
            avg={data.avgRating}
          />
          <RecentReviewsList reviews={data.recentReviews} />
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
@media (max-width: 760px) {
  .analytics-two-col { grid-template-columns: 1fr !important; }
}
`,
        }}
      />
    </main>
  );
}
