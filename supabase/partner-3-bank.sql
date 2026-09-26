-- =============================================================================
-- พาร์ทเนอร์ ขั้นที่ 3 — ข้อมูลบัญชีธนาคาร + ข้อมูลการโอนค่าคอม
-- รันหลังจากรัน partner-1-role.sql และ partner-2-tables.sql แล้ว
-- รันทั้งไฟล์รวดเดียวได้ (รันซ้ำได้ ไม่พัง)
-- =============================================================================

-- บัญชีรับเงินของพาร์ทเนอร์ (กรอกตอนสมัคร)
alter table public.partners add column if not exists bank_name text;
alter table public.partners add column if not exists bank_account_name text;
alter table public.partners add column if not exists bank_account_no text;

-- ข้อมูลการโอนเงินค่าคอม (แอดมินกรอกตอนกด "โอนแล้ว")
alter table public.partner_payouts add column if not exists transfer_ref text;   -- เลขอ้างอิง/หมายเหตุการโอน
alter table public.partner_payouts add column if not exists admin_note text;     -- เหตุผลกรณีปฏิเสธ

-- =============================================================================
-- ความปลอดภัย: ผู้ใช้ "อ่าน" ได้เฉพาะข้อมูลของตัวเอง ห้ามเขียนตรงจาก browser
-- (การสมัคร/ขอถอนเงิน ทำผ่าน server ที่ตรวจสิทธิ์และยอดเงินแล้วเท่านั้น)
-- กันไม่ให้ผู้ใช้แก้สถานะตัวเองเป็น approved / แก้อัตราคอม / สร้างคำขอถอนปลอม
-- =============================================================================
drop policy if exists "partner apply own" on public.partners;
drop policy if exists "partner admin update" on public.partners;
create policy "partner admin update" on public.partners
  for update using (public.is_admin());

drop policy if exists "payout create own" on public.partner_payouts;
