import { redirect } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listReviews } from "@/lib/review-service";

function StarsRow({ rating, size = 14 }: { rating: number; size?: number }) {
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

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminReviewsPage() {
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

  const reviews = await listReviews(restaurant.id, supabase);
  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <main className="wrap">
      <div className="page-head">
        <div>
          <Link href="/admin" className="back-link">← Overview</Link>
          <h1 className="greeting display">Reviews</h1>
          <p className="subhead">
            {reviews.length === 0
              ? "No reviews yet — they appear as customers leave them."
              : `${reviews.length} review${reviews.length === 1 ? "" : "s"} · ${avg.toFixed(1)} average`}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="panel">
          <div className="empty">No reviews yet.</div>
        </div>
      ) : (
        <div className="panel">
          {reviews.map((review) => (
            <div className="review" key={review.id}>
              <div className="review-top">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <StarsRow rating={review.rating} />
                  <span className="review-name">
                    {review.tag_label ?? "Guest"}
                  </span>
                </div>
                <span className="review-time">{formatTimestamp(review.created_at)}</span>
              </div>
              <p className="review-text" style={{ whiteSpace: "pre-wrap" }}>
                {review.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
