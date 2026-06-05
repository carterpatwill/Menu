## Parent PRD

`issues/prd.md`

## What to build

`/admin/tags` page where the owner can see all NFC tags linked to their restaurant, add new tags, and assign or update a human-readable label (e.g. "Table 4", "Bar", "Patio"). Tags are pre-linked to the restaurant at onboarding; this slice is about labelling for analytics legibility.

See the `nfc_tags` schema and user stories 16, 22 in the PRD.

## Acceptance criteria

- [ ] `/admin/tags` lists all `nfc_tags` rows for the owner's restaurant with their current label and `created_at`
- [ ] Owner can add a new tag (generates a new `id`; the NFC URL `[domain]/r/[id]` is displayed for programming)
- [ ] Owner can edit the label on any existing tag
- [ ] Tag `id` is immutable after creation (the URL encoded on the physical tag must never change)
- [ ] RLS prevents reading or writing another restaurant's tags

## Blocked by

- Blocked by `issues/004-admin-auth.md`

## User stories addressed

- User story 16 (manage NFC tags, assign labels)
- User story 22 (menu permanently linked to NFC tags)
