-- ATV 1 ชั่วโมง: พาร์ทเนอร์ตั้งขาย 1,300–1,600 บาท
update public.packages p set affiliate_min_price = 1300, affiliate_max_price = 1600, company_entry_price = 1100, platform_fee = 200, partner_enabled = true
from public.tours t where p.tour_id = t.id and t.slug = 'test66' and (p.name_th ilike '%1 ชั่วโมง%' or p.name_th ilike '%60%');
notify pgrst, 'reload schema';
