# src/themes

## MenuTheme is the only public entry point

Pages import `<MenuTheme>` from `src/themes/index.tsx` and pass a `Restaurant` object. Individual theme components (`WarmTheme`, `MinimalTheme`, `BoldTheme`) are not imported directly from pages — the switch lives in `MenuTheme`. Adding a new theme means: create the component, add a case to the switch, add the value to the `Theme` union in `types.ts`.

## Theme components receive theme types, not DB types

Theme components accept `Restaurant` from `src/themes/types.ts`. They never receive raw Supabase rows. The conversion always happens in `src/lib/menu-renderer.ts` before calling `<MenuTheme>`. If you find yourself importing `Database` types inside a theme component, something is wrong.

## useReviewForm accepts an optional callback, not a hard dependency

`useReviewForm(onSubmit?)` takes an optional async function rather than calling a server action directly. This keeps theme components testable — tests can pass a mock submit function without needing to mock Next.js server actions. The actual server action is wired in at the page/client component level, not inside the theme.

## Category display is controlled by enabledCategories

`restaurant.enabledCategories` is the filtered list of categories that have `has_*: true` in the DB. Theme components should only render sections for categories in this list. The filtering happens in `menu-renderer.ts` before the data reaches the theme — themes do not need to check `has_*` flags themselves.
