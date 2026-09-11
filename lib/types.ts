// โครงสร้างข้อมูลหลักของแอป (ตรงกับ supabase/schema.sql)

export type Category = {
  id: string;
  name_th: string;
  name_en: string;
  slug: string;
  image: string;
  active: boolean;
  sort_order: number;
};

export type Tour = {
  id: string;
  category_id: string;
  title_th: string;
  title_en: string;
  slug: string;
  description_th: string | null;
  description_en: string | null;
  location: string | null;
  cover_image: string;
  duration: string | null;      // เช่น "1 วัน", "ครึ่งวัน"
  start_time: string | null;    // "08:30"
  end_time: string | null;      // "16:30"
  pickup_available: boolean;
  pickup_info: string | null;
  meeting_point: string | null;
  rating: number;               // 0-5
  review_count: number;
  base_price: number;           // ราคาเริ่มต้นสำหรับแสดงบนการ์ด
  featured: boolean;
  popular: boolean;
  active: boolean;
  badge?: string | null;        // "ยอดนิยม" | "แนะนำ" | "ใหม่"
};

export type Package = {
  id: string;
  tour_id: string;
  name_th: string;
  name_en: string;
  description_th: string | null;
  adult_price: number;
  child_price: number;
  infant_price: number;
  capacity: number;
  active: boolean;
};

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "PAYMENT_FAILED";
