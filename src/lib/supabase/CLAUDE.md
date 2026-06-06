# src/lib/supabase

Two distinct clients exist for a reason — do not collapse them.

## createClient() vs createAdminClient()

`createClient()` uses `@supabase/ssr` with cookie read/write callbacks. This is what keeps the user's auth session synchronized between the browser and server. It uses the **anon key** and respects Row Level Security.

`createAdminClient()` uses the raw `@supabase/supabase-js` client with the **service role key**. It bypasses RLS entirely. Use it only for privileged operations that the user's session cannot authorize — currently: Supabase Storage uploads (the `menu-images` bucket requires elevated permissions). Never use it for user-scoped reads or writes.

## The silent catch in setAll

```ts
try {
  cookiesToSet.forEach(...)
} catch {
  // setAll called from a Server Component; session reads still work.
}
```

This is intentional. Server Components can read cookies but cannot write them. Supabase SSR calls `setAll` during session refresh, which would throw in a Server Component context. The catch silences that — session reads continue to work fine. Do not remove it or replace it with a logged error.

## Types

`types.ts` is auto-generated from the live Supabase schema. After any schema change (new column, new table, new enum), regenerate it:

```
npm run gen-types
```

Do not edit `types.ts` by hand — changes will be overwritten on the next generation.
