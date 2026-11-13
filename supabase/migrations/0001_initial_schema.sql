-- ============================================================================
-- ReelMux (https://reelmux.com) Supabase Schema & Atomic Credit Ledger
-- Implements:
--   1. Automatic 100 Free Credits on User Signup
--   2. Atomic Credit Reservation (Hold before Yir.ai job dispatch)
--   3. Automatic Settlement on Success or Instant Refund on Failed Jobs
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. User Profiles & Credit Wallet
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'starter', 'creator', 'studio', 'pro_monthly', 'pro_yearly')),
  balance_available integer not null default 100 check (balance_available >= 0),
  balance_reserved integer not null default 0 check (balance_reserved >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile metadata"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. Credit Ledger (Immutable Audit Trail)
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid,
  tx_type text not null check (tx_type in (
    'signup_bonus',
    'job_reserve',
    'job_settle',
    'job_refund',
    'credit_pack_purchase',
    'subscription_grant'
  )),
  delta_available integer not null,
  delta_reserved integer not null default 0,
  balance_after integer not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.credit_ledger enable row level security;

create policy "Users can view own credit ledger"
  on public.credit_ledger for select
  using (auth.uid() = user_id);

-- 3. Multimodal Generation Jobs (Mapped to Yir.ai /v1/jobs)
create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  yir_job_id text unique,
  tool_slug text not null,
  category text not null check (category in ('video', 'image', 'audio', 'effect')),
  model_id text not null,
  prompt text not null,
  parameters jsonb not null default '{}'::jsonb,
  input_media_urls text[] default array[]::text[],
  credits_cost integer not null check (credits_cost >= 0),
  status text not null default 'queued' check (status in ('queued', 'processing', 'succeeded', 'failed', 'canceled')),
  credit_settled boolean not null default false,
  source_output_url text,
  r2_persisted_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.generation_jobs enable row level security;

create policy "Users can view own generation jobs"
  on public.generation_jobs for select
  using (auth.uid() = user_id);

-- 4. Trigger: Grant 100 Free Credits on New User Registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, balance_available, balance_reserved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    100,
    0
  );

  insert into public.credit_ledger (user_id, tx_type, delta_available, delta_reserved, balance_after, note)
  values (
    new.id,
    'signup_bonus',
    100,
    0,
    100,
    'Welcome to ReelMux: 100 free trial credits (no card needed)'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Atomic RPC: Reserve Credits & Create Generation Job
create or replace function public.reserve_credits_for_job(
  p_user_id uuid,
  p_tool_slug text,
  p_category text,
  p_model_id text,
  p_prompt text,
  p_parameters jsonb,
  p_credits_cost integer
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_available integer;
  v_job_id uuid;
begin
  select balance_available into v_available
  from public.profiles
  where id = p_user_id
  for update;

  if v_available is null then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  if v_available < p_credits_cost then
    raise exception 'INSUFFICIENT_CREDITS: Available %, required %', v_available, p_credits_cost;
  end if;

  update public.profiles
  set
    balance_available = balance_available - p_credits_cost,
    balance_reserved = balance_reserved + p_credits_cost,
    updated_at = now()
  where id = p_user_id;

  insert into public.generation_jobs (
    user_id, tool_slug, category, model_id, prompt, parameters, credits_cost, status
  )
  values (
    p_user_id, p_tool_slug, p_category, p_model_id, p_prompt, p_parameters, p_credits_cost, 'queued'
  )
  returning id into v_job_id;

  insert into public.credit_ledger (
    user_id, job_id, tx_type, delta_available, delta_reserved, balance_after, note
  )
  values (
    p_user_id,
    v_job_id,
    'job_reserve',
    -p_credits_cost,
    p_credits_cost,
    v_available - p_credits_cost,
    format('Reserved %s credits for %s (%s)', p_credits_cost, p_model_id, p_tool_slug)
  );

  return v_job_id;
end;
$$;

-- 6. Atomic RPC: Settle or Auto-Refund Credits on Job Completion
create or replace function public.finalize_job_credits(
  p_job_id uuid,
  p_final_status text,
  p_source_url text default null,
  p_r2_url text default null,
  p_error text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_job public.generation_jobs%rowtype;
  v_new_available integer;
begin
  select * into v_job
  from public.generation_jobs
  where id = p_job_id
  for update;

  if not found or v_job.credit_settled then
    return;
  end if;

  if p_final_status = 'succeeded' then
    update public.profiles
    set
      balance_reserved = greatest(0, balance_reserved - v_job.credits_cost),
      updated_at = now()
    where id = v_job.user_id
    returning balance_available into v_new_available;

    update public.generation_jobs
    set
      status = 'succeeded',
      credit_settled = true,
      source_output_url = coalesce(p_source_url, source_output_url),
      r2_persisted_url = coalesce(p_r2_url, r2_persisted_url),
      updated_at = now()
    where id = p_job_id;

    insert into public.credit_ledger (
      user_id, job_id, tx_type, delta_available, delta_reserved, balance_after, note
    )
    values (
      v_job.user_id,
      p_job_id,
      'job_settle',
      0,
      -v_job.credits_cost,
      v_new_available,
      format('Settled %s credits on successful generation (%s)', v_job.credits_cost, v_job.model_id)
    );

  elsif p_final_status in ('failed', 'canceled') then
    update public.profiles
    set
      balance_available = balance_available + v_job.credits_cost,
      balance_reserved = greatest(0, balance_reserved - v_job.credits_cost),
      updated_at = now()
    where id = v_job.user_id
    returning balance_available into v_new_available;

    update public.generation_jobs
    set
      status = p_final_status,
      credit_settled = true,
      error_message = p_error,
      updated_at = now()
    where id = p_job_id;

    insert into public.credit_ledger (
      user_id, job_id, tx_type, delta_available, delta_reserved, balance_after, note
    )
    values (
      v_job.user_id,
      p_job_id,
      'job_refund',
      v_job.credits_cost,
      -v_job.credits_cost,
      v_new_available,
      format('Auto-refunded %s credits due to %s job (%s)', v_job.credits_cost, p_final_status, v_job.model_id)
    );
  end if;
end;
$$;
