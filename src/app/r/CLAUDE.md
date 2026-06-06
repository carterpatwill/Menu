# src/app/r

## Analytics tracking happens server-side on page load

`menu_open` is recorded in the server component (`page.tsx`) via a direct Supabase insert before rendering. This is intentional — doing it server-side means the event fires even when client-side JS is blocked or slow, and it avoids double-counting from client re-renders. Item taps (`item_tap`) are tracked client-side via `createAnalyticsTracker()` because they require user interaction.

## ?preview=1 suppresses the menu_open event

When the admin previews the menu from the dashboard, `?preview=1` is appended. The server component checks this and skips the `click_events` insert. Do not remove this guard — without it, every admin preview would pollute the restaurant's analytics.

## notFound() is used for missing NFC tags, not redirect

If `resolveTag()` returns null (tag doesn't exist or restaurant is missing), the page calls `notFound()`. This renders a 404 rather than redirecting to the home page or login, which is correct — the URL is simply invalid for an unauthenticated visitor. Do not change this to a redirect.

## MenuClient holds all client-side state

The page component is a server component; `MenuClient` is the client boundary. All interactivity (item tap tracking, review modal, analytics tracker instantiation) lives in `MenuClient`. Avoid pushing server data fetching into `MenuClient` — the page component's server-side fetch is what enables the server-side `menu_open` event and avoids a client-side loading flash.
