import { Restaurant, Theme, MenuItem } from "./types";
import { WarmTheme } from "./WarmTheme";
import { MinimalTheme } from "./MinimalTheme";
import { BoldTheme } from "./BoldTheme";

export { WarmTheme, MinimalTheme, BoldTheme };
export type { Theme, Restaurant } from "./types";
export { CATEGORY_LABELS } from "./types";
export type { MenuItem, Category } from "./types";

interface Props {
  restaurant: Restaurant;
  tagLabel?: string;
  onItemTap?: (item: MenuItem) => void;
}

export function MenuTheme({ restaurant, tagLabel, onItemTap }: Props) {
  switch (restaurant.theme) {
    case "minimal":
      return <MinimalTheme restaurant={restaurant} tagLabel={tagLabel} onItemTap={onItemTap} />;
    case "bold":
      return <BoldTheme restaurant={restaurant} tagLabel={tagLabel} onItemTap={onItemTap} />;
    case "warm":
    default:
      return <WarmTheme restaurant={restaurant} tagLabel={tagLabel} onItemTap={onItemTap} />;
  }
}
