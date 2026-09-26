-- =============================================================================
-- พาร์ทเนอร์ — สคริปต์ซ่อมตาราง (รันซ้ำได้ ไม่ลบข้อมูลเดิม)
-- ใช้เมื่อเจอ error "Could not find the '...' column of 'partners' in the schema cache"
-- รันทั้งไฟล์ใน Supabase Dashboard > SQL Editor > New query > Run
-- (ต้องรัน partner-1-role.sql มาก่อนแล้ว)
-- =============================================================================

-- ---------- partners: สร้างถ้ายังไม่มี + เติมคอลัมน์ที่ขาด ----------
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade
);

alter table public.partners add column if not exists ref_code text;
alter table public.partners add column if not exists status text not null default 'pending';
alter table public.partners add column if not exists business_name text;
alter table public.partners add column if not exists phone text;
alter table public.partners add column if not exists note text;
alter table public.partners add column if not exists commission_rate int not null default 10;
alter table public.partners add column if not exists created_at timestamptz not null default now();
alter table public.partners add column if not exists approved_at timestamptz;
alter table public.partners add column if not exists bank_name text;
alter table public.partners add column if not exists bank_account_name text;
alter table public.partners add column if not exists bank_account_no text;

create unique index if not exists partners_user_id_key on public.partners(user_id);
create unique index if not exists partners_ref_code_key on public.partners(ref_code);

alter table public.partners enable row level security;

drop policy if exists "partner read own" on public.partners;
create policy "partner read own" on public.partners
  for select using (user_id = auth.uid() or public.is_admin());

-- การเขียนข้อมูลทำผ่าน server เท่านั้น
drop policy if exists "partner apply own" on public.partners;
drop policy if exists "partner admin update" on public.partners;
create policy "partner admin update" on public.partners
  for update using (public.is_admin());

-- ---------- partner_commissions ----------
create table if not exists public.partner_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade
);
alter table public.partner_commissions add column if not exists booking_ref text;
alter table public.partner_commissions add column if not exists order_amount int not null default 0;
alter table public.partner_commissions add column if not exists amount int not null default 0;
alter table public.partner_commissions add column if not exists rate_at_booking int not null default 0;
alter table public.partner_commissions add column if not exists status text not null default 'pending';
alter table public.partner_commissions add column if not exists void_reason text;
alter table public.partner_commissions add column if not exists created_at timestamptz not null default now();

alter table public.partner_commissions enable row level security;
drop policy if exists "commission read own" on public.partner_commissions;
create policy "commission read own" on public.partner_commissions
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where user_id = auth.uid())
  );

-- ---------- partner_payouts ----------
create table if not exists public.partner_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade
);
alter table public.partner_payouts add column if not exists amount int not null default 0;
alter table public.partner_payouts add column if not exists status text not null default 'pending';
alter table public.partner_payouts add column if not exists bank_info text;
alter table public.partner_payouts add column if not exists requested_at timestamptz not null default now();
alter table public.partner_payouts add column if not exists processed_at timestamptz;
alter table public.partner_payouts add column if not exists transfer_ref text;
alter table public.partner_payouts add column if not exists admin_note text;

alter table public.partner_payouts enable row level security;
drop policy if exists "payout read own" on public.partner_payouts;
create policy "payout read own" on public.partner_payouts
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where user_id = auth.uid())
  );
drop policy if exists "payout create own" on public.partner_payouts;
drop policy if exists "payout admin update" on public.partner_payouts;
create policy "payout admin update" on public.partner_payouts
  for update using (public.is_admin());

-- ---------- ให้ Supabase (PostgREST) โหลดโครงสร้างตารางใหม่ทันที ----------
notify pgrst, 'reload schema';
