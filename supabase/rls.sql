-- ============================================================================
-- AI Analytics Dashboard - Row Level Security (RLS)
-- ============================================================================
--
-- Run order for a fresh Supabase project:
--   1. schema.sql
--   2. rls.sql        (this file)
--   3. functions.sql
--
-- How to use
--   Supabase project -> SQL Editor -> paste this file -> Run.
--   Safe to re-run: each policy is dropped, then created again.
--
-- The rule behind every policy
--   A user can only touch rows that belong to THEIR company.
--   Their company is read from their own profile:
--
--       select company_id from public.profiles where id = auth.uid()
--
--   "(select auth.uid())" is written with a sub-select on purpose: Postgres
--   evaluates it once per query instead of once per row.
--
-- All policies target the "authenticated" role: anonymous visitors get nothing.
-- ============================================================================


-- ============================================================================
-- 1. Enable RLS on every table
-- ============================================================================
-- With RLS enabled and no matching policy, a table returns no rows at all.

alter table public.profiles    enable row level security;
alter table public.companies   enable row level security;
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.users       enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.ai_insights enable row level security;


-- ============================================================================
-- 2. Policies
-- ============================================================================


-- ----------------------------------------------------------------------------
-- profiles: a user sees and edits only their own profile
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
)
with check (
  id = (select auth.uid())
);


-- Column-level protection (important).
-- RLS decides WHICH ROWS a user can update, not WHICH COLUMNS. Without the two
-- statements below, the update policy above would let a user rewrite their own
-- company_id and then read another company's data.
-- Only full_name and avatar_url stay editable by users.
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;


-- ----------------------------------------------------------------------------
-- companies: a user sees only their own company (read-only)
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their own company" on public.companies;
create policy "Users can view their own company"
on public.companies
for select
to authenticated
using (
  id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);


-- ----------------------------------------------------------------------------
-- products: full access, limited to the user's company
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their company products" on public.products;
create policy "Users can view their company products"
on public.products
for select
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can insert their company products" on public.products;
create policy "Users can insert their company products"
on public.products
for insert
to authenticated
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can update their company products" on public.products;
create policy "Users can update their company products"
on public.products
for update
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
)
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can delete their company products" on public.products;
create policy "Users can delete their company products"
on public.products
for delete
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);


-- ----------------------------------------------------------------------------
-- customers: full access, limited to the user's company
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their company customers" on public.customers;
create policy "Users can view their company customers"
on public.customers
for select
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can insert their company customers" on public.customers;
create policy "Users can insert their company customers"
on public.customers
for insert
to authenticated
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can update their company customers" on public.customers;
create policy "Users can update their company customers"
on public.customers
for update
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
)
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can delete their company customers" on public.customers;
create policy "Users can delete their company customers"
on public.customers
for delete
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);


-- ----------------------------------------------------------------------------
-- users: full access, limited to the user's company
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their company users" on public.users;
create policy "Users can view their company users"
on public.users
for select
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can insert their company users" on public.users;
create policy "Users can insert their company users"
on public.users
for insert
to authenticated
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can update their company users" on public.users;
create policy "Users can update their company users"
on public.users
for update
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
)
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can delete their company users" on public.users;
create policy "Users can delete their company users"
on public.users
for delete
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);


-- ----------------------------------------------------------------------------
-- orders: full access, limited to the user's company
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their company orders" on public.orders;
create policy "Users can view their company orders"
on public.orders
for select
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can insert their company orders" on public.orders;
create policy "Users can insert their company orders"
on public.orders
for insert
to authenticated
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can update their company orders" on public.orders;
create policy "Users can update their company orders"
on public.orders
for update
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
)
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can delete their company orders" on public.orders;
create policy "Users can delete their company orders"
on public.orders
for delete
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);


-- ----------------------------------------------------------------------------
-- order_items: read-only. There is no company_id column, so ownership is
-- checked through the parent order.
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their company order items" on public.order_items;
create policy "Users can view their company order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.company_id = (
        select company_id
        from public.profiles
        where id = (select auth.uid())
      )
  )
);

-- ----------------------------------------------------------------------------
-- ai_insights: full access, limited to the user's company
-- ----------------------------------------------------------------------------
drop policy if exists "Users can view their company AI insights" on public.ai_insights;
create policy "Users can view their company AI insights"
on public.ai_insights
for select
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can insert their company AI insights" on public.ai_insights;
create policy "Users can insert their company AI insights"
on public.ai_insights
for insert
to authenticated
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can update their company AI insights" on public.ai_insights;
create policy "Users can update their company AI insights"
on public.ai_insights
for update
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
)
with check (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists "Users can delete their company AI insights" on public.ai_insights;
create policy "Users can delete their company AI insights"
on public.ai_insights
for delete
to authenticated
using (
  company_id = (
    select company_id
    from public.profiles
    where id = (select auth.uid())
  )
);
