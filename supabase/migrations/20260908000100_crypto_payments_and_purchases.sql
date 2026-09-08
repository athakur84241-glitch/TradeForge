alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'payment_pending', 'paid', 'failed', 'cancelled', 'expired'));

alter table public.orders
  add column if not exists payment_provider text,
  add column if not exists payment_method text,
  add column if not exists payment_network text,
  add column if not exists payment_address text,
  add column if not exists expected_amount numeric(78, 18),
  add column if not exists expected_amount_atomic numeric(78, 0),
  add column if not exists exchange_rate numeric(78, 18),
  add column if not exists rate_timestamp timestamptz,
  add column if not exists payment_reference text,
  add column if not exists transaction_hash text,
  add column if not exists payment_expires_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists failure_reason text;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('USDT_TRON', 'USDT_ERC20', 'USDC_ERC20', 'SOL_SOLANA')),
  add constraint orders_payment_amount_check
  check (expected_amount is null or expected_amount > 0),
  add constraint orders_payment_atomic_check
  check (expected_amount_atomic is null or expected_amount_atomic > 0);

create unique index if not exists orders_payment_reference_idx
  on public.orders (payment_reference) where payment_reference is not null;

create unique index if not exists orders_transaction_hash_idx
  on public.orders (transaction_hash) where transaction_hash is not null;

create index if not exists orders_payment_status_idx
  on public.orders (status, payment_expires_at);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id),
  challenge_plan_id uuid not null references public.challenge_plans(id),
  account_size integer not null check (account_size > 0),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null check (currency = 'USD'),
  status text not null default 'active' check (status in ('active', 'cancelled')),
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id)
);

create index purchases_user_id_idx on public.purchases (user_id, created_at desc);

alter table public.purchases enable row level security;

create policy "Users can read their own purchases"
  on public.purchases for select using (user_id = auth.uid());

revoke insert, update, delete on public.orders from anon, authenticated;
revoke insert, update, delete on public.purchases from anon, authenticated;

create or replace function public.create_pending_order(plan_id uuid)
returns setof public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  plan public.challenge_plans;
  existing public.orders;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into plan from public.challenge_plans
    where id = plan_id and is_active = true;
  if not found then raise exception 'Challenge plan is unavailable'; end if;

  select * into existing from public.orders
    where user_id = current_user_id
      and challenge_plan_id = plan.id
      and status in ('pending', 'payment_pending')
      and (payment_expires_at is null or payment_expires_at > now())
    order by created_at desc limit 1;
  if found then return next existing; return; end if;

  return query insert into public.orders (user_id, challenge_plan_id, account_size, amount_cents, currency)
    values (current_user_id, plan.id, plan.account_size, plan.price_cents, plan.currency)
    returning *;
end;
$$;

grant execute on function public.create_pending_order(uuid) to authenticated;

create or replace function public.activate_verified_crypto_payment(
  target_order_id uuid,
  verified_method text,
  verified_network text,
  verified_address text,
  verified_amount_atomic numeric,
  verified_transaction_hash text,
  verified_payment_reference text
)
returns public.purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders;
  created_purchase public.purchases;
begin
  select * into target_order from public.orders where id = target_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if target_order.status = 'paid' then
    select * into created_purchase from public.purchases where order_id = target_order.id;
    return created_purchase;
  end if;
  if target_order.status <> 'payment_pending' then raise exception 'Order is not payable'; end if;
  if target_order.payment_expires_at is not null and target_order.payment_expires_at <= now() then
    update public.orders set status = 'expired', updated_at = now() where id = target_order.id;
    raise exception 'Payment window expired';
  end if;
  if target_order.payment_method <> verified_method
    or target_order.payment_network <> verified_network
    or target_order.payment_address <> verified_address
    or target_order.payment_reference <> verified_payment_reference
    or verified_amount_atomic < target_order.expected_amount_atomic
    then raise exception 'Verified payment does not match order';
  end if;
  if exists (select 1 from public.orders where transaction_hash = verified_transaction_hash) then
    raise exception 'Transaction has already been used';
  end if;

  update public.orders set
    status = 'paid', transaction_hash = verified_transaction_hash, paid_at = now(), updated_at = now()
    where id = target_order.id;

  insert into public.purchases (user_id, order_id, challenge_plan_id, account_size, amount_cents, currency)
    values (target_order.user_id, target_order.id, target_order.challenge_plan_id,
      target_order.account_size, target_order.amount_cents, target_order.currency)
    on conflict (order_id) do nothing
    returning * into created_purchase;
  if created_purchase.id is null then
    select * into created_purchase from public.purchases where order_id = target_order.id;
  end if;
  return created_purchase;
end;
$$;

revoke execute on function public.activate_verified_crypto_payment(uuid, text, text, text, numeric, text, text) from public, anon, authenticated;
grant execute on function public.activate_verified_crypto_payment(uuid, text, text, text, numeric, text, text) to service_role;