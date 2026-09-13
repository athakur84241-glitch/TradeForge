create or replace function public.create_account_for_purchase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan public.challenge_plans;
begin
  select * into plan
  from public.challenge_plans
  where id = new.challenge_plan_id;

  if not found then
    raise exception 'Challenge plan not found for purchase';
  end if;

  insert into public.accounts (
    user_id,
    purchase_id,
    challenge_plan_id,
    account_name,
    account_size,
    status,
    phase,
    starting_balance,
    balance,
    equity,
    platform
  )
  values (
    new.user_id,
    new.id,
    new.challenge_plan_id,
    plan.name || ' ' || new.account_size,
    new.account_size,
    'funded_pending_integration',
    case when plan.phases = 0 then 'Funded' else 'Phase 1' end,
    0,
    0,
    0,
    'Not connected'
  )
  on conflict (purchase_id) do nothing;

  if not exists (select 1 from public.accounts where purchase_id = new.id) then
    raise exception 'Account provisioning did not create an account';
  end if;

  insert into public.notifications (user_id, category, title, description, href)
  values (
    new.user_id,
    'Account',
    'Payment verified; account provisioning pending',
    'Your purchase is active. A trading provider connection is required before broker account provisioning can complete.',
    '/accounts'
  );

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    new.user_id,
    'account_provisioning_pending',
    'account',
    (select id from public.accounts where purchase_id = new.id),
    jsonb_build_object('source', 'verified_purchase', 'purchase_id', new.id, 'provider', 'unconfigured')
  );
  return new;
end;
$$;

drop trigger if exists purchases_create_account on public.purchases;
create trigger purchases_create_account
after insert on public.purchases
for each row execute function public.create_account_for_purchase();