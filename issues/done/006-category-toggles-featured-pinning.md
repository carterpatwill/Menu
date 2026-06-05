## Parent PRD

`issues/prd.md`

## What to build

Two admin controls that refine how the public menu renders: (1) per-category toggles that show/hide entire sections, and (2) a pin/unpin control on each item that marks it as featured. Both mutate existing rows (`restaurants` and `menu_items`) and immediately affect what customers see on `/r/[nfcId]`.

See `restaurants` schema (category boolean flags) and `menu_items.is_featured` in the PRD.

## Acceptance criteria

- [ ] `/admin/menu` shows a toggle for each of the 6 categories (Specials, Appetizers, Mains, Sides, Drinks, Desserts)
- [ ] Toggling a category off sets the corresponding boolean on the `restaurants` row and immediately hides that section on the public menu
- [ ] Each menu item has a pin/unpin control; pinning sets `is_featured = true`
- [ ] Featured items appear as hero cards above all category sections on the public menu (already rendered by slice 002 — this slice adds the admin control)
- [ ] Category toggles and featured pins survive page refresh (persisted in DB, not local state)

## Blocked by

- Blocked by `issues/005-menu-item-management.md`

## User stories addressed

- User story 13 (toggle categories on/off)
- User story 14 (pin featured items)
