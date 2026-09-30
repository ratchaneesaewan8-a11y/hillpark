-- ราคาขายที่พาร์ทเนอร์ตั้งเองต่อแพ็กเกจ
-- Run after affiliate.sql and zipline-package.sql

create table if not exists public.partner_package_prices (
  partner_id uuid not null references public.partners(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  sale_price int not null check (sale_price > 0),
  updated_at timestamptz not null default now(),
  primary key (partner_id, package_id)
);

alter table public.partner_package_prices enable row level security;
drop policy if exists "partner reads own package price" on public.partner_package_prices;
create policy "partner reads own package price" on public.partner_package_prices
  for select using (partner_id in (select id from public.partners where user_id = auth.uid()) or public.is_admin());
