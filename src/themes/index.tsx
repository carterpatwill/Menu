import { Restaurant, Theme, MenuItem } from "./types";
import { WarmTheme } from "./WarmTheme";
import { MinimalTheme } from "./MinimalTheme";
import { BoldTheme } from "./BoldTheme";
import type { ReviewSubmitInput, ReviewSubmitResult } from "./useReviewForm";

export { WarmTheme, MinimalTheme, BoldTheme };
export type { Theme, Restaurant } from "./types";
export { CATEGORY_LABELS } from "./types";
export type { MenuItem, Category } from "./types";

interface Props {
  restaurant: Restaurant;
  tagLabel?: string;
  onItemTap?: (item: MenuItem) => void;
  onSubmitReview?: (input: ReviewSubmitInput) => Promise<ReviewSubmitResult>;
}

export function MenuTheme({ restaurant, tagLabel, onItemTap, onSubmitReview }: Props) {
  switch (restaurant.theme) {
    case "minimal":
      return <MinimalTheme restaurant={restaurant} tagLabel={tagLabel} onItemTap={onItemTap} onSubmitReview={onSubmitReview} />;
    case "bold":
      return <BoldTheme restaurant={restaurant} tagLabel={tagLabel} onItemTap={onItemTap} onSubmitReview={onSubmitReview} />;
    case "warm":
    default:
      return <WarmTheme restaurant={restaurant} tagLabel={tagLabel} onItemTap={onItemTap} onSubmitReview={onSubmitReview} />;
  }
}
