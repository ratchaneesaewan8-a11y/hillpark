-- เพิ่มการควบคุมราคาโปรโมชั่นจากหน้า Admin
alter table public.packages add column if not exists promo_active boolean not null default false;
notify pgrst, 'reload schema';
