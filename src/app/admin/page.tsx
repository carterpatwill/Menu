import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Utensils,
  Tag as TagIcon,
  BarChart2,
  Star,
  Settings,
  Eye,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAnalytics } from "@/lib/analytics-service";
import { listTags } from "@/lib/nfc-tag-service";
import { listItems } from "@/lib/menu-item-service";
import { listReviews } from "@/lib/review-service";

function timeOfDay(d: Date): "morning" | "afternoon" | "evening" {
  const h = d.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function relativeTime(iso: string, now = new Date()): string {
  const ms = now.getTime() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildChartPaths(values: number[]) {
  const W = 640;
  const H = 180;
  const pad = 8;
  if (values.length < 2) return { line: "", area: "" };
  const rawMax = Math.max(...values);
  const rawMin = Math.min(...values);
  const max = rawMax === 0 ? 1 : rawMax * 1.1;
  const min = rawMin === 0 ? 0 : rawMin * 0.85;
  const range = max - min || 1;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (values.length - 1);
  const y = (v: number) => H - pad - ((v - min) / range) * (H - pad * 2);
  const pts = values.map((v, i) => [x(i), y(v)] as const);
  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const mx = (px + cx) / 2;
    line += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
  }
  const area = `${line} L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`;
  return { line, area };
}

function StarsRow({ rating, size = 13 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="stars-inline">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= rounded;
        return (
          <Star
            key={s}
            size={size}
            strokeWidth={1.5}
            fill={filled ? "var(--star)" : "var(--line)"}
            color={filled ? "var(--star)" : "var(--line)"}
          />
        );
      })}
    </span>
  );
}

export default async function AdminPage() {
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

  const [analytics, tags, items, reviews] = await Promise.all([
    getAnalytics(restaurant.id, supabase, "7d"),
    listTags(restaurant.id, supabase),
    listItems(restaurant.id, supabase),
    listReviews(restaurant.id, supabase),
  ]);

  const reviewCountLifetime = reviews.length;
  const avgRatingLifetime =
    reviewCountLifetime === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviewCountLifetime;

  const tagCount = tags.length;
  const itemCount = items.length;
  const categoryCount = new Set(items.map((i) => i.category)).size;
  const recentReviews = reviews.slice(0, 3);
  const firstTagId = tags[0]?.id ?? null;

  const opensDelta =
    analytics.prevOpens === 0
      ? analytics.opens > 0
        ? null
        : 0
      : ((analytics.opens - analytics.prevOpens) / analytics.prevOpens) * 100;

  const dailyOpens = analytics.daily.map((d) => d.opens);
  const dayLabels = analytics.daily.map((d) =>
    DOW[new Date(`${d.date}T00:00:00Z`).getUTCDay()]
  );
  const { line: chartLine, area: chartArea } = buildChartPaths(dailyOpens);

  const now = new Date();
  const greeting = `Good ${timeOfDay(now)}, ${restaurant.name}`;
  const dateline = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="wrap">
      <div className="page-head">
        <div>
          <h1 className="greeting display">{greeting}</h1>
          <p className="subhead">
            {dateline} · Here is how your menu is performing.
          </p>
        </div>
        {firstTagId ? (
          <Link href={`/r/${firstTagId}`} target="_blank" className="btn-primary">
            <ExternalLink size={16} strokeWidth={2.2} />
            View live menu
          </Link>
        ) : (
          <Link href="/admin/tags" className="btn-primary">
            <TagIcon size={16} strokeWidth={2.2} />
            Set up a tag
          </Link>
        )}
      </div>

      <section className="stats">
        <div className="stat hero">
          <p className="stat-label">
            <Eye size={16} strokeWidth={2} color="var(--ink-faint)" />
            Menu opens this week
          </p>
          <div className="stat-value">{analytics.opens.toLocaleString()}</div>
          <div className="stat-sub">
            {opensDelta === null ? (
              <span style={{ color: "var(--ink-faint)" }}>no prior data</span>
            ) : (
              <>
                <span className={`delta ${opensDelta >= 0 ? "up" : "down"}`}>
                  {opensDelta >= 0 ? (
                    <ChevronUp size={13} strokeWidth={3} />
                  ) : (
                    <ChevronDown size={13} strokeWidth={3} />
                  )}
                  {Math.abs(opensDelta).toFixed(0)}%
                </span>
                vs last week
              </>
            )}
          </div>
        </div>

        <div className="stat">
          <p className="stat-label">New reviews</p>
          <div className="stat-value">{analytics.reviewCount}</div>
          <div className="stat-sub">in the last 7 days</div>
        </div>

        <div className="stat">
          <p className="stat-label">Average rating</p>
          <div className="stat-value">
            {reviewCountLifetime === 0 ? "—" : avgRatingLifetime.toFixed(1)}
          </div>
          <div className="stat-sub">
            {reviewCountLifetime > 0 && <StarsRow rating={avgRatingLifetime} />}
            {reviewCountLifetime === 0
              ? "no reviews yet"
              : `across ${reviewCountLifetime} ${
                  reviewCountLifetime === 1 ? "review" : "reviews"
                }`}
          </div>
        </div>

        <div className="stat">
          <p className="stat-label">Active tags</p>
          <div className="stat-value">{tagCount}</div>
          <div className="stat-sub">
            {tagCount === 0 ? "none yet" : tagCount === 1 ? "NFC tag" : "NFC tags"}
          </div>
        </div>
      </section>

      <section className="grid-main">
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title display">Engagement</h2>
            <Link href="/admin/analytics" className="panel-link">Full analytics</Link>
          </div>
          <div className="chart-wrap chart">
            {chartLine ? (
              <>
                <svg viewBox="0 0 640 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="tappi-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={chartArea} fill="url(#tappi-area)" />
                  <path
                    d={chartLine}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="chart-axis">
                  {dayLabels.map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty">No engagement data yet.</div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title display">Recent reviews</h2>
            <Link href="/admin/reviews" className="panel-link">See all</Link>
          </div>
          {recentReviews.length === 0 ? (
            <div className="empty">No reviews yet.</div>
          ) : (
            <div>
              {recentReviews.map((r) => (
                <div className="review" key={r.id}>
                  <div className="review-top">
                    <span className="review-name">
                      {r.tag_label ?? "Guest"}
                    </span>
                    <span className="review-time">{relativeTime(r.created_at)}</span>
                  </div>
                  <div className="stars-inline" style={{ marginBottom: 6 }}>
                    <StarsRow rating={r.rating} />
                  </div>
                  <p className="review-text">{r.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <p className="section-label">Manage</p>
      <section className="manage">
        <Link className="card" href="/admin/menu">
          <div className="card-icon">
            <Utensils size={21} strokeWidth={2} />
          </div>
          <h3 className="card-title display">Menu</h3>
          <div className="card-count">
            <strong>{itemCount}</strong>{" "}
            {itemCount === 1 ? "item" : "items"} in {categoryCount}{" "}
            {categoryCount === 1 ? "category" : "categories"}
          </div>
        </Link>

        <Link className="card" href="/admin/tags">
          <div className="card-icon">
            <TagIcon size={21} strokeWidth={2} />
          </div>
          <h3 className="card-title display">Tags</h3>
          <div className="card-count">
            <strong>{tagCount}</strong> active
          </div>
        </Link>

        <Link className="card" href="/admin/analytics">
          <div className="card-icon">
            <BarChart2 size={21} strokeWidth={2} />
          </div>
          <h3 className="card-title display">Analytics</h3>
          <div className="card-count">Opens, taps and trends</div>
        </Link>

        <Link className="card" href="/admin/reviews">
          <div className="card-icon">
            <Star size={21} strokeWidth={2} />
          </div>
          <h3 className="card-title display">Reviews</h3>
          <div className="card-count">
            {reviewCountLifetime === 0 ? (
              "No reviews yet"
            ) : (
              <>
                <strong>{avgRatingLifetime.toFixed(1)}</strong> avg,{" "}
                {analytics.reviewCount} new
              </>
            )}
          </div>
        </Link>

        <Link className="card" href="/admin/settings">
          <div className="card-icon">
            <Settings size={21} strokeWidth={2} />
          </div>
          <h3 className="card-title display">Settings</h3>
          <div className="card-count">Theme and tagline</div>
        </Link>
      </section>
    </main>
  );
}
