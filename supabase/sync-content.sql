-- =============================================================================
-- HILLPARK ADVENTURE — Sync เนื้อหาที่ Claude เพิ่มไว้ใน demo data เข้า Supabase จริง
-- รันไฟล์นี้ครั้งเดียวใน Supabase Dashboard > SQL Editor > New query > Run
-- (ต้องรัน schema.sql และ seed.sql มาก่อนแล้ว)
--
-- ทำไมต้องรัน: ตอนนี้หน้าเว็บ (โฮมเพจ / รายการทัวร์ / รายละเอียดทัวร์) ถูกปรับให้ดึงข้อมูล
-- จาก Supabase จริงแล้ว (ถ้ามีข้อมูล) แทนที่จะใช้ demo data ในโค้ด ดังนั้นทัวร์ 2 รายการที่
-- Claude เพิ่มไว้ในไฟล์ demo (ซิปไลน์ฮิลล์พาร์ค และ ATV ชมวิวธรรมชาติ จากข้อมูล Klook) จะไม่ขึ้น
-- บนเว็บจริง จนกว่าจะ insert เข้า Supabase ด้วยสคริปต์นี้
-- =============================================================================

-- ปิด (ไม่แสดง) ทัวร์ ATV เดโมเก่าจาก seed.sql ที่ถูกแทนที่ด้วยรายการใหม่ด้านล่าง
update public.tours set active = false where slug = 'atv-nature-ride';

-- เพิ่ม/อัปเดต: ผจญภัยขับ ATV ชมวิวธรรมชาติ (ข้อมูลจาก Klook)
insert into public.tours
  (category_id, title_th, title_en, slug, description_th, location, cover_image,
   duration, pickup_available, pickup_info, meeting_point, rating, review_count,
   base_price, badge, featured, popular, active)
values
  ((select id from public.categories where slug = 'atv'),
   'ผจญภัยขับ ATV ชมวิวธรรมชาติ', 'ATV Nature View Point Adventure', 'atv-nature-view-point-adventure',
   'ขับ ATV ด้วยตัวเองลุยเส้นทางธรรมชาติ ผ่านสวนปาล์ม ทางลูกรัง ลุยโคลนและลำธาร มุ่งสู่จุดชมวิวพาโนรามาเห็นทั้งภูเขาและทะเล มีไกด์มืออาชีพดูแลตลอดเส้นทาง พร้อมอุปกรณ์เซฟตี้ครบ เหมาะทั้งมือใหม่และคนชำนาญ แถมมะพร้าวเย็นๆ ให้ดื่มหลังจบกิจกรรม',
   'กระบี่', 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&q=75',
   '30-60 นาที (เลือกรอบได้)', true, 'มีบริการรับส่งฟรีจากโรงแรมในพื้นที่ (ตามเงื่อนไข)',
   'จุดนัดพบ ATV กระบี่ (แจ้งพิกัดหลังจอง)', 5.0, 23,
   1100, 'ใหม่', true, true, true)
on conflict (slug) do update set
  category_id = excluded.category_id,
  title_th = excluded.title_th,
  title_en = excluded.title_en,
  description_th = excluded.description_th,
  location = excluded.location,
  cover_image = excluded.cover_image,
  duration = excluded.duration,
  pickup_available = excluded.pickup_available,
  pickup_info = excluded.pickup_info,
  meeting_point = excluded.meeting_point,
  rating = excluded.rating,
  review_count = excluded.review_count,
  base_price = excluded.base_price,
  badge = excluded.badge,
  featured = excluded.featured,
  popular = excluded.popular,
  active = excluded.active;

-- เพิ่ม/อัปเดต: ฮิลล์พาร์ค แอดเวนเจอร์ ซิปไลน์ และโรลเลอร์โคสเตอร์ป่าเขา (ข้อมูลจาก Klook)
insert into public.tours
  (category_id, title_th, title_en, slug, description_th, location, cover_image,
   duration, pickup_available, pickup_info, meeting_point, rating, review_count,
   base_price, badge, featured, popular, active)
values
  ((select id from public.categories where slug = 'zipline'),
   'ฮิลล์พาร์ค แอดเวนเจอร์ ซิปไลน์ และโรลเลอร์โคสเตอร์ป่าเขา', 'Hill Park Adventure Zipline & Rollers', 'hillpark-zipline-rollers',
   'ผจญภัยกลางป่าเขากระบี่ โหนสลิงข้ามหุบเขาชมวิวพาโนรามา เดินสะพานแขวน (สกายบริดจ์) และเล่นเชือกโรยตัว หลายสเตชันตั้งแต่ระดับเริ่มต้นจนถึงสายลุย เหมาะกับทั้งครอบครัว กลุ่มเพื่อน และเดินทางคนเดียว อุปกรณ์เซฟตี้มาตรฐานนำเข้า มีเจ้าหน้าที่ดูแลตลอดกิจกรรม ใกล้แหล่งท่องเที่ยวหลักย่านอ่าวนาง',
   'อ่าวนาง, กระบี่', 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=800&q=75',
   '1 วัน', true, 'มีบริการรับส่งจากโรงแรมในพื้นที่ (เลือกได้ตอนจอง)',
   'จุดนัดพบฮิลล์พาร์ค แอดเวนเจอร์ ใกล้อ่าวนาง กระบี่', 5.0, 0,
   1445, 'ใหม่', true, true, true)
on conflict (slug) do update set
  category_id = excluded.category_id,
  title_th = excluded.title_th,
  title_en = excluded.title_en,
  description_th = excluded.description_th,
  location = excluded.location,
  cover_image = excluded.cover_image,
  duration = excluded.duration,
  pickup_available = excluded.pickup_available,
  pickup_info = excluded.pickup_info,
  meeting_point = excluded.meeting_point,
  rating = excluded.rating,
  review_count = excluded.review_count,
  base_price = excluded.base_price,
  badge = excluded.badge,
  featured = excluded.featured,
  popular = excluded.popular,
  active = excluded.active;
