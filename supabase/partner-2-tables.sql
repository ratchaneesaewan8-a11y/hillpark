-- =============================================================================
-- พาร์ทเนอร์ ขั้นที่ 2/2 — สร้างตาราง + สิทธิ์ (RLS)
-- รันไฟล์นี้ "หลัง" รันขั้นที่ 1 (partner-1-role.sql) เสร็จแล้ว
-- รันทั้งไฟล์รวดเดียวได้เลย
-- =============================================================================

-- ตารางพาร์ทเนอร์
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  ref_code text unique,                       -- โค้ดแนะนำ (สร้างตอนอนุมัติ)
  status text not null default 'pending',     -- pending | approved | rejected
  business_name text,
  phone text,
  note text,
  commission_rate int not null default 10,    -- % ค่าคอมมิชชัน
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
alter table public.partners enable row level security;

drop policy if exists "partner read own" on public.partners;
create policy "partner read own" on public.partners
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "partner apply own" on public.partners;
create policy "partner apply own" on public.partners
  for insert with check (user_id = auth.uid());

drop policy if exists "partner admin update" on public.partners;
create policy "partner admin update" on public.partners
  for update using (public.is_admin() or user_id = auth.uid());

-- ตารางค่าคอมมิชชัน
create table if not exists public.partner_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  booking_ref text,
  order_amount int not null default 0,
  amount int not null default 0,
  rate_at_booking int not null default 0,     -- อัตราคอม ณ วันจอง (ล็อกไว้)
  status text not null default 'pending',     -- pending | available | paid | void
  void_reason text,
  created_at timestamptz not null default now()
);
alter table public.partner_commissions enable row level security;

drop policy if exists "commission read own" on public.partner_commissions;
create policy "commission read own" on public.partner_commissions
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where user_id = auth.uid())
  );

-- ตารางคำขอถอนเงิน (Payout)
create table if not exists public.partner_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  amount int not null,
  status text not null default 'pending',     -- pending | paid | rejected
  bank_info text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);
alter table public.partner_payouts enable row level security;

drop policy if exists "payout read own" on public.partner_payouts;
create policy "payout read own" on public.partner_payouts
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where user_id = auth.uid())
  );

drop policy if exists "payout create own" on public.partner_payouts;
create policy "payout create own" on public.partner_payouts
  for insert with check (
    partner_id in (select id from public.partners where user_id = auth.uid())
  );

drop policy if exists "payout admin update" on public.partner_payouts;
create policy "payout admin update" on public.partner_payouts
  for update using (public.is_admin());
