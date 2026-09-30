-- ให้พาร์ทเนอร์ตั้งราคาขาย Zipline ได้สูงสุดเท่าราคาปกติ ฿1,700 ต่อคน
update public.packages
set affiliate_max_price = 1700
where tour_id in (
  select id from public.tours where slug = 'hillpark-zipline-adventure'
);

notify pgrst, 'reload schema';
