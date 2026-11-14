-- ============================================================================
-- ReelMux (https://reelmux.com) Migration 0002:
-- Admin Console, Signup Anti-Abuse (IP & Device Fingerprint), Uploads, Orders & Audit Log
-- ============================================================================

-- 1. Extend profiles with anti-abuse & admin governance fields
alter table public.profiles
  add column if not exists role text not null default 'user' check (role in ('user', 'admin')),
  add column if not exists status text not null default 'active' check (status in ('active', 'flagged', 'banned')),
  add column if not exists signup_ip text,
  add column if not exists device_fingerprint text,
  add column if not exists free_credits_granted boolean not null default true,
  add column if not exists total_paid_cents integer not null default 0;

create index if not exists idx_profiles_signup_ip on public.profiles (signup_ip) where signup_ip is not null;
create index if not exists idx_profiles_device_fingerprint on public.profiles (device_fingerprint) where device_fingerprint is not null;
create index if not exists idx_profiles_created_at on public.profiles (created_at desc);

-- 2. Signup Events & Anti-Abuse Signal Tracking Table
-- Tracks all account signups (including OAuth / magic-link / guest trials) for the Admin "Signup abuse" view
create table if not exists public.signup_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  signup_ip text not null,
  device_fingerprint text not null,
  free_credits_granted boolean not null default false,
  is_paid boolean not null default false,
  status text not null default 'active' check (status in ('active', 'flagged', 'blocked')),
  created_at timestamptz not null default now()
);

create index if not exists idx_signup_events_ip_created on public.signup_events (signup_ip, created_at desc);
create index if not exists idx_signup_events_fp_created on public.signup_events (device_fingerprint, created_at desc);
create index if not exists idx_signup_events_email on public.signup_events (email);

alter table public.signup_events enable row level security;

-- 3. Blocked Abuse Signals (IPs & Device Fingerprints)
create table if not exists public.abuse_blocks (
  id uuid primary key default gen_random_uuid(),
  signal_type text not null check (signal_type in ('ip', 'fingerprint')),
  signal_key text not null,
  reason text,
  blocked_by text not null default 'admin',
  created_at timestamptz not null default now(),
  unique (signal_type, signal_key)
);

alter table public.abuse_blocks enable row level security;

-- 4. Media Uploads Table (Admin -> Content -> Uploads)
create table if not exists public.media_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  user_email text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  storage_url text not null,
  tool_slug text not null default 'image-to-video',
  moderation_status text not null default 'approved' check (moderation_status in ('approved', 'flagged', 'quarantined')),
  created_at timestamptz not null default now()
);

create index if not exists idx_media_uploads_created on public.media_uploads (created_at desc);
alter table public.media_uploads enable row level security;

-- 5. Billing Orders Table (Admin -> Accounts -> Orders)
create table if not exists public.billing_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  user_email text not null,
  item_type text not null check (item_type in ('credit_pack', 'subscription')),
  item_id text not null,
  item_name text not null,
  amount_cents integer not null check (amount_cents >= 0),
  credits_granted integer not null check (credits_granted >= 0),
  status text not null default 'paid' check (status in ('paid', 'refunded', 'pending', 'disputed')),
  payment_method text not null default 'card',
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_billing_orders_created on public.billing_orders (created_at desc);
alter table public.billing_orders enable row level security;

-- 6. System Audit Log (Admin -> System -> Audit log)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created on public.audit_logs (created_at desc);
alter table public.audit_logs enable row level security;

-- 7. Update handle_new_user() trigger with Anti-Abuse IP / Fingerprint Check
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_ip text;
  v_fp text;
  v_prior_grants integer := 0;
  v_is_blocked boolean := false;
  v_grant_credits boolean := true;
  v_initial_credits integer := 100;
begin
  v_ip := coalesce(new.raw_user_meta_data->>'signup_ip', '0.0.0.0');
  v_fp := coalesce(new.raw_user_meta_data->>'device_fingerprint', encode(gen_random_bytes(16), 'hex'));

  select exists(
    select 1 from public.abuse_blocks
    where (signal_type = 'ip' and signal_key = v_ip)
       or (signal_type = 'fingerprint' and signal_key = v_fp)
  ) into v_is_blocked;

  if v_ip <> '0.0.0.0' then
    select count(*) into v_prior_grants
    from public.signup_events
    where (signup_ip = v_ip or device_fingerprint = v_fp)
      and free_credits_granted = true
      and created_at >= now() - interval '7 days';
  end if;

  if v_is_blocked or v_prior_grants >= 1 then
    v_grant_credits := false;
    v_initial_credits := 0;
  end if;

  insert into public.profiles (
    id, email, display_name, balance_available, balance_reserved,
    signup_ip, device_fingerprint, free_credits_granted, status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_initial_credits,
    0,
    v_ip,
    v_fp,
    v_grant_credits,
    case when v_is_blocked then 'flagged' else 'active' end
  );

  insert into public.signup_events (
    user_id, email, signup_ip, device_fingerprint, free_credits_granted, is_paid, status
  )
  values (
    new.id,
    coalesce(new.email, 'unknown@reelmux.com'),
    v_ip,
    v_fp,
    v_grant_credits,
    false,
    case when not v_grant_credits then 'flagged' else 'active' end
  );

  if v_grant_credits then
    insert into public.credit_ledger (user_id, tx_type, delta_available, delta_reserved, balance_after, note)
    values (
      new.id,
      'signup_bonus',
      100,
      0,
      100,
      'Welcome to ReelMux: 100 free trial credits (no card needed)'
    );
  else
    insert into public.audit_logs (actor_email, action, target_type, target_id, details, ip_address)
    values (
      'system@reelmux.com',
      'signup.grant_withheld_abuse',
      'user',
      coalesce(new.email, new.id::text),
      jsonb_build_object('signup_ip', v_ip, 'device_fingerprint', v_fp, 'prior_grants_7d', v_prior_grants),
      v_ip
    );
  end if;

  return new;
end;
$$;
