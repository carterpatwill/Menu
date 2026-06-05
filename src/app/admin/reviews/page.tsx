import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listReviews } from "@/lib/review-service";

const FULL_STARS = "★★★★★";
const EMPTY_STARS = "☆☆☆☆☆";

function renderStars(rating: number): string {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return FULL_STARS.slice(0, clamped) + EMPTY_STARS.slice(clamped);
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
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
      <main style={{ padding: "2rem" }}>
        <p>No restaurant found for your account.</p>
      </main>
    );
  }

  const reviews = await listReviews(restaurant.id, supabase);

  return (
    <main style={{ padding: "2rem", maxWidth: "48rem" }}>
      <h1>{restaurant.name} — Reviews</h1>
      {reviews.length === 0 ? (
        <p style={{ color: "#555" }}>
          No reviews yet. They’ll appear here as customers submit them from your
          menu page.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {reviews.map((review) => (
            <li
              key={review.id}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 8,
                padding: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  aria-label={`${review.rating} out of 5 stars`}
                  style={{ color: "#e8a52b", fontSize: "1.1rem", letterSpacing: 2 }}
                >
                  {renderStars(review.rating)}
                </span>
                <span style={{ color: "#777", fontSize: "0.85rem" }}>
                  {formatTimestamp(review.created_at)}
                </span>
              </div>
              <p style={{ margin: "0 0 0.5rem", whiteSpace: "pre-wrap" }}>
                {review.body}
              </p>
              <div style={{ color: "#555", fontSize: "0.85rem" }}>
                {review.tag_label ?? "Unknown tag"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
