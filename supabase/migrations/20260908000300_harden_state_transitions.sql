create or replace function public.admin_set_payout_status(target_id uuid, next_status text, settlement_reference text default null)
returns public.payout_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.payout_requests;
  current_status text;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;

  select status into current_status from public.payout_requests where id = target_id for update;
  if current_status is null then raise exception 'Payout request not found'; end if;
  if next_status not in ('approved', 'processing', 'paid', 'rejected', 'cancelled') then
    raise exception 'Invalid payout transition';
  end if;
  if not (
    (current_status = 'pending' and next_status in ('approved', 'rejected', 'cancelled'))
    or (current_status = 'approved' and next_status in ('processing', 'rejected', 'cancelled'))
    or (current_status = 'processing' and next_status in ('paid', 'rejected', 'cancelled'))
  ) then
    raise exception 'Payout status transition is not allowed';
  end if;
  if next_status = 'paid' and nullif(trim(settlement_reference), '') is null then
    raise exception 'Settlement reference is required before marking a payout paid';
  end if;

  update public.payout_requests
  set status = next_status,
      processing_reference = coalesce(nullif(trim(settlement_reference), ''), processing_reference),
      approved_amount = case when next_status = 'approved' then requested_amount else approved_amount end,
      processed_at = case when next_status in ('paid', 'rejected', 'cancelled') then now() else processed_at end,
      updated_at = now()
  where id = target_id
  returning * into result;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'payout_' || next_status, 'payout_request', target_id,
      jsonb_build_object('reference', settlement_reference, 'previous_status', current_status));
  insert into public.notifications (user_id, category, title, description, href)
    values (result.user_id, 'Payout', 'Payout ' || next_status,
      'Your payout request status is now ' || next_status || '.', '/payouts');
  return result;
end;
$$;

revoke execute on function public.admin_set_payout_status(uuid, text, text) from public, anon, authenticated;
grant execute on function public.admin_set_payout_status(uuid, text, text) to authenticated;

create or replace function public.cancel_user_order(target_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare result public.orders;
begin
  update public.orders
  set status = 'cancelled', updated_at = now()
  where id = target_order_id
    and user_id = auth.uid()
    and status in ('pending', 'payment_pending')
  returning * into result;
  if result.id is null then raise exception 'Order cannot be cancelled'; end if;
  return result;
end;
$$;

grant execute on function public.cancel_user_order(uuid) to authenticated;
