-- Zipline pricing package - run after schema.sql and affiliate.sql
-- ตัวเลขทั้งหมดเป็นเงินบาทต่อคน

alter table public.packages add column if not exists regular_price int;
alter table public.packages add column if not exists promo_price int;
alter table public.packages add column if not exists affiliate_min_price int;
alter table public.packages add column if not exists affiliate_max_price int;
alter table public.packages add column if not exists company_entry_price int;
alter table public.packages add column if not exists platform_fee int;
alter table public.packages add column if not exists net_floor int;
alter table public.bookings add column if not exists affiliate_sale_price int;
alter table public.bookings add column if not exists affiliate_commission int;

insert into public.tours
  (category_id, title_th, title_en, slug, description_th, location, duration, start_time, end_time, rating, review_count, base_price, badge, featured, popular, active)
values
  ((select id from public.categories where slug = 'zipline'),
   'Hillpark Zipline Adventure', 'Hillpark Zipline Adventure', 'hillpark-zipline-adventure',
   'ผจญภัยโหนสลิงชมธรรมชาติ พร้อมทีมงานดูแลตลอดกิจกรรม', 'กระบี่',
   'ประมาณ 2 ชั่วโมง', '09:00', '16:00', 4.9, 0, 1500, 'โปรโมชั่น', true, true, true)
on conflict (slug) do update set
  base_price = excluded.base_price, badge = excluded.badge, active = true;

insert into public.packages
  (tour_id, name_th, name_en, description_th, adult_price, child_price, infant_price, capacity, regular_price, promo_price, affiliate_min_price, affiliate_max_price, company_entry_price, platform_fee, net_floor, active)
select t.id, 'Zipline Adventure', 'Zipline Adventure',
  'ราคาปกติ 1,700 บาท | โปรโมชั่น 1,500 บาท | ตัวแทนตั้งราคาขายได้ 1,200–1,500 บาท',
  1500, 0, 0, 30, 1700, 1500, 1200, 1500, 1200, 200, 1000, true
from public.tours t
where t.slug = 'hillpark-zipline-adventure'
  and not exists (select 1 from public.packages p where p.tour_id = t.id and p.name_th = 'Zipline Adventure');

-- ใช้กับ trigger commission: กรณีตัวแทนตั้งราคาขายเอง ใช้ส่วนต่างจริงแทนเปอร์เซ็นต์
create or replace function public.sync_affiliate_commission() returns trigger as $$
declare p public.partners%rowtype; commission_amount int;
begin
  if new.booking_status in ('PAID','CONFIRMED','COMPLETED') and old.booking_status not in ('PAID','CONFIRMED','COMPLETED') and new.affiliate_partner_id is not null then
    select * into p from public.partners where id = new.affiliate_partner_id and status = 'approved';
    if found then
      commission_amount := coalesce(new.affiliate_commission, round(new.total * p.commission_rate / 100.0));
      insert into public.commissions (partner_id, booking_id, rate, amount, status)
      values (p.id, new.id, p.commission_rate, commission_amount, 'pending')
      on conflict (booking_id) do nothing;
    end if;
  end if;
  if new.booking_status = 'COMPLETED' and old.booking_status is distinct from 'COMPLETED' then
    update public.commissions set status = 'available', available_at = now() where booking_id = new.id and status = 'pending';
  elsif new.booking_status in ('CANCELLED','REFUNDED') and old.booking_status is distinct from new.booking_status then
    update public.commissions set status = 'void' where booking_id = new.id and status in ('pending','available');
  end if;
  return new;
end; $$ language plpgsql;
