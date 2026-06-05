## Parent PRD

`issues/prd.md`

## What to build

Build the `/r/[nfcId]` route end-to-end: resolve the NFC tag to a restaurant, log a `menu_open` event, and render the restaurant's menu using the existing `<MenuTheme>` component. Featured items appear as hero cards at the top; items are grouped by enabled categories only; unavailable items are hidden.

See the NFC Resolver, Menu Renderer, and URL Structure sections of the PRD.

## Acceptance criteria

- [ ] `/r/[nfcId]` loads and resolves the tag to the correct restaurant
- [ ] Unknown `nfcId` returns a 404 page
- [ ] `menu_open` event is inserted into `click_events` on every page load (server-side, before render)
- [ ] Featured items render as hero cards above all category sections
- [ ] Menu items are grouped under their category heading; only categories enabled on the restaurant are shown
- [ ] Unavailable items (`is_available = false`) are not shown
- [ ] Page is mobile-first and uses `<MenuTheme>` from `src/themes`
- [ ] NFC Resolver module is unit-tested: valid id returns restaurant + tag data; unknown id returns not-found
- [ ] Menu Renderer module is unit-tested: correct sections rendered; featured items first; unavailable items absent

## Blocked by

- Blocked by `issues/001-supabase-schema-pilot-onboarding.md`

## User stories addressed

- User story 1 (instant load on NFC tap)
- User story 2 (mobile-first design)
- User story 3 (featured items at top)
- User story 4 (items in clear categories)
- User story 5 (photo, name, price, description)
- User story 8 (visually polished)
- User story 9 (only show active categories)
