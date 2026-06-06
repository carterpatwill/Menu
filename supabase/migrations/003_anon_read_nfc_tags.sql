-- Required for the public menu page: nfc-resolver.ts queries nfc_tags with the anon client
create policy "anon can read nfc_tags"
  on public.nfc_tags for select
  to anon
  using (true);
