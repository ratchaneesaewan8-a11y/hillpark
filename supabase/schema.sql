-- =============================================================================
-- HILLPARK ADVENTURE — Database Schema (Supabase / PostgreSQL)
-- วิธีใช้: เปิด Supabase Dashboard > SQL Editor > New query > paste ไฟล์นี้ > Run
-- =============================================================================

-- ---------- Enums ----------
do $$ begin
  create type booking_status as enum
    ('PENDING_PAYMENT','PAID','CONFIRMED','COMPLETED','CANCELLED','REFUNDED','PAYMENT_FAILED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('customer','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending','approved','hidden');
exception when duplicate_object then null; end $$;

-- ---------- users (profile เชื่อมกับ auth.users) ----------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  phone text,
  country text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- ---------- categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_th text not null,
  name_en text not null,
  slug text unique not null,
  image text,
  active boolean not null default true,
  sort_order int not null default 0
);

-- ---------- tours ----------
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title_th text not null,
  title_en text,
  slug text unique not null,
  description_th text,
  description_en text,
  location text,
  cover_image text,
  duration text,
  start_time text,
  end_time text,
  pickup_available boolean not null default true,
  pickup_info text,
  meeting_point text,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  base_price int not null default 0,        -- ราคาเริ่มต้น (บาท) สำหรับแสดงบนการ์ด
  badge text,                               -- 'ยอดนิยม' | 'แนะนำ' | 'ใหม่'
  featured boolean not null default false,
  popular boolean not null default false,
  active boolean not null default true,
  -- SEO
  seo_title text,
  seo_description text,
  og_image text,
  created_at timestamptz not null default now()
);
create index if not exists idx_tours_category on public.tours(category_id);
create index if not exists idx_tours_active on public.tours(active);

-- ---------- tour_images (gallery) ----------
create table if not exists public.tour_images (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0
);

-- ---------- packages ----------
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  name_th text not null,
  name_en text,
  description_th text,
  description_en text,
  adult_price int not null default 0,
  child_price int not null default 0,
  infant_price int not null default 0,
  capacity int not null default 0,
  included text,
  excluded text,
  cancellation_policy text,
  active boolean not null default true
);
create index if not exists idx_packages_tour on public.packages(tour_id);

-- ---------- availability ----------
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  package_id uuid references public.packages(id) on delete cascade,
  date date not null,
  start_time text,
  capacity int not null default 0,
  booked int not null default 0,
  active boolean not null default true,
  unique (package_id, date, start_time)
);
create index if not exists idx_avail_tour_date on public.availability(tour_id, date);

-- ---------- bookings ----------
-- เลข booking แบบ HP-2026-000001 (สร้างจาก sequence + trigger)
create sequence if not exists booking_seq start 1;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text unique,
  user_id uuid references public.users(id) on delete set null,
  tour_id uuid references public.tours(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  booking_date date not null,
  start_time text,
  adults int not null default 0,
  children int not null default 0,
  infants int not null default 0,
  subtotal int not null default 0,
  discount int not null default 0,
  total int not null default 0,
  currency text not null default 'thb',
  payment_status text not null default 'unpaid',
  booking_status booking_status not null default 'PENDING_PAYMENT',
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);
create index if not exists idx_bookings_user on public.bookings(user_id);
create index if not exists idx_bookings_status on public.bookings(booking_status);

create or replace function set_booking_number() returns trigger as $$
begin
  if new.booking_number is null then
    new.booking_number := 'HP-' || to_char(now(),'YYYY') || '-' ||
      lpad(nextval('booking_seq')::text, 6, '0');
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_booking_number on public.bookings;
create trigger trg_booking_number before insert on public.bookings
  for each row execute function set_booking_number();

-- ---------- booking_contacts (ข้อมูลผู้จอง) ----------
create table if not exists public.booking_contacts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  country text,
  hotel text,
  pickup_location text,
  special_request text
);

-- ---------- reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  images text[],
  status review_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------- wishlist ----------
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  tour_id uuid not null references public.tours(id) on delete cascade,
  unique (user_id, tour_id)
);

-- ---------- site_content (แก้ Homepage จาก Admin) ----------
create table if not exists public.site_content (
  key text primary key,       -- เช่น 'hero_title','hero_image','contact_phone'
  value jsonb
);

-- =============================================================================
-- Row Level Security (RLS) — แนวทางเริ่มต้น
-- เปิด RLS ทุกตาราง แล้วกำหนด policy ตามนี้ (ปรับได้)
-- =============================================================================
alter table public.users            enable row level security;
alter table public.categories       enable row level security;
alter table public.tours            enable row level security;
alter table public.tour_images      enable row level security;
alter table public.packages         enable row level security;
alter table public.availability     enable row level security;
alter table public.bookings         enable row level security;
alter table public.booking_contacts enable row level security;
alter table public.reviews          enable row level security;
alter table public.wishlist         enable row level security;
alter table public.site_content     enable row level security;

-- helper: เช็คว่าเป็น admin
create or replace function public.is_admin() returns boolean as $$
  select exists(
    select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
  );
$$ language sql security definer stable;

-- อ่านสาธารณะ: catalog ที่ active
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (active or public.is_admin());

drop policy if exists "public read tours" on public.tours;
create policy "public read tours" on public.tours for select using (active or public.is_admin());

drop policy if exists "public read images" on public.tour_images;
create policy "public read images" on public.tour_images for select using (true);

drop policy if exists "public read packages" on public.packages;
create policy "public read packages" on public.packages for select using (active or public.is_admin());

drop policy if exists "public read availability" on public.availability;
create policy "public read availability" on public.availability for select using (true);

drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews" on public.reviews for select using (status = 'approved' or public.is_admin());

-- users: เจ้าของอ่าน/แก้ของตัวเอง
drop policy if exists "own profile" on public.users;
create policy "own profile" on public.users for select using (id = auth.uid() or public.is_admin());
drop policy if exists "update own profile" on public.users;
create policy "update own profile" on public.users for update using (id = auth.uid());

-- bookings: เจ้าของเห็นของตัวเอง / admin เห็นทั้งหมด
drop policy if exists "own bookings" on public.bookings;
create policy "own bookings" on public.bookings for select using (user_id = auth.uid() or public.is_admin());

-- wishlist: เจ้าของจัดการเอง
drop policy if exists "own wishlist" on public.wishlist;
create policy "own wishlist" on public.wishlist for all using (user_id = auth.uid());

-- Admin จัดการ catalog ทั้งหมด (insert/update/delete)
-- หมายเหตุ: การเขียน booking/การชำระเงินให้ทำผ่าน server (service role key) ซึ่งข้าม RLS
drop policy if exists "admin write tours" on public.tours;
create policy "admin write tours" on public.tours for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin write packages" on public.packages;
create policy "admin write packages" on public.packages for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin write availability" on public.availability;
create policy "admin write availability" on public.availability for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin write images" on public.tour_images;
create policy "admin write images" on public.tour_images for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage reviews" on public.reviews;
create policy "admin manage reviews" on public.reviews for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin site content" on public.site_content;
create policy "admin site content" on public.site_content for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public read site content" on public.site_content;
create policy "public read site content" on public.site_content for select using (true);

-- Trigger: สร้างแถวใน public.users อัตโนมัติเมื่อมีสมาชิกใหม่จาก auth
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''))
  on conflict (id) do nothing;
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
