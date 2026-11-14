-- ============================================================================
-- ReelMux Migration 0003: Security Hardening, Column Protection & Idempotent Billing
-- ============================================================================

-- 1. Protect sensitive columns on public.profiles from direct client-side PostgREST updates
create or replace function public.protect_profile_sensitive_columns()
returns trigger
language plpgsql
as $$
declare
  v_jwt_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
begin
  if v_jwt_role = 'service_role'
     or current_user in ('postgres', 'supabase_admin', 'service_role') then
    return new;
  end if;

  if new.balance_available is distinct from old.balance_available
     or new.balance_reserved is distinct from old.balance_reserved
     or new.plan_tier is distinct from old.plan_tier
     or new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.free_credits_granted is distinct from old.free_credits_granted
     or new.total_paid_cents is distinct from old.total_paid_cents
     or new.signup_ip is distinct from old.signup_ip
     or new.device_fingerprint is distinct from old.device_fingerprint then
    raise exception 'RESTRICTED_PROFILE_COLUMNS: Only server service_role may modify wallet, plan, role, or status fields';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_sensitive_columns on public.profiles;
create trigger trg_protect_profile_sensitive_columns
  before update on public.profiles
  for each row execute procedure public.protect_profile_sensitive_columns();

-- 2. Revoke direct public/authenticated RPC execution on security-definer wallet mutators
revoke execute on function public.reserve_credits_for_job(uuid, text, text, text, text, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.reserve_credits_for_job(uuid, text, text, text, text, jsonb, integer)
  to service_role;

revoke execute on function public.finalize_job_credits(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.finalize_job_credits(uuid, text, text, text, text)
  to service_role;

-- 3. Idempotent Waffo Webhook Event Deduplication Store (service_role only)
create table if not exists public.waffo_webhook_events (
  event_id text primary key,
  event_type text not null,
  order_no text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

alter table public.waffo_webhook_events enable row level security;

-- 4. Scoped API Keys for MCP & Agent Clients (stored hashed)
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Default MCP Key',
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default array['generation:create', 'generation:read'],
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_api_keys_user on public.api_keys (user_id);
alter table public.api_keys enable row level security;

drop policy if exists "Users can view own api keys" on public.api_keys;
create policy "Users can view own api keys"
  on public.api_keys for select
  using (auth.uid() = user_id);

-- 5. Allow users to view their own billing orders and uploads (read-only)
drop policy if exists "Users can view own billing orders" on public.billing_orders;
create policy "Users can view own billing orders"
  on public.billing_orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view own uploads" on public.media_uploads;
create policy "Users can view own uploads"
  on public.media_uploads for select
  using (auth.uid() = user_id);

-- 6. Atomic Order Settlement & Credit Grant RPC (service_role only)
create or replace function public.grant_credits_from_order(
  p_order_no text,
  p_user_id uuid default null,
  p_user_email text default null,
  p_item_type text default 'credit_pack',
  p_item_id text default 'creator-pack',
  p_item_name text default 'Creator Pack',
  p_amount_cents integer default 0,
  p_credits_granted integer default 0,
  p_payment_method text default 'Waffo Pancake',
  p_ip_address text default 'api.waffo.ai',
  p_next_plan_tier text default null
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_existing_status text;
  v_target_user_id uuid := p_user_id;
  v_new_balance integer;
  v_tx_type text;
begin
  select status, user_id
    into v_existing_status, v_target_user_id
  from public.billing_orders
  where order_no = p_order_no
  for update;

  if v_existing_status = 'paid' then
    return false; -- Already settled idempotently
  end if;

  if v_target_user_id is null then
    v_target_user_id := p_user_id;
  end if;

  if v_target_user_id is null and p_user_email is not null then
    select id into v_target_user_id
    from public.profiles
    where lower(email) = lower(p_user_email)
    order by created_at desc
    limit 1;
  end if;

  insert into public.billing_orders (
    order_no, user_id, user_email, item_type, item_id, item_name,
    amount_cents, credits_granted, status, payment_method, ip_address
  )
  values (
    p_order_no,
    v_target_user_id,
    coalesce(p_user_email, 'unknown@reelmux.com'),
    case when p_item_type = 'subscription' then 'subscription' else 'credit_pack' end,
    p_item_id,
    p_item_name,
    greatest(0, p_amount_cents),
    greatest(0, p_credits_granted),
    'paid',
    p_payment_method,
    p_ip_address
  )
  on conflict (order_no) do update
  set
    status = 'paid',
    user_id = coalesce(public.billing_orders.user_id, excluded.user_id),
    payment_method = excluded.payment_method,
    ip_address = excluded.ip_address;

  if v_target_user_id is not null and p_credits_granted > 0 then
    update public.profiles
    set
      balance_available = balance_available + p_credits_granted,
      total_paid_cents = total_paid_cents + greatest(0, p_amount_cents),
      plan_tier = coalesce(p_next_plan_tier, plan_tier),
      updated_at = now()
    where id = v_target_user_id
    returning balance_available into v_new_balance;

    if v_new_balance is not null then
      v_tx_type := case
        when p_item_type = 'subscription' then 'subscription_grant'
        else 'credit_pack_purchase'
      end;

      insert into public.credit_ledger (
        user_id, tx_type, delta_available, delta_reserved, balance_after, note
      )
      values (
        v_target_user_id,
        v_tx_type,
        p_credits_granted,
        0,
        v_new_balance,
        format('Order %s settled: %s (+%s credits)', p_order_no, p_item_name, p_credits_granted)
      );
    end if;
  end if;

  return true;
end;
$$;

revoke execute on function public.grant_credits_from_order(text, uuid, text, text, text, text, integer, integer, text, text, text)
  from public, anon, authenticated;
grant execute on function public.grant_credits_from_order(text, uuid, text, text, text, text, integer, integer, text, text, text)
  to service_role;
