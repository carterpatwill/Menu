"use server";

import { createClient } from "@/lib/supabase/server";
import { submitReview, type SubmitReviewResult } from "@/lib/review-service";

export async function submitReviewAction(input: {
  restaurantId: string;
  nfcTagId: string;
  rating: number;
  body: string;
}): Promise<SubmitReviewResult> {
  const supabase = await createClient();
  return submitReview(input, supabase);
}
