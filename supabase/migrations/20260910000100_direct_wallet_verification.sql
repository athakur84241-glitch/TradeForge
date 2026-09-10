alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('USDT_TRC20', 'USDT_ERC20', 'USDT_SOLANA', 'USDC_ERC20', 'SOL_SOLANA'));

alter table public.orders
  add column if not exists detected_amount_atomic numeric(78, 0),
  add column if not exists detected_address text,
  add column if not exists detected_network text,
  add column if not exists confirmation_count integer,
  add column if not exists verification_provider text,
  add column if not exists verified_at timestamptz,
  add column if not exists verification_metadata jsonb not null default '{}'::jsonb,
  add column if not exists payment_transaction_hint text;
  
alter table public.orders
  add column if not exists payment_token_address text;

alter table public.orders
  add constraint orders_detected_amount_atomic_check
  check (detected_amount_atomic is null or detected_amount_atomic > 0),
  add constraint orders_confirmation_count_check
  check (confirmation_count is null or confirmation_count >= 0);

create or replace function public.activate_verified_crypto_payment(
  target_order_id uuid,
  verified_method text,
  verified_network text,
  verified_address text,
  verified_amount_atomic numeric,
  verified_transaction_hash text,
  verified_payment_reference text,
  verified_confirmation_count integer,
  verified_provider text,
  verified_metadata jsonb default '{}'::jsonb
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
  if nullif(trim(verified_transaction_hash), '') is null then raise exception 'Transaction hash is required'; end if;
  if verified_confirmation_count < 0 then raise exception 'Invalid confirmation count'; end if;
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
    status = 'paid',
    transaction_hash = verified_transaction_hash,
    detected_amount_atomic = verified_amount_atomic,
    detected_address = verified_address,
    detected_network = verified_network,
    confirmation_count = verified_confirmation_count,
    verification_provider = verified_provider,
    verified_at = now(),
    verification_metadata = coalesce(verified_metadata, '{}'::jsonb),
    paid_at = now(),
    updated_at = now()
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

revoke execute on function public.activate_verified_crypto_payment(uuid, text, text, text, numeric, text, text, integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.activate_verified_crypto_payment(uuid, text, text, text, numeric, text, text, integer, text, jsonb) to service_role;
revoke execute on function public.activate_verified_crypto_payment(uuid, text, text, text, numeric, text, text) from public, anon, authenticated, service_role;
