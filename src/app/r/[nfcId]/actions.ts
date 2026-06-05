"use server";

import { createClient } from "@/lib/supabase/server";
import { submitReview, type SubmitReviewResult } from "@/lib/review-service";
import { createReviewNotifier } from "@/lib/review-notifier";

export async function submitReviewAction(input: {
  restaurantId: string;
  nfcTagId: string;
  rating: number;
  body: string;
}): Promise<SubmitReviewResult> {
  const supabase = await createClient();
  const notifier = createReviewNotifier();
  return submitReview(input, supabase, notifier);
}
