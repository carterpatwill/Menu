# src/app/admin/menu

## getRestaurantId() is the authorization check

Every server action calls `getRestaurantId(supabase)` before touching any data. This function verifies the session user owns the restaurant being modified. Do not remove this call, inline it, or move it after the mutation — it is the only thing preventing one restaurant owner from editing another's data.

## Image uploads use createAdminClient(), not createClient()

The `menu-images` storage bucket requires the service role key to upload. `validateAndUpload()` in `src/lib/image-upload.ts` accepts a storage client, and `saveItemAction` passes `createAdminClient()` specifically for this reason. The rest of the action uses the cookie-scoped `createClient()` for user-scoped queries.

## revalidatePath must be called after every mutation

All actions that write to the DB call `revalidatePath("/admin/menu")`. This invalidates the Next.js cache so the admin page re-fetches fresh data on next load. Forgetting this means the UI shows stale state after saves/deletes.

## Server actions are the only write path

The `MenuManager` client component calls these server actions for all mutations. There is no API route for menu edits. Do not add a `/api/menu` route — keep mutations in `actions.ts` where they are co-located with the page and benefit from the same auth + revalidation pattern.
