-- เปลี่ยนระบบ Affiliate เป็นส่วนต่างราคาขายเทียบราคา Net เท่านั้น
-- ไม่ใช้ค่าคอมมิชชัน 10% อีกต่อไป
alter table public.partners alter column commission_rate set default 0;
update public.partners set commission_rate = 0 where commission_rate = 10;
notify pgrst, 'reload schema';
