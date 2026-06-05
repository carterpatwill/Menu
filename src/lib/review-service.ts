import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

export interface ReviewInput {
  restaurantId: string;
  nfcTagId: string;
  rating: number;
  body: string;
}

export interface ReviewNotifier {
  notifyOwnerOfReview(args: {
    restaurantId: string;
    nfcTagId: string;
    rating: number;
    body: string;
  }): Promise<void>;
}

export type SubmitReviewResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitReview(
  input: ReviewInput,
  supabase: SupabaseClient<Database>,
  notifier: ReviewNotifier
): Promise<SubmitReviewResult> {
  const body = input.body?.trim() ?? "";
  if (!body) return { ok: false, error: "Review body is required" };
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { ok: false, error: "Rating must be a whole number from 1 to 5" };
  }

  const { error } = await supabase.from("reviews").insert({
    restaurant_id: input.restaurantId,
    nfc_tag_id: input.nfcTagId,
    body,
    rating: input.rating,
  });
  if (error) return { ok: false, error: "Failed to submit review" };

  await notifier.notifyOwnerOfReview({
    restaurantId: input.restaurantId,
    nfcTagId: input.nfcTagId,
    rating: input.rating,
    body,
  });
  return { ok: true };
}
