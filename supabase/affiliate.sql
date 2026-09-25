-- HILLPARK ADVENTURE — Partner / Affiliate extension
-- Run this file once in Supabase SQL Editor after schema.sql.

do $$ begin
  create type partner_status as enum ('pending','approved','suspended','rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type partner_type as enum ('guide','hotel','driver','agent');
exception when duplicate_object then null; end $$;
do $$ begin
  create type commission_status as enum ('pending','available','void','paid');
exception when duplicate_object then null; end $$;
do $$ begin
  create type withdrawal_status as enum ('requested','approved','paid','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  phone text not null,
  line_id text,
  bank_name text not null,
  bank_account_name text not null,
  bank_account_number text not null,
  partner_type partner_type not null,
  status partner_status not null default 'pending',
  affiliate_code text unique,
  commission_rate numeric(5,2) not null default 10.00 check (commission_rate >= 0 and commission_rate <= 100),
  approved_at timestamptz,
  approved_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_partners_status on public.partners(status);
create index if not exists idx_partners_code on public.partners(affiliate_code);

alter table public.bookings add column if not exists affiliate_partner_id uuid references public.partners(id) on delete set null;
create index if not exists idx_bookings_affiliate_partner on public.bookings(affiliate_partner_id);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  rate numeric(5,2) not null,
  amount int not null check (amount >= 0),
  status commission_status not null default 'pending',
  available_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_commissions_partner_status on public.commissions(partner_id, status);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  amount int not null check (amount > 0),
  status withdrawal_status not null default 'requested',
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references public.users(id) on delete set null,
  note text
);

create or replace function public.make_affiliate_code(p_type partner_type) returns text as $$
declare prefix text; next_no int;
begin
  prefix := case p_type when 'guide' then 'GUIDE' when 'hotel' then 'HOTEL' when 'driver' then 'DRIVER' else 'AGENT' end;
  select count(*) + 1 into next_no from public.partners where partner_type = p_type and affiliate_code is not null;
  return prefix || '-A' || lpad(next_no::text, 3, '0');
end; $$ language plpgsql;

create or replace function public.set_partner_approval() returns trigger as $$
begin
  new.updated_at := now();
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    new.affiliate_code := coalesce(new.affiliate_code, public.make_affiliate_code(new.partner_type));
    new.approved_at := now();
  end if;
  return new;
end; $$ language plpgsql;
drop trigger if exists trg_partner_approval on public.partners;
create trigger trg_partner_approval before update on public.partners for each row execute function public.set_partner_approval();

create or replace function public.sync_affiliate_commission() returns trigger as $$
declare p public.partners%rowtype;
begin
  if new.booking_status in ('PAID','CONFIRMED','COMPLETED') and old.booking_status not in ('PAID','CONFIRMED','COMPLETED') and new.affiliate_partner_id is not null then
    select * into p from public.partners where id = new.affiliate_partner_id and status = 'approved';
    if found then
      insert into public.commissions (partner_id, booking_id, rate, amount, status)
      values (p.id, new.id, p.commission_rate, round(new.total * p.commission_rate / 100.0), 'pending')
      on conflict (booking_id) do nothing;
    end if;
  end if;
  if new.booking_status = 'COMPLETED' and old.booking_status is distinct from 'COMPLETED' then
    update public.commissions set status = 'available', available_at = now()
      where booking_id = new.id and status = 'pending';
  elsif new.booking_status in ('CANCELLED','REFUNDED') and old.booking_status is distinct from new.booking_status then
    update public.commissions set status = 'void' where booking_id = new.id and status in ('pending','available');
  end if;
  return new;
end; $$ language plpgsql;
drop trigger if exists trg_sync_affiliate_commission on public.bookings;
create trigger trg_sync_affiliate_commission after update on public.bookings for each row execute function public.sync_affiliate_commission();

alter table public.partners enable row level security;
alter table public.commissions enable row level security;
alter table public.withdrawals enable row level security;
drop policy if exists "public apply partner" on public.partners;
create policy "public apply partner" on public.partners for insert with check (status = 'pending');
drop policy if exists "admin manage partners" on public.partners;
create policy "admin manage partners" on public.partners for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "partner sees own profile" on public.partners;
create policy "partner sees own profile" on public.partners for select using (user_id = auth.uid());
drop policy if exists "partner sees commissions" on public.commissions;
create policy "partner sees commissions" on public.commissions for select using (exists (select 1 from public.partners p where p.id = partner_id and p.user_id = auth.uid()) or public.is_admin());
drop policy if exists "partner requests withdrawals" on public.withdrawals;
create policy "partner requests withdrawals" on public.withdrawals for insert with check (exists (select 1 from public.partners p where p.id = partner_id and p.user_id = auth.uid()));
drop policy if exists "partner sees withdrawals" on public.withdrawals;
create policy "partner sees withdrawals" on public.withdrawals for select using (exists (select 1 from public.partners p where p.id = partner_id and p.user_id = auth.uid()) or public.is_admin());
drop policy if exists "admin manage commissions" on public.commissions;
create policy "admin manage commissions" on public.commissions for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage withdrawals" on public.withdrawals;
create policy "admin manage withdrawals" on public.withdrawals for all using (public.is_admin()) with check (public.is_admin());
