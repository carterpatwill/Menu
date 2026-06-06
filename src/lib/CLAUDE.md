# src/lib

## Services accept the Supabase client as a parameter

Every service function signature looks like:
```ts
export async function listItems(restaurantId: string, supabase: Supabase): Promise<...>
```

The client is injected, not created inside the function. This is what makes the test suite work — tests pass a chainable mock object instead of a real client. If you move `createClient()` calls inside service functions, every test breaks. Keep data access and client creation separate.

## Services do not redirect or set cookies

Services return values or throw errors. They never call `redirect()`, `cookies()`, or anything from `next/navigation`/`next/headers`. That boundary belongs to the page or server action that calls the service.

## analytics-tracker.ts is stateful by design

`createAnalyticsTracker()` returns an object that holds a `Map` for debounce tracking. It must be instantiated once per page mount (in a client component), not at module level. The factory pattern exists so each menu page gets its own debounce state rather than sharing one across all open tabs.

## menu-renderer.ts is the only DB→theme type boundary

`toThemeRestaurant()` and `buildMenuSections()` are the only places where raw DB rows become `Restaurant` / `MenuItem` theme types. Do not convert DB types to theme types anywhere else — if the mapping needs to change (e.g., the theme gains a new field), this is the single file to update.

The `CATEGORY_FLAGS` map in this file is the authoritative link between `has_*` boolean columns on `restaurants` and the `Category` enum. If a new category is added to the DB, it must be added here and to `src/themes/types.ts`.
