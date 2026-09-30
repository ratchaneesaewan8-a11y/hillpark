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

-- เติมรายการย้อนหลังที่ชำระแล้ว (หลังรันครั้งแรก Dashboard จะแสดงรายการทดสอบเดิมด้วย)
insert into public.booking_revenue_splits (booking_id, gross_amount, partner_amount, web_amount, platform_amount, operator_amount, status)
select b.id,
  b.total,
  case when b.affiliate_partner_id is not null then p.partner_reward * greatest(1, b.adults) else 0 end,
  case when b.affiliate_partner_id is null then p.partner_reward * greatest(1, b.adults) else 0 end,
  coalesce(p.platform_fee, 0) * greatest(1, b.adults),
  greatest(0, b.total - (coalesce(p.platform_fee, 0) * greatest(1, b.adults)) - (coalesce(p.partner_reward, 0) * greatest(1, b.adults))),
  case when b.booking_status = 'COMPLETED' then 'available' else 'pending' end
from public.bookings b
join public.packages p on p.id = b.package_id
join public.tours t on t.id = b.tour_id
where t.slug = 'atv-nature-view-point-adventure'
  and b.booking_status in ('PAID', 'CONFIRMED', 'COMPLETED')
on conflict (booking_id) do nothing;

notify pgrst, 'reload schema';
