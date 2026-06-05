## Parent PRD

`issues/prd.md`

## What to build

`/admin/menu` page where the owner can add, edit, and delete menu items, upload a photo for each, and toggle individual items as available or unavailable. The Image Upload module handles Supabase Storage interactions independently of the form UI.

See the Image Upload module and user stories 11, 12, 15 in the PRD.

## Acceptance criteria

- [ ] `/admin/menu` lists all menu items for the authenticated owner's restaurant
- [ ] Owner can add a new item: name, description, price, category, photo, available toggle
- [ ] Owner can edit any field on an existing item
- [ ] Owner can delete an item (with a confirmation step)
- [ ] Owner can toggle `is_available` on any item without opening the edit form
- [ ] Photo upload validates file type (image only) and size before uploading to Supabase Storage `menu-images` bucket
- [ ] Uploaded photo URL is saved to `menu_items.image_url`; photo is publicly accessible
- [ ] Image Upload module is usable independently of the form (returns public URL or validation error)
- [ ] RLS prevents any owner from reading or writing another restaurant's items

## Blocked by

- Blocked by `issues/004-admin-auth.md`

## User stories addressed

- User story 11 (add, edit, remove menu items)
- User story 12 (upload photo per item)
- User story 15 (mark items unavailable without deleting)
