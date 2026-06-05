"use client";

import { useMemo } from "react";
import { MenuTheme } from "@/themes";
import type { Restaurant, MenuItem } from "@/themes/types";
import { createClient } from "@/lib/supabase/client";
import { createAnalyticsTracker } from "@/lib/analytics-tracker";
import { submitReviewAction } from "./actions";

interface Props {
  restaurant: Restaurant;
  tagLabel?: string;
  restaurantId: string;
  nfcTagId: string;
}

export function MenuClient({ restaurant, tagLabel, restaurantId, nfcTagId }: Props) {
  const tracker = useMemo(() => {
    const supabase = createClient();
    return createAnalyticsTracker(supabase);
  }, []);

  function handleItemTap(item: MenuItem) {
    tracker.trackItemTap({ restaurantId, nfcTagId, menuItemId: item.id });
  }

  async function handleSubmitReview({ rating, body }: { rating: number; body: string }) {
    const result = await submitReviewAction({ restaurantId, nfcTagId, rating, body });
    return { ok: result.ok, error: result.ok ? undefined : result.error };
  }

  return (
    <MenuTheme
      restaurant={restaurant}
      tagLabel={tagLabel}
      onItemTap={handleItemTap}
      onSubmitReview={handleSubmitReview}
    />
  );
}
