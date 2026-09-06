create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_plan_id uuid not null references public.challenge_plans(id),
  account_size integer not null check (account_size in (5000, 10000, 25000, 50000, 100000)),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD' check (currency = 'USD'),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

create policy "Users can read their own orders"
  on public.orders
  for select
  using (user_id = auth.uid());

create policy "Users can create their own pending orders"
  on public.orders
  for insert
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and currency = 'USD'
    and exists (
      select 1
      from public.challenge_plans as plans
      where plans.id = orders.challenge_plan_id
        and plans.is_active = true
        and plans.account_size = orders.account_size
        and plans.price_cents = orders.amount_cents
        and plans.currency = orders.currency
    )
  );