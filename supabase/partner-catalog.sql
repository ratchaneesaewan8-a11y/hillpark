-- เปิด/ปิดแต่ละแพ็กเกจสำหรับพาร์ทเนอร์
alter table public.packages add column if not exists partner_enabled boolean not null default false;
update public.packages set partner_enabled = true where affiliate_min_price is not null or coalesce(partner_reward, 0) > 0;
notify pgrst, 'reload schema';
