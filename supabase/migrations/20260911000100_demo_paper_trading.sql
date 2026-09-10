do $$
begin
  if not exists (
    select 1
    from pg_class as relation
    join pg_namespace as namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'accounts_user_id_id_unique'
  ) then
    alter table public.accounts
      add constraint accounts_user_id_id_unique unique (user_id, id);
  end if;
end
$$;

create table if not exists public.demo_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  symbol text not null default 'TFX/USD',
  side text not null check (side in ('buy', 'sell')),
  quantity numeric(38, 8) not null check (quantity > 0),
  entry_price numeric(38, 8) not null check (entry_price > 0),
  current_price numeric(38, 8) not null check (current_price > 0),
  stop_loss numeric(38, 8),
  take_profit numeric(38, 8),
  unrealized_pnl numeric(38, 8) not null default 0,
  status text not null default 'open' check (status in ('open', 'closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  close_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint demo_positions_user_account_fk foreign key (user_id, account_id) references public.accounts(user_id, id)
);

create index if not exists demo_positions_user_account_idx on public.demo_positions (user_id, account_id, status, opened_at desc);

alter table public.demo_positions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'demo_positions'
      and policyname = 'Users can read their own demo positions'
  ) then
    create policy "Users can read their own demo positions"
      on public.demo_positions for select using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'demo_positions'
      and policyname = 'Users can create their own demo positions'
  ) then
    create policy "Users can create their own demo positions"
      on public.demo_positions for insert with check (
        user_id = auth.uid()
        and exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'demo_positions'
      and policyname = 'Users can update their own demo positions'
  ) then
    create policy "Users can update their own demo positions"
      on public.demo_positions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'demo_positions'
      and policyname = 'Users can delete their own demo positions'
  ) then
    create policy "Users can delete their own demo positions"
      on public.demo_positions for delete using (user_id = auth.uid());
  end if;
end
$$;
