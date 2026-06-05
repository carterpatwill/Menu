import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getDailyMenuOpens,
  getItemTapCounts,
  getHourlyBreakdown,
  type DailyOpens,
  type ItemTapCount,
  type HourBucket,
} from "@/lib/analytics-service";

function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function maxCount(values: number[]): number {
  return values.reduce((m, v) => (v > m ? v : m), 0);
}

function BarRow({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max === 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
      <span style={{ width: "5.5rem", fontSize: "0.8rem", color: "#555" }}>{label}</span>
      <div style={{ flex: 1, background: "#f1f1f1", borderRadius: 4, height: "0.85rem" }}>
        <div
          style={{
            width: `${pct}%`,
            background: color,
            height: "100%",
            borderRadius: 4,
            minWidth: count > 0 ? 2 : 0,
          }}
        />
      </div>
      <span style={{ width: "2.5rem", fontSize: "0.8rem", textAlign: "right" }}>{count}</span>
    </div>
  );
}

function DailyOpensChart({ data }: { data: DailyOpens[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return (
      <p style={{ color: "#555" }}>No menu opens recorded in the last 30 days.</p>
    );
  }
  const max = maxCount(data.map((d) => d.count));
  return (
    <div>
      {data.map((d) => (
        <BarRow
          key={d.date}
          label={formatDayLabel(d.date)}
          count={d.count}
          max={max}
          color="#3a7bd5"
        />
      ))}
    </div>
  );
}

function ItemTapList({ items }: { items: ItemTapCount[] }) {
  if (items.length === 0) {
    return <p style={{ color: "#555" }}>No item taps recorded yet.</p>;
  }
  const max = maxCount(items.map((i) => i.count));
  return (
    <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((item, idx) => (
        <li key={item.menuItemId} style={{ marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <span>
              <span style={{ color: "#999", marginRight: "0.5rem" }}>#{idx + 1}</span>
              {item.name}
            </span>
            <span style={{ color: "#555" }}>{item.count}</span>
          </div>
          <div style={{ background: "#f1f1f1", borderRadius: 4, height: "0.4rem" }}>
            <div
              style={{
                width: `${max === 0 ? 0 : Math.round((item.count / max) * 100)}%`,
                background: "#e8a52b",
                height: "100%",
                borderRadius: 4,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

function HourlyBreakdown({ buckets }: { buckets: HourBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.opens + b.taps, 0);
  if (total === 0) {
    return <p style={{ color: "#555" }}>No events recorded yet.</p>;
  }
  const max = maxCount(buckets.flatMap((b) => [b.opens, b.taps]));
  return (
    <div>
      {buckets.map((b) => (
        <div key={b.bucket} style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#555", marginBottom: 2 }}>
            {b.bucket} UTC
          </div>
          <BarRow label="Opens" count={b.opens} max={max} color="#3a7bd5" />
          <BarRow label="Taps" count={b.taps} max={max} color="#e8a52b" />
        </div>
      ))}
    </div>
  );
}

export default async function AdminAnalyticsPage() {
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
      <main style={{ padding: "2rem" }}>
        <p>No restaurant found for your account.</p>
      </main>
    );
  }

  const [daily, taps, hourly] = await Promise.all([
    getDailyMenuOpens(restaurant.id, supabase),
    getItemTapCounts(restaurant.id, supabase),
    getHourlyBreakdown(restaurant.id, supabase),
  ]);

  return (
    <main style={{ padding: "2rem", maxWidth: "48rem" }}>
      <h1>{restaurant.name} — Analytics</h1>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          Menu opens — last 30 days
        </h2>
        <DailyOpensChart data={daily} />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          Most-tapped items
        </h2>
        <ItemTapList items={taps} />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          Time of day — opens vs taps (2-hour buckets, UTC)
        </h2>
        <HourlyBreakdown buckets={hourly} />
      </section>
    </main>
  );
}
