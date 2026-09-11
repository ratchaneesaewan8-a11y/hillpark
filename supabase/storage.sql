-- =============================================================================
-- HILLPARK ADVENTURE — Storage policies สำหรับ bucket "tours"
-- ทำหลังจากสร้าง bucket ชื่อ "tours" (public) แล้ว
-- Run ใน Supabase SQL Editor
-- =============================================================================

-- ทุกคนดูรูปได้ (อ่าน)
drop policy if exists "tours public read" on storage.objects;
create policy "tours public read" on storage.objects
  for select using (bucket_id = 'tours');

-- เฉพาะ admin อัปโหลด/แก้/ลบรูปได้
drop policy if exists "tours admin insert" on storage.objects;
create policy "tours admin insert" on storage.objects
  for insert with check (bucket_id = 'tours' and public.is_admin());

drop policy if exists "tours admin update" on storage.objects;
create policy "tours admin update" on storage.objects
  for update using (bucket_id = 'tours' and public.is_admin());

drop policy if exists "tours admin delete" on storage.objects;
create policy "tours admin delete" on storage.objects
  for delete using (bucket_id = 'tours' and public.is_admin());
