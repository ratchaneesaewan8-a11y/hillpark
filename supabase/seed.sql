-- =============================================================================
-- HILLPARK ADVENTURE — Seed data (ตัวอย่างสำหรับเดโม)
-- Run หลังจาก schema.sql แล้ว
-- =============================================================================

-- Categories
insert into public.categories (name_th, name_en, slug, sort_order) values
  ('ทัวร์เกาะ','Island Tours','island-tours',1),
  ('ดำน้ำ','Snorkeling','snorkeling',2),
  ('ดำน้ำลึก','Diving','diving',3),
  ('พายเรือคายัค','Kayaking','kayaking',4),
  ('ATV','ATV','atv',5),
  ('Zipline','Zipline','zipline',6),
  ('ชมพระอาทิตย์ตก','Sunset Tours','sunset-tours',7),
  ('ทัวร์ธรรมชาติ','Nature Tours','nature-tours',8),
  ('กิจกรรมทางน้ำ','Water Activities','water-activities',9),
  ('ทัวร์แบบส่วนตัว','Private Tours','private-tours',10)
on conflict (slug) do nothing;

-- Tours (ตัวอย่าง 4 รายการตามสเปก)
insert into public.tours
  (category_id, title_th, title_en, slug, description_th, location, duration, start_time, end_time, rating, review_count, base_price, badge, featured, popular)
values
  ((select id from public.categories where slug='island-tours'),
   'ทัวร์เต็มวันเกาะห้องและเกาะเหลาลาดิง','Full Day Hong Island & Lao Lading','full-day-hong-island',
   'ล่องเรือเที่ยวเกาะห้อง ลากูนสวย น้ำใส เล่นน้ำ ดำน้ำตื้น พร้อมอาหารกลางวัน','เกาะห้อง, กระบี่',
   '1 วัน','08:30','16:30',4.9,1234,1390,'ยอดนิยม',true,true),
  ((select id from public.categories where slug='snorkeling'),
   'ทัวร์ดำน้ำ 4 เกาะยอดฮิต','4 Islands Snorkeling Tour','4-islands-snorkeling',
   'ดำน้ำตื้นชมปะการังและฝูงปลาที่ 4 เกาะยอดนิยม','ทะเลกระบี่',
   '1 วัน','08:30','16:30',4.8,965,1100,null,true,true),
  ((select id from public.categories where slug='kayaking'),
   'พายเรือคายัคคลองรูด','Kayaking at Klong Root','kayak-klong-root',
   'พายเรือคายัคลอดถ้ำ ชมป่าโกงกางและธรรมชาติอันเงียบสงบ','คลองรูด, กระบี่',
   'ครึ่งวัน','09:00','12:00',4.8,422,900,null,false,true),
  ((select id from public.categories where slug='atv'),
   'ขับ ATV ชมธรรมชาติ','ATV Nature Ride','atv-nature-ride',
   'ขับ ATV ลุยธรรมชาติ ผ่านสวนยางและเส้นทางป่าเขา','กระบี่',
   'ครึ่งวัน / เต็มวัน','09:00','12:00',4.9,512,1200,null,false,true)
on conflict (slug) do nothing;

-- Packages (ตัวอย่างให้ทัวร์เกาะห้อง)
insert into public.packages (tour_id, name_th, name_en, adult_price, child_price, infant_price, capacity)
values
  ((select id from public.tours where slug='full-day-hong-island'),'Join Trip','Join Trip',1390,890,0,30),
  ((select id from public.tours where slug='full-day-hong-island'),'Private Tour','Private Tour',4900,4900,0,10),
  ((select id from public.tours where slug='full-day-hong-island'),'Premium','Premium',6900,6900,0,8);

-- Availability (ตัวอย่าง 7 วันข้างหน้าให้แพ็กเกจ Join Trip)
insert into public.availability (tour_id, package_id, date, start_time, capacity, booked)
select
  p.tour_id, p.id, (current_date + g)::date, '08:30', 30, 0
from public.packages p
cross join generate_series(1,7) as g
where p.name_th = 'Join Trip';
