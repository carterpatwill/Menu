"use client";

import { useState } from "react";

export interface ReviewSubmitInput {
  rating: number;
  body: string;
}

export interface ReviewSubmitResult {
  ok: boolean;
  error?: string;
}

export interface ReviewFormState {
  rating: number;
  setRating: (n: number) => void;
  body: string;
  setBody: (s: string) => void;
  submitting: boolean;
  submitted: boolean;
  error: string | null;
  submit: () => Promise<void>;
}

export function useReviewForm(
  onSubmit?: (input: ReviewSubmitInput) => Promise<ReviewSubmitResult>
): ReviewFormState {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (submitting || submitted) return;
    if (!body.trim()) {
      setError("Please write a short review.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please choose a rating from 1 to 5.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = (await onSubmit?.({ rating, body })) ?? { ok: true };
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Could not submit review.");
      }
    } catch {
      setError("Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return { rating, setRating, body, setBody, submitting, submitted, error, submit };
}
