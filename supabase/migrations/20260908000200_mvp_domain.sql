create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  first_name text,
  last_name text,
  phone text,
  country text,
  timezone text,
  language text default 'English (UK)',
  role text not null default 'trader' check (role in ('trader', 'admin')),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists timezone text;
alter table public.profiles add column if not exists language text default 'English (UK)';
alter table public.profiles add column if not exists role text default 'trader';
alter table public.profiles add column if not exists preferences jsonb default '{}'::jsonb;
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (id = auth.uid());
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purchase_id uuid not null unique references public.purchases(id),
  challenge_plan_id uuid not null references public.challenge_plans(id),
  account_name text not null,
  account_size integer not null check (account_size > 0),
  status text not null default 'active' check (status in ('active', 'passed', 'failed', 'funded', 'suspended', 'closed', 'funded_pending_integration')),
  phase text not null default 'Phase 1',
  starting_balance numeric(78, 18) not null,
  balance numeric(78, 18) not null,
  equity numeric(78, 18) not null,
  pnl numeric(78, 18) not null default 0,
  pnl_percent numeric(78, 18) not null default 0,
  platform text not null default 'Not connected',
  provider_account_id text,
  last_activity timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts add column if not exists purchase_id uuid references public.purchases(id);
alter table public.accounts add column if not exists challenge_plan_id uuid references public.challenge_plans(id);
alter table public.accounts add column if not exists starting_balance numeric(78, 18);
alter table public.accounts add column if not exists provider_account_id text;
alter table public.accounts add column if not exists last_activity timestamptz;
alter table public.accounts add column if not exists updated_at timestamptz default now();

create unique index if not exists accounts_purchase_id_idx on public.accounts (purchase_id) where purchase_id is not null;
create index if not exists accounts_user_status_idx on public.accounts (user_id, status);
alter table public.accounts enable row level security;
drop policy if exists "Users can read their own accounts" on public.accounts;
create policy "Users can read their own accounts" on public.accounts for select using (user_id = auth.uid());

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  provider text not null,
  external_trade_id text not null,
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  volume numeric(78, 18) not null check (volume > 0),
  entry_price numeric(78, 18) not null,
  exit_price numeric(78, 18),
  profit numeric(78, 18) not null default 0,
  commission numeric(78, 18) not null default 0,
  swap numeric(78, 18) not null default 0,
  opened_at timestamptz not null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, external_trade_id)
);
create index if not exists trades_account_closed_idx on public.trades (account_id, closed_at desc);
alter table public.trades enable row level security;
create policy "Users can read own trades" on public.trades for select using (exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()));

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  provider text not null,
  external_position_id text not null,
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  volume numeric(78, 18) not null,
  entry_price numeric(78, 18) not null,
  current_price numeric(78, 18),
  unrealized_profit numeric(78, 18) not null default 0,
  opened_at timestamptz not null,
  updated_at timestamptz not null default now(),
  unique (provider, external_position_id)
);
alter table public.positions enable row level security;
create policy "Users can read own positions" on public.positions for select using (exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()));

create table if not exists public.daily_account_metrics (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  metric_date date not null,
  starting_equity numeric(78, 18) not null,
  ending_equity numeric(78, 18) not null,
  daily_pnl numeric(78, 18) not null default 0,
  daily_loss_used numeric(78, 18) not null default 0,
  overall_loss_used numeric(78, 18) not null default 0,
  trading_day boolean not null default false,
  breach_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, metric_date)
);
alter table public.daily_account_metrics enable row level security;
create policy "Users can read own daily metrics" on public.daily_account_metrics for select using (exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()));

create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id),
  requested_amount numeric(78, 18) not null check (requested_amount > 0),
  approved_amount numeric(78, 18),
  method text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'processing', 'paid', 'rejected', 'cancelled')),
  note text,
  processing_reference text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.payout_requests add column if not exists requested_amount numeric(78, 18);
alter table public.payout_requests add column if not exists approved_amount numeric(78, 18);
alter table public.payout_requests add column if not exists processing_reference text;
alter table public.payout_requests add column if not exists updated_at timestamptz default now();
create index if not exists payout_requests_user_idx on public.payout_requests (user_id, requested_at desc);
alter table public.payout_requests enable row level security;
create policy "Users can read own payout requests" on public.payout_requests for select using (user_id = auth.uid());
revoke insert, update, delete on public.payout_requests from anon, authenticated;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('Account', 'Rule alert', 'Payout', 'Challenge', 'System')),
  title text not null,
  description text not null,
  href text not null default '/',
  unread boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
create policy "Users can read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users can mark own notifications read" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
alter table public.audit_logs enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.create_account_for_purchase()
returns trigger language plpgsql security definer set search_path = public
as $$
declare plan public.challenge_plans;
begin
  select * into plan from public.challenge_plans where id = new.challenge_plan_id;
  insert into public.accounts (user_id, purchase_id, challenge_plan_id, account_name, account_size, status, phase, starting_balance, balance, equity, platform)
    values (new.user_id, new.id, new.challenge_plan_id, plan.name || ' ' || new.account_size, new.account_size, 'active', 'Phase 1', new.account_size, new.account_size, new.account_size, 'Not connected')
    on conflict (purchase_id) do nothing;
  insert into public.notifications (user_id, category, title, description, href)
    values (new.user_id, 'Account', 'Challenge account created', 'Your entitlement is ready. Trading integration is not connected yet.', '/accounts');
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
    values (new.user_id, 'account_created', 'account', new.id, jsonb_build_object('source', 'purchase_activation'));
  return new;
end;
$$;

drop trigger if exists purchases_create_account on public.purchases;
create trigger purchases_create_account after insert on public.purchases for each row execute function public.create_account_for_purchase();

create or replace function public.record_paid_order_event()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if old.status is distinct from 'paid' and new.status = 'paid' then
    insert into public.notifications (user_id, category, title, description, href)
      values (new.user_id, 'Challenge', 'Payment received', 'Your verified payment was received and your challenge entitlement is active.', '/accounts');
    insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
      values (new.user_id, 'payment_verified', 'order', new.id, jsonb_build_object('transaction_hash', new.transaction_hash, 'payment_method', new.payment_method));
  end if;
  return new;
end;
$$;

drop trigger if exists orders_record_paid_event on public.orders;
create trigger orders_record_paid_event after update of status on public.orders for each row execute function public.record_paid_order_event();

create or replace function public.request_payout(target_account_id uuid, requested numeric, payout_method text)
returns public.payout_requests language plpgsql security definer set search_path = public
as $$
declare account_row public.accounts; result public.payout_requests; available numeric;
begin
  select * into account_row from public.accounts where id = target_account_id and user_id = auth.uid() for update;
  if not found then raise exception 'Account not found'; end if;
  if account_row.status <> 'funded' then raise exception 'Only funded accounts can request payouts'; end if;
  available := greatest(0, account_row.equity - account_row.starting_balance);
  if requested < 100 or requested > available then raise exception 'Requested payout exceeds available eligible profit'; end if;
  if exists (select 1 from public.payout_requests where account_id = account_row.id and status in ('pending', 'approved', 'processing')) then raise exception 'A payout request is already pending'; end if;
  insert into public.payout_requests (user_id, account_id, requested_amount, method, status, note)
    values (auth.uid(), account_row.id, requested, payout_method, 'pending', 'Awaiting administrative review') returning * into result;
  insert into public.notifications (user_id, category, title, description, href)
    values (auth.uid(), 'Payout', 'Payout requested', 'Your payout request is pending administrative review.', '/payouts');
  return result;
end;
$$;
grant execute on function public.request_payout(uuid, numeric, text) to authenticated;

create or replace function public.admin_set_payout_status(target_id uuid, next_status text, settlement_reference text default null)
returns public.payout_requests language plpgsql security definer set search_path = public
as $$
declare result public.payout_requests;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if next_status not in ('approved', 'processing', 'paid', 'rejected', 'cancelled') then raise exception 'Invalid payout transition'; end if;
  update public.payout_requests set status = next_status, processing_reference = coalesce(settlement_reference, processing_reference), processed_at = case when next_status in ('paid', 'rejected', 'cancelled') then now() else processed_at end, updated_at = now() where id = target_id returning * into result;
  if result.id is null then raise exception 'Payout request not found'; end if;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata) values (auth.uid(), 'payout_' || next_status, 'payout_request', target_id, jsonb_build_object('reference', settlement_reference));
  insert into public.notifications (user_id, category, title, description, href) values (result.user_id, 'Payout', 'Payout ' || next_status, 'Your payout request status is now ' || next_status || '.', '/payouts');
  return result;
end;
$$;
revoke execute on function public.admin_set_payout_status(uuid, text, text) from public, anon, authenticated;
grant execute on function public.admin_set_payout_status(uuid, text, text) to authenticated;