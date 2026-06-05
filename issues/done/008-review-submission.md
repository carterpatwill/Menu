## Parent PRD

`issues/prd.md`

## What to build

A review form at the bottom of the public menu page. On submit, the Review Submission module inserts a row into `reviews` and fires an email notification to the restaurant owner via Resend. The email step is a decoupled side effect.

See the Review Submission module in the PRD.

## Acceptance criteria

- [ ] A review form (star rating 1–5 + text body) appears at the bottom of `/r/[nfcId]`
- [ ] Submitting a valid review inserts a row into `reviews` with `restaurant_id`, `nfc_tag_id`, `body`, `rating`, `created_at`
- [ ] After submission, the form is replaced with a thank-you message; no page reload
- [ ] An email is sent to the restaurant owner via Resend on every successful submission
- [ ] Invalid submissions (missing body, rating outside 1–5) return a validation error without inserting
- [ ] Review Submission module is unit-tested: valid review inserts + triggers email; invalid review returns error without inserting (email client mocked)
- [ ] `RESEND_API_KEY` added to `.env.local` and `.env.example`

## Blocked by

- Blocked by `issues/002-public-menu-page.md`

## User stories addressed

- User story 7 (submit review from menu page)
- User story 21 (owner receives email notification on review)
