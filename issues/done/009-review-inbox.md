## Parent PRD

`issues/prd.md`

## What to build

`/admin/reviews` page where the owner reads customer reviews submitted through their menu page. Reviews are shown in reverse-chronological order with the rating, body, tag label, and timestamp.

## Acceptance criteria

- [ ] `/admin/reviews` lists all reviews for the owner's restaurant in reverse-chronological order
- [ ] Each review shows: star rating, review body, NFC tag label (joined from `nfc_tags`), and `created_at`
- [ ] Empty state shown when no reviews exist yet
- [ ] RLS prevents reading another restaurant's reviews

## Blocked by

- Blocked by `issues/004-admin-auth.md`
- Blocked by `issues/008-review-submission.md`

## User stories addressed

- User story 20 (owner reads customer reviews in dashboard)
