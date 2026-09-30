-- เพิ่มตัวเลือกกิจกรรม ATV: รันใน Supabase SQL Editor 1 ครั้ง
-- ลูกค้าจะเห็นตัวเลือกเหล่านี้ในหน้ารายละเอียดและหน้า Booking

insert into public.packages
  (tour_id, name_th, name_en, description_th, adult_price, child_price, infant_price, capacity, active)
select t.id, v.name_th, v.name_en, v.description_th, v.adult_price, 0, 0, 20, true
from public.tours t
cross join (
  values
    ('ATV 30 นาที', 'ATV 30 Minutes', 'ขับ ATV 30 นาที', 1100),
    ('ATV 1 ชั่วโมง', 'ATV 1 Hour', 'ขับ ATV 1 ชั่วโมง', 1600)
) as v(name_th, name_en, description_th, adult_price)
where t.slug = 'atv-nature-view-point-adventure'
  and not exists (
    select 1 from public.packages p where p.tour_id = t.id and p.name_th = v.name_th
  );

notify pgrst, 'reload schema';
