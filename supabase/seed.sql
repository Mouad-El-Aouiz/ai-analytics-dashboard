-- ============================================================================
-- AI Analytics Dashboard - demo data (seed)
-- ============================================================================
--
-- Run order for a fresh Supabase project:
--   1. schema.sql
--   2. rls.sql
--   3. functions.sql
--   4. seed.sql   (this file)
--
-- How to use
--   Supabase project -> SQL Editor -> paste this file -> Run.
--
-- What it does
--   Fills the FIRST company of the database with realistic demo data:
--   customers, products, users and 12 months of orders. The dashboard then
--   has something meaningful to display.
--
--   IMPORTANT: create an account first (via the app's /register page). The
--   sign-up trigger creates a company for that user, and this seed attaches
--   the demo data to that company.
--
-- Safe to re-run
--   The block only inserts data if the company has no orders yet. Running it
--   twice will not duplicate anything.
-- ============================================================================

do $$
declare
  v_company_id uuid;
  v_order_count integer;

  -- Demo customers: name, email, country
  v_customers constant text[][] := array[
    array['Alice Martin',    'alice@example.com',   'France'],
    array['Bruno Silva',     'bruno@example.com',   'Portugal'],
    array['Chloe Dubois',    'chloe@example.com',   'France'],
    array['Daniel Weber',    'daniel@example.com',  'Germany'],
    array['Emma Johnson',    'emma@example.com',    'United Kingdom'],
    array['Farid Hassan',    'farid@example.com',   'Morocco'],
    array['Grace Lee',       'grace@example.com',   'United States'],
    array['Hugo Rossi',      'hugo@example.com',    'Italy'],
    array['Ines Garcia',     'ines@example.com',    'Spain'],
    array['Youssef Amrani',  'youssef@example.com', 'Morocco']
  ];

  -- Demo products: name, category, price
  v_products constant text[][] := array[
    array['Wireless Mouse',     'Electronics', '29.90'],
    array['Mechanical Keyboard','Electronics', '89.00'],
    array['USB-C Hub',          'Electronics', '45.50'],
    array['Office Chair',       'Furniture',   '149.00'],
    array['Standing Desk',      'Furniture',   '329.00'],
    array['Notebook',           'Stationery',  '7.50'],
    array['Water Bottle',       'Accessories', '19.90'],
    array['Backpack',           'Accessories', '59.00']
  ];

  v_customer_id uuid;
  v_product_id uuid;
  v_order_id uuid;
  v_status text;
  v_amount numeric;
  v_quantity integer;
  v_created_at timestamptz;
  v_month integer;
  v_orders_this_month integer;
  i integer;
  j integer;
begin
  -- 1. Pick the first company (created by the sign-up trigger).
  select id into v_company_id from public.companies order by created_at asc limit 1;

  if v_company_id is null then
    raise notice 'No company found. Create an account in the app first, then run this seed.';
    return;
  end if;

  -- 2. Do nothing if the company already has orders (safe re-run).
  select count(*) into v_order_count from public.orders where company_id = v_company_id;

  if v_order_count > 0 then
    raise notice 'Company % already has orders. Seed skipped.', v_company_id;
    return;
  end if;

  -- 3. Customers.
  for j in 1..array_length(v_customers, 1) loop
    insert into public.customers (company_id, name, email, country)
    values (
      v_company_id,
      v_customers[j][1],
      v_customers[j][2],
      v_customers[j][3]
    );
  end loop;

  -- 4. Products.
  for j in 1..array_length(v_products, 1) loop
    insert into public.products (company_id, name, category, price)
    values (
      v_company_id,
      v_products[j][1],
      v_products[j][2],
      v_products[j][3]::numeric
    );
  end loop;

  -- 5. Product users (the company's own users, shown in the "users" chart).
  -- Two new users per month over the last 12 months.
  for v_month in 0..11 loop
    for i in 1..2 loop
      insert into public.users (company_id, name, email, created_at)
      values (
        v_company_id,
        'User ' || (v_month * 2 + i),
        'user' || (v_month * 2 + i) || '@example.com',
        now() - make_interval(months => (11 - v_month))
      );
    end loop;
  end loop;

  -- 6. Orders spread over the last 12 months, with a gentle upward trend.
  for v_month in 0..11 loop
    -- More orders in recent months (growth): 5, 6, 7 ... 16.
    v_orders_this_month := 5 + v_month;

    for i in 1..v_orders_this_month loop
      -- Random customer.
      select id into v_customer_id
      from public.customers
      where company_id = v_company_id
      order by random()
      limit 1;

      -- Random product and its price.
      select id, price into v_product_id, v_amount
      from public.products
      where company_id = v_company_id
      order by random()
      limit 1;

      -- Weighted status: mostly completed, some pending/cancelled.
      v_status := case
        when random() < 0.70 then 'completed'
        when random() < 0.85 then 'pending'
        else 'cancelled'
      end;

      -- Random day within the month.
      v_created_at :=
        date_trunc('month', now() - make_interval(months => (11 - v_month)))
        + make_interval(days => (floor(random() * 27))::int);

      -- Between 1 and 4 units of the product.
      v_quantity := 1 + floor(random() * 4)::int;

      insert into public.orders (
        company_id,
        customer_id,
        status,
        total_amount,
        created_at
      )
      values (
        v_company_id,
        v_customer_id,
        v_status,
        v_amount * v_quantity,
        v_created_at
      )
      returning id into v_order_id;

      -- Line item, so the product/category breakdowns have data.
      -- unit_price matches the product price at order time.
      insert into public.order_items (
        order_id,
        product_id,
        quantity,
        unit_price,
        created_at
      )
      values (
        v_order_id,
        v_product_id,
        v_quantity,
        v_amount,
        v_created_at
      );
    end loop;
  end loop;

  raise notice 'Seed completed for company %.', v_company_id;
end;
$$;