-- ============================================================================
-- AI Analytics Dashboard - database schema (tables)
-- ============================================================================
--
-- Run order for a fresh Supabase project:
--   1. schema.sql     (this file)   - tables
--   2. rls.sql                      - Row Level Security policies
--   3. functions.sql                - sign-up trigger + analytics functions
--
-- How to use
--   Supabase project -> SQL Editor -> paste this file -> Run.
--   Safe to re-run: every table uses "create table if not exists".
--
-- Data model
--
--   auth.users (Supabase Auth)
--        |
--        v 1:1
--   profiles ------> companies <------ every business table below
--                        ^
--                        |  (company_id)
--   products, customers, users, orders, ai_insights
--
--   orders -----> customers       (an order belongs to one customer)
--   order_items -> orders, products
--
-- Multi-tenancy
--   Every business table carries a company_id. RLS policies (rls.sql) make
--   sure a user only sees rows of the company stored in their profile.
--
-- Deleting data
--   Foreign keys are set up so that deleting a company deletes all of its data
--   (ON DELETE CASCADE). Two exceptions protect business data:
--     - orders.customer_id   -> SET NULL : deleting a customer keeps their orders
--     - order_items.product_id -> RESTRICT : a product that was ordered cannot
--                                            be deleted
--
-- Source
--   Columns, types, defaults, keys and constraints match the live database.
-- ============================================================================


-- Companies: one per sign-up (created by the handle_new_user trigger).
create table if not exists public.companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  industry   text,
  created_at timestamptz default now()
);

-- Profiles: one per auth user. Links a user to their company.
-- id is the same value as auth.users.id (no default on purpose).
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamptz default now(),
  company_id uuid references public.companies (id) on delete cascade
);

create table if not exists public.products (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name       text not null,
  category   text,
  price      numeric not null,
  created_at timestamptz default now()
);

create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name       text not null,
  email      text,
  country    text,
  created_at timestamptz default now()
);

-- Users of the company's own product (data shown in the "users" chart).
-- Not to be confused with auth.users (people who log in to this dashboard).
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name       text not null,
  email      text,
  created_at timestamptz not null default now()
);

-- status is restricted to the three values the frontend knows about.
-- This also protects the revenue functions, which filter on 'completed':
-- a typo like 'complete' would otherwise silently drop an order from the totals.
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies (id) on delete cascade,
  customer_id  uuid references public.customers (id) on delete set null,
  status       text not null default 'pending',
  total_amount numeric not null,
  created_at   timestamptz default now(),
  constraint orders_status_check
    check (status in ('pending', 'completed', 'cancelled'))
);

-- No company_id here: ownership goes through the parent order.
create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity   integer not null check (quantity > 0),
  unit_price numeric not null,
  created_at timestamptz default now()
);

create table if not exists public.ai_insights (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  type       text not null,
  title      text not null,
  content    text not null,
  created_at timestamptz default now()
);