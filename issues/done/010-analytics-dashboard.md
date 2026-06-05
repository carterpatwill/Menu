## Parent PRD

`issues/prd.md`

## What to build

`/admin/analytics` page that queries `click_events` to surface three views: daily menu open counts, per-item tap counts ranked by popularity, and a time-of-day breakdown of all events. All queries are scoped to the authenticated owner's restaurant.

See user stories 17–19 in the PRD.

## Acceptance criteria

- [ ] `/admin/analytics` shows a chart or table of menu opens per calendar day for the last 30 days
- [ ] A ranked list of menu items by total `item_tap` count is shown (item name + count)
- [ ] A time-of-day breakdown groups events into hourly or 2-hour buckets and shows open + tap volume per bucket
- [ ] All three views are scoped to the owner's restaurant via RLS
- [ ] Empty/zero states shown when no events exist yet
- [ ] Data refreshes on page load (no real-time requirement for the pilot)

## Blocked by

- Blocked by `issues/004-admin-auth.md`
- Blocked by `issues/003-item-tap-analytics.md`

## User stories addressed

- User story 17 (menu opens per day — foot traffic trends)
- User story 18 (item tap counts — customer interest)
- User story 19 (time-of-day breakdown — peak interest windows)
