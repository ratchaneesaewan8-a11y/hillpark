-- =============================================================================
-- HILLPARK ADVENTURE — เพิ่มคอลัมน์ payment_link ให้ตาราง packages
-- ใช้สำหรับผูก Stripe Payment Link (ลิงก์จ่ายเงินที่สร้างจาก Stripe Dashboard
-- โดยไม่ต้องเขียนโค้ดเชื่อม API) เข้ากับแต่ละแพ็กเกจ
-- รันไฟล์นี้ครั้งเดียวใน Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================================

alter table public.packages
  add column if not exists payment_link text;
