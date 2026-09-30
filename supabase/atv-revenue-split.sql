-- ระบบแบ่งรายได้ ATV: รันใน Supabase SQL Editor ก่อนใช้งานหน้า Admin เวอร์ชันใหม่
alter table public.packages add column if not exists partner_reward int not null default 0;
alter table public.packages add column if not exists operator_amount int;

create table if not exists public.booking_revenue_splits (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  gross_amount int not null default 0,
  partner_amount int not null default 0,
  web_amount int not null default 0,
  platform_amount int not null default 0,
  operator_amount int not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.booking_revenue_splits add column if not exists web_amount int not null default 0;

update public.packages p set partner_reward = 300, platform_fee = 200, operator_amount = 600
from public.tours t where p.tour_id = t.id and t.slug = 'atv-nature-view-point-adventure' and p.name_th ilike '%30%';
update public.packages p set partner_reward = 300, platform_fee = 200, operator_amount = 1100
from public.tours t where p.tour_id = t.id and t.slug = 'atv-nature-view-point-adventure' and (p.name_th ilike '%1 ชั่วโมง%' or p.name_th ilike '%60%');

notify pgrst, 'reload schema';
