-- ============================================================================
-- AI Analytics Dashboard - database functions and triggers
-- ============================================================================
--
-- Run order for a fresh Supabase project:
--   1. schema.sql
--   2. rls.sql
--   3. functions.sql   (this file)
--   The tables must exist first: the analytics functions are checked against
--   them when they are created.
--
-- How to use
--   Supabase project -> SQL Editor -> paste this file -> Run.
--   Safe to re-run (idempotent).
--
-- What this file contains
--   1. Sign-up automation : creates a company + profile for every new user.
--   2. Analytics          : aggregations computed by the database, so the
--                           frontend receives a few numbers instead of
--                           downloading every row.
--
-- The analytics functions rely on RLS (rls.sql) to keep each company's data
-- isolated (see "security invoker" below).
-- ============================================================================


-- ============================================================================
-- 1. SIGN-UP AUTOMATION
-- ============================================================================

-- Runs every time a user signs up.
-- Creates a company for the new user, then a profile linked to that company.
--
-- "security definer": runs with the rights of the function owner, because a
-- brand new user is not allowed to insert into these tables yet.
-- "set search_path = public": protects a security definer function from
-- being hijacked through a malicious search_path.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
begin

  -- 1. Create a company for the new user
  insert into public.companies (name)
  values (
    coalesce(
      new.raw_user_meta_data->>'full_name',
      'My Company'
    ) || '''s Company'
  )
  returning id into new_company_id;

  -- 2. Create the user's profile
  insert into public.profiles (
    id,
    full_name,
    company_id
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new_company_id
  );

  return new;
end;
$$;

-- Calls the function above after each new row in auth.users.
-- "drop ... if exists" first, so this file can be re-run without errors.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================================
-- 2. ANALYTICS
-- ============================================================================
--
-- All functions below use "security invoker": they run with the rights of the
-- logged-in user, so Row Level Security still applies. With "security definer"
-- they would bypass RLS and could expose another company's data.

-- Total revenue of a company (completed orders only).
-- coalesce(..., 0): the sum of zero rows is NULL, not 0.
create or replace function public.get_total_revenue(p_company_id uuid)
returns numeric
language sql
stable
security invoker
as $$
  select coalesce(sum(total_amount), 0)
  from public.orders
  where company_id = p_company_id
    and status = 'completed';
$$;

-- Revenue per month (completed orders only).
-- Months are returned as 'YYYY-MM' so Jan 2025 and Jan 2026 stay separate.
-- The column names below are a contract with the frontend
-- (analyticsService.ts reads row.month and row.revenue).
create or replace function public.get_monthly_revenue(p_company_id uuid)
returns table (month text, revenue numeric)
language sql
stable
security invoker
as $$
  select
    to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
    sum(total_amount) as revenue
  from public.orders
  where company_id = p_company_id
    and status = 'completed'
  group by 1
  order by 1;
$$;

-- New users per month.
-- Frontend contract: row.month and row.users.
create or replace function public.get_monthly_users(p_company_id uuid)
returns table (month text, users bigint)
language sql
stable
security invoker
as $$
  select
    to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
    count(*) as users
  from public.users
  where company_id = p_company_id
  group by 1
  order by 1;
$$;
