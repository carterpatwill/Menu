## Parent PRD

`issues/prd.md`

## What to build

When a customer taps a menu item, show a detail view (modal or drawer) with the full item info, and fire a debounced `item_tap` event into `click_events`. The Analytics Tracker module is decoupled from the UI so it can be tested without rendering.

See the Analytics Tracker and Menu Renderer modules in the PRD.

## Acceptance criteria

- [ ] Tapping a menu item opens a detail view (modal or bottom drawer) showing photo, name, price, and full description
- [ ] Tapping outside the detail view or a close button dismisses it
- [ ] An `item_tap` event is inserted into `click_events` with the correct `restaurant_id`, `nfc_tag_id`, `menu_item_id`, and `event_type = 'item_tap'`
- [ ] Analytics Tracker debounces: tapping the same item within the debounce window does not insert a duplicate event
- [ ] Analytics Tracker is unit-tested: correct payload fired on tap; no duplicate within debounce window

## Blocked by

- Blocked by `issues/002-public-menu-page.md`

## User stories addressed

- User story 6 (tap item to see detail)
- User story 18 (item tap data feeds admin analytics)
