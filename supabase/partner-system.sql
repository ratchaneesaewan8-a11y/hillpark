-- =============================================================================
-- HILLPARK ADVENTURE — ระบบพาร์ทเนอร์ (Affiliate)
-- พาร์ทเนอร์ = ผู้ใช้ที่แนะนำลูกค้าผ่านลิงก์ ref แล้วรับค่าคอมมิชชัน
-- รันไฟล์นี้ครั้งเดียวใน Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================================

-- 1) เพิ่ม role 'partner' ใน enum (ต้องรันแยกก่อน แล้วค่อยใช้งานในรอบถัดไป)
alter type user_role add value if not exists 'partner';

-- 2) ตารางพาร์ทเนอร์
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  ref_code text unique,                       -- โค้ดแนะนำ (สร้างตอนอนุมัติ)
  status text not null default 'pending',     -- pending | approved | rejected
  business_name text,                         -- ชื่อร้าน/ธุรกิจ (ถ้ามี)
  phone text,
  note text,                                  -- ข้อความจากผู้สมัคร
  commission_rate int not null default 10,    -- % ค่าคอมมิชชัน
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table public.partners enable row level security;

-- 3) RLS: ผู้ใช้เห็น/สร้างของตัวเองได้, แอดมินเห็นทั้งหมด
drop policy if exists "partner read own" on public.partners;
create policy "partner read own" on public.partners
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "partner apply own" on public.partners;
create policy "partner apply own" on public.partners
  for insert with check (user_id = auth.uid());

drop policy if exists "partner admin update" on public.partners;
create policy "partner admin update" on public.partners
  for update using (public.is_admin());

-- =============================================================================
-- 4) ตารางค่าคอมมิชชัน (บันทึกเมื่อมีการจองผ่านลิงก์พาร์ทเนอร์)
--    * ระบบจะเติมข้อมูลอัตโนมัติเมื่อเชื่อมการบันทึกการจองครบวงจร (Stripe webhook)
-- =============================================================================
create table if not exists public.partner_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  booking_ref text,                          -- เลขจอง/อ้างอิง (ถ้ามี)
  order_amount int not null default 0,       -- ยอดจอง (บาท)
  amount int not null default 0,             -- ค่าคอมที่ได้ (บาท)
  rate_at_booking int not null default 0,    -- อัตราคอม ณ วันจอง (ล็อกไว้ ไม่ดึงย้อนหลัง)
  status text not null default 'pending',    -- pending(รอใช้บริการ) | available(พร้อมถอน) | paid(โอนแล้ว) | void(ยกเลิก/คืนเงิน)
  void_reason text,                          -- เหตุผลกรณี void
  created_at timestamptz not null default now()
);
alter table public.partner_commissions enable row level security;

drop policy if exists "commission read own" on public.partner_commissions;
create policy "commission read own" on public.partner_commissions
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where user_id = auth.uid())
  );

-- =============================================================================
-- 5) ตารางคำขอถอนเงิน (Payout)
-- =============================================================================
create table if not exists public.partner_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  amount int not null,                       -- จำนวนที่ขอถอน (บาท)
  status text not null default 'pending',    -- pending | paid | rejected
  bank_info text,                            -- ข้อมูลบัญชีรับเงิน
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
