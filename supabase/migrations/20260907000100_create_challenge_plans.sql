create table public.challenge_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text not null,
  account_size integer not null check (account_size in (5000, 10000, 25000, 50000, 100000)),
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'USD' check (currency = 'USD'),
  phases smallint not null check (phases in (0, 1, 2)),
  profit_target text not null,
  profit_split smallint check (profit_split between 0 and 100),
  daily_loss text not null,
  overall_loss text not null,
  minimum_trading_days smallint check (minimum_trading_days >= 0),
  payout_frequency text not null,
  trailing_drawdown text,
  payout_eligibility text,
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, account_size)
);

create index challenge_plans_active_order_idx
  on public.challenge_plans (is_active, sort_order, account_size);

create index challenge_plans_slug_size_idx
  on public.challenge_plans (slug, account_size);

alter table public.challenge_plans enable row level security;

create policy "Anyone can read active challenge plans"
  on public.challenge_plans
  for select
  using (is_active = true);

insert into public.challenge_plans (
  slug, name, description, account_size, price_cents, phases,
  profit_target, profit_split, daily_loss, overall_loss,
  minimum_trading_days, payout_frequency, trailing_drawdown,
  payout_eligibility, sort_order
)
select
  'one-step', '1-Step', 'A single evaluation stage with clear objectives and transparent risk limits.',
  size, price, 1, '10%', 80, '5%', '10%', 3, 'Weekly', null, null, 1
from (values
  (5000, 5900), (10000, 10900), (25000, 19900), (50000, 35900), (100000, 49800)
) as one_step(size, price)
union all
select
  'two-step', '2-Step', 'A measured two-stage evaluation with a second verification phase.',
  size, price, 2, '8% / 5%', 80, '6%', '10%', 3, 'Weekly', null, null, 2
from (values
  (5000, 3300), (10000, 6900), (25000, 15500), (50000, 25900), (100000, 47900)
) as two_step(size, price)
union all
select
  'instant-funding', 'Instant Funding', 'Direct access to funded capital with no evaluation phase.',
  size, price, 0, 'None', 90, '4%', '8%', 0, 'Bi-weekly', '3%', 'After 2% profit', 3
from (values
  (5000, 6600), (10000, 13400), (25000, 24900), (50000, 42400), (100000, 82900)
) as instant_funding(size, price);