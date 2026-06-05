-- Enums
create type public.category as enum (
  'specials',
  'appetizers',
  'mains',
  'sides',
  'drinks',
  'desserts'
);

create type public.event_type as enum (
  'menu_open',
  'item_tap'
);

-- Tables

create table public.restaurants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  has_specials    boolean not null default true,
  has_appetizers  boolean not null default true,
  has_mains       boolean not null default true,
  has_sides       boolean not null default true,
  has_drinks      boolean not null default true,
  has_desserts    boolean not null default true
);

create table public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name          text not null,
  description   text not null default '',
  price         numeric(10, 2) not null,
  category      public.category not null,
  image_url     text,
  is_featured   boolean not null default false,
  is_available  boolean not null default true,
  sort_order    integer not null default 0
);

create table public.nfc_tags (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  label         text not null default '',
  created_at    timestamptz not null default now()
);

create table public.click_events (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nfc_tag_id    uuid not null references public.nfc_tags (id) on delete cascade,
  event_type    public.event_type not null,
  menu_item_id  uuid references public.menu_items (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nfc_tag_id    uuid not null references public.nfc_tags (id) on delete cascade,
  body          text not null,
  rating        integer not null check (rating >= 1 and rating <= 5),
  created_at    timestamptz not null default now()
);

-- Row Level Security

alter table public.restaurants   enable row level security;
alter table public.menu_items    enable row level security;
alter table public.nfc_tags      enable row level security;
alter table public.click_events  enable row level security;
alter table public.reviews       enable row level security;

-- anon: read-only public data
create policy "anon can read restaurants"
  on public.restaurants for select
  to anon
  using (true);

create policy "anon can read menu_items"
  on public.menu_items for select
  to anon
  using (true);

create policy "anon can insert click_events"
  on public.click_events for insert
  to anon
  with check (true);

create policy "anon can insert reviews"
  on public.reviews for insert
  to anon
  with check (true);

-- authenticated owner: full CRUD on own restaurant's data
create policy "owner full access to own restaurant"
  on public.restaurants for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "owner full access to own menu_items"
  on public.menu_items for all
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  )
  with check (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

create policy "owner full access to own nfc_tags"
  on public.nfc_tags for all
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  )
  with check (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

create policy "owner full access to own click_events"
  on public.click_events for all
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  )
  with check (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

create policy "owner full access to own reviews"
  on public.reviews for all
  to authenticated
  using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  )
  with check (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- Storage: menu-images bucket
-- Run separately in Supabase dashboard or via CLI:
--   supabase storage create menu-images --public
-- Then add bucket policy: authenticated can upload, anon can read.
