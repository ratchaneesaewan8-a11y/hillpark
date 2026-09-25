# HILLPARK ADVENTURE — Travel Booking Web App

เว็บจองทัวร์และกิจกรรมท่องเที่ยว (Next.js + TypeScript + Tailwind + Supabase + Stripe)
Scaffold ชุดเริ่มต้นนี้ **รันหน้าเว็บได้ทันที** โดยหน้า Homepage / Listing / Detail ใช้ demo data
ในเครื่องก่อน (ยังไม่ต้องต่อ DB) แล้วค่อยเปิด Supabase + Stripe ตามขั้นตอนด้านล่าง

---

## 1) สิ่งที่มีให้แล้วในชุดนี้

```
D:\Hillpark\
├── app/
│   ├── layout.tsx                  # โครง + ฟอนต์ Prompt (ไทย) + Header/Footer
│   ├── page.tsx                    # ✅ Homepage ตาม mockup
│   ├── globals.css
│   ├── tours/page.tsx              # ✅ Tour Listing (เวอร์ชันเริ่มต้น)
│   ├── tours/[slug]/page.tsx       # ✅ Tour Detail (เวอร์ชันเริ่มต้น)
│   ├── booking/success/page.tsx    # ✅ หน้า Booking Confirmation
│   └── api/
│       ├── checkout/route.ts       # ✅ สร้าง Booking + Stripe Checkout (server-side pricing)
│       └── webhooks/stripe/route.ts# ✅ Stripe Webhook -> อัปเดตเป็น PAID
├── components/
│   ├── site-header.tsx             # ✅ Header + เมนูมือถือ
│   ├── site-footer.tsx             # ✅ Footer
│   └── home/                       # ✅ Hero+Search, Category, TourCard, PopularTours, Benefits
├── lib/
│   ├── supabase/{client,server}.ts # ✅ Supabase client (browser/server + admin)
│   ├── stripe.ts                   # ✅ Stripe instance
│   ├── types.ts                    # ✅ Type ของ Tour/Package/Booking
│   ├── utils.ts                    # ✅ formatTHB, cn, booking number
│   └── data/tours.ts               # ✅ DEMO DATA (ใช้ก่อนต่อ DB)
├── supabase/
│   ├── schema.sql                  # ✅ ตารางทั้งหมด + RLS + trigger booking number
│   └── seed.sql                    # ✅ ข้อมูลตัวอย่าง (หมวดหมู่ + 4 ทัวร์ + package)
├── public/logo.jpg                 # ✅ โลโก้ HILLPARK
├── .env.example                    # ✅ ตัวอย่าง environment variables
└── config: package.json, tsconfig, tailwind, next, postcss
```

สีแบรนด์ตั้งไว้ใน `tailwind.config.ts` แล้ว: `brand-orange #FF6A00`, `brand-green #09251D`, `brand-teal #08A6A6`

---

## 2) ติดตั้งและรัน (บนเครื่องคุณ)

ต้องมี **Node.js 18+** (แนะนำ 20+)

```bash
cd D:\Hillpark
npm install
cp .env.example .env.local      # แล้วเติมค่า key จริง (ดูขั้นตอน 3–4)
npm run dev
```

เปิด http://localhost:3000 — หน้า Homepage จะแสดงตาม mockup ทันที
(หน้าเว็บใช้ demo data ได้เลย ยังไม่ต้องมี Supabase/Stripe ก็รันดูได้)

---

## 3) ตั้งค่า Supabase

1. สร้างโปรเจกต์ที่ https://supabase.com
2. ไป **SQL Editor** → paste `supabase/schema.sql` → Run
3. paste `supabase/seed.sql` → Run (ได้ข้อมูลตัวอย่าง)
4. **Project Settings → API** คัดลอกใส่ `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (เก็บเป็นความลับ ใช้ฝั่ง server เท่านั้น)
5. **Storage** → สร้าง bucket ชื่อ `tours` (public) สำหรับรูปทัวร์
   แล้วไป SQL Editor paste `supabase/storage.sql` → Run (ตั้งสิทธิ์อัปโหลด/อ่านรูป)
6. ตั้ง admin: สร้างผู้ใช้ 1 คนก่อนผ่าน **Authentication → Users → Add user** (ใส่อีเมล/รหัสผ่าน)
   แล้วไป **Table Editor → users** แก้คอลัมน์ `role` ของแถวนั้นเป็น `admin`
7. (ถ้าเคยรันเว็บตอนยังใช้ demo data มาก่อน) paste `supabase/sync-content.sql` → Run
   เพื่อนำทัวร์ที่เพิ่มไว้ในโค้ด (เช่นจากข้อมูล Klook) เข้าฐานข้อมูลจริงด้วย — ไม่งั้นทัวร์พวกนี้
   จะหายไปจากหน้าเว็บทันทีที่ต่อ Supabase เพราะหน้าเว็บจะดึงข้อมูลจริงจาก Supabase แทน demo data

**สำคัญ:** ตั้งแต่ต่อ Supabase แล้ว หน้าเว็บ (โฮมเพจ / ทัวร์ทั้งหมด / รายละเอียดทัวร์) จะดึงข้อมูล
จาก Supabase จริงโดยอัตโนมัติ (ไม่ใช่ demo data ในโค้ดอีกต่อไป) ดังนั้นทัวร์/รูปภาพที่เพิ่มหรือแก้
ผ่านหน้า Admin จะขึ้นบนเว็บทันทีหลัง deploy — ถ้า Supabase ยังไม่ได้ตั้งค่า หรือดึงข้อมูลไม่สำเร็จ
เว็บจะ fallback กลับไปใช้ demo data อัตโนมัติ ไม่มีวันขึ้นหน้าว่าง

---

## 3.1) ระบบหลังบ้าน (Admin) — /admin

หลังตั้งค่า Supabase + ตั้ง role admin แล้ว เข้า **http://localhost:3000/admin/login**
ล็อกอินด้วยอีเมล/รหัสผ่านที่สมัครไว้ จะเข้าหน้า Admin ที่ทำได้:

- **แดชบอร์ด** — ยอดขาย, จำนวนการจอง, รอชำระ, จำนวนทัวร์
- **จัดการทัวร์** — เพิ่ม/แก้/ลบ, อัปโหลดรูปหน้าปก + แกลเลอรี, ตั้งราคาเริ่มต้น, badge, เปิด/ปิด
- **แพ็กเกจ/ราคา** — เพิ่มแพ็กเกจในแต่ละทัวร์ (ราคาผู้ใหญ่/เด็ก/เด็กเล็ก + จำนวนที่รับ)
- **หมวดหมู่** — เพิ่ม/ลบ/จัดลำดับ
- **การจอง** — ดูรายการจอง + เปลี่ยนสถานะ (PAID / CONFIRMED / CANCELLED ฯลฯ)

> รูปที่อัปโหลดจะไปเก็บใน Supabase Storage bucket `tours` และการเขียนข้อมูลถูกจำกัดด้วย RLS
> ให้เฉพาะ user ที่ role = 'admin' เท่านั้น (ปลอดภัยแม้เรียกผ่าน API)

ยังไม่ได้ทำ (ขั้นต่อไป): Availability/ปฏิทินที่นั่ง, จัดการรีวิว/ลูกค้า, แก้ Homepage content, กราฟในแดชบอร์ด

---

## 4) ตั้งค่า Stripe

1. สมัคร https://stripe.com → โหมด Test
2. **Developers → API keys** ใส่ใน `.env.local`:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Webhook ตอนพัฒนา (local): ติดตั้ง Stripe CLI แล้วรัน
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   คัดลอก `whsec_...` ที่ได้ ใส่เป็น `STRIPE_WEBHOOK_SECRET`
4. ตอนขึ้น production: ไป Dashboard → Webhooks → เพิ่ม endpoint
   `https://your-domain.com/api/webhooks/stripe` (event: `checkout.session.completed`)

> ⚠️ ราคาคำนวณที่ฝั่ง server เสมอ (`app/api/checkout/route.ts`) และยืนยันการจ่ายเงินด้วย
> Webhook เท่านั้น — ห้ามเชื่อ total จาก frontend

---

## 5) Roadmap — สิ่งที่ต้องสร้างต่อ (ตามลำดับสเปก §43)

สถานะ: ✅ = มีแล้ว · ⬜ = ยังต้องทำ

**ฝั่งลูกค้า (Customer)**
- ✅ Homepage / Header / Footer / Category / Popular Tours
- ✅ Tour Listing (โครง) → ⬜ เพิ่ม Filter (หมวด/ราคา/rating/ระยะเวลา) + Sort → `app/tours/page.tsx`
- ✅ Tour Detail (โครง) → ⬜ Gallery, Itinerary, Included/Excluded, Reviews, แผนที่ → `app/tours/[slug]/`
- ⬜ Booking Flow 5 สเต็ป (เลือกวัน → แพ็กเกจ → จำนวนคน → ข้อมูลผู้จอง → สรุปยอด) → สร้าง `app/booking/[slug]/`
- ✅ Checkout API + Stripe + Webhook + หน้า Success
- ⬜ My Bookings → `app/bookings/page.tsx` (ดึงจาก Supabase)
- ⬜ Auth (Login/Register) ด้วย Supabase Auth → `app/login`, `app/register`
- ⬜ Wishlist → `app/wishlist/page.tsx` + ตาราง `wishlist`
- ⬜ E-Ticket / Voucher PDF + QR → เพิ่ม lib สร้าง PDF
- ⬜ Bottom navigation บนมือถือ (Home / Tours / Bookings / Profile)

**ฝั่งแอดมิน (Admin) — `app/admin/`**
- ⬜ Admin login + ตรวจ role='admin'
- ⬜ Dashboard (ยอดขาย, จำนวน booking, กราฟ)
- ⬜ Tours CRUD + อัปโหลดรูป (Supabase Storage)
- ⬜ Categories CRUD
- ⬜ Packages CRUD
- ⬜ Availability (กำหนด capacity ต่อวัน/รอบ + Sold Out)
- ⬜ Booking Management (ดู/ยืนยัน/ยกเลิก/คืนเงิน)
- ⬜ Customer Management
- ⬜ Reviews (approve/hide)
- ⬜ Homepage Content (แก้ hero/banner จากตาราง `site_content`)

**เชื่อมข้อมูลจริง (ตอนพร้อม)**: เปลี่ยนหน้าที่ยัง import จาก `lib/data/tours.ts`
ให้ดึงจาก Supabase แทน เช่นใน Server Component:
```ts
const supabase = createClient();
const { data: tours } = await supabase.from("tours").select("*").eq("active", true);
```

**Phase 2** (ตามสเปก §41): คูปอง, affiliate, LINE/WhatsApp notify, อีเมลอัตโนมัติ, multi-tour cart, gift voucher

### ระบบพาร์ทเนอร์ / Affiliate

ระบบนี้เพิ่มไว้แล้วในโค้ด โดยก่อนใช้งานให้เปิด Supabase SQL Editor แล้วรัน
`supabase/affiliate.sql` หนึ่งครั้ง จากนั้น:

- ลูกค้าสมัครที่ `/partners` และแอดมินจัดการที่ `/admin/partners`
- เมื่อแอดมินเปลี่ยนสถานะเป็น **อนุมัติ** ระบบสร้าง Code เช่น `GUIDE-A001` ให้เอง
- ลิงก์ `/ref/GUIDE-A001` จดจำผู้แนะนำ 30 วัน; Checkout จะบันทึก Partner ที่อ้างอิงไว้กับ Booking
- Stripe webhook เปลี่ยน Booking เป็น `PAID` แล้ว trigger จะสร้าง Commission สถานะ `pending`
- เมื่อแอดมินเปลี่ยน Booking เป็น `COMPLETED` เครดิตเป็น `available`; ถ้า `CANCELLED`/`REFUNDED` จะเป็น `void`
- คำขอถอนเงินอยู่ในตาราง `withdrawals` และแอดมินตรวจ/เปลี่ยนเป็น `paid` ได้ที่ `/admin/withdrawals`

---

## 6) Deploy (Vercel)

1. push โค้ดขึ้น GitHub
2. import ที่ https://vercel.com → ใส่ environment variables ทั้งหมดจาก `.env.local`
3. ตั้ง `NEXT_PUBLIC_SITE_URL` เป็นโดเมนจริง
4. เพิ่ม Stripe Webhook endpoint เป็นโดเมนจริง

---

## หมายเหตุ
- ไฟล์รูป reference เดิม (`S__*.jpg`) ถูกใส่ไว้ใน `.gitignore` แล้ว ไม่กระทบ build
- ยังไม่ได้ติดตั้ง shadcn/ui (คอมโพเนนต์ในชุดนี้เขียนด้วย Tailwind ตรง ๆ เพื่อให้รันได้ทันที)
  ถ้าต้องการ shadcn ภายหลัง รัน `npx shadcn@latest init` ได้เลย
```
