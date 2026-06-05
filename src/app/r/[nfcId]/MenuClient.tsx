"use client";

import { useMemo } from "react";
import { MenuTheme } from "@/themes";
import type { Restaurant, MenuItem } from "@/themes/types";
import { createClient } from "@/lib/supabase/client";
import { createAnalyticsTracker } from "@/lib/analytics-tracker";

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

  return (
    <MenuTheme
      restaurant={restaurant}
      tagLabel={tagLabel}
      onItemTap={handleItemTap}
    />
  );
}
