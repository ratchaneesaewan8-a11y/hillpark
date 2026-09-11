import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/admin/auth";
import { TOURS } from "@/lib/data/tours";
import type { Tour, Package } from "@/lib/types";

// -----------------------------------------------------------------------------
// ดึงข้อมูลทัวร์ฝั่ง Storefront (โฮมเพจ / รายการทัวร์ / รายละเอียดทัวร์)
// ถ้าต่อ Supabase แล้ว และมีข้อมูลจริง -> ใช้ข้อมูลจริงจาก Supabase (สิ่งที่แอดมินเพิ่ม/แก้จะขึ้นทันที)
// ถ้ายังไม่ได้ต่อ Supabase หรือดึงข้อมูลไม่สำเร็จ/ยังไม่มีข้อมูล -> fallback ไปใช้ demo data
// เพื่อไม่ให้หน้าเว็บพังหรือว่างเปล่า
// -----------------------------------------------------------------------------

function normalizeTour(row: Record<string, any>): Tour {
  return {
    id: row.id,
    category_id: row.category_id ?? "",
    title_th: row.title_th,
    title_en: row.title_en ?? row.title_th,
    slug: row.slug,
    description_th: row.description_th ?? null,
    description_en: row.description_en ?? null,
    location: row.location ?? null,
    cover_image:
      row.cover_image ?? "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=75",
    duration: row.duration ?? null,
    start_time: row.start_time ?? null,
    end_time: row.end_time ?? null,
    pickup_available: row.pickup_available ?? true,
    pickup_info: row.pickup_info ?? null,
    meeting_point: row.meeting_point ?? null,
    rating: Number(row.rating ?? 0),
    review_count: row.review_count ?? 0,
    base_price: row.base_price ?? 0,
    featured: row.featured ?? false,
    popular: row.popular ?? false,
    active: row.active ?? true,
    badge: row.badge ?? null,
  };
}

function normalizePackage(row: Record<string, any>): Package {
  return {
    id: row.id,
    tour_id: row.tour_id,
    name_th: row.name_th,
    name_en: row.name_en ?? row.name_th,
    description_th: row.description_th ?? null,
    adult_price: row.adult_price ?? 0,
    child_price: row.child_price ?? 0,
    infant_price: row.infant_price ?? 0,
    capacity: row.capacity ?? 0,
    active: row.active ?? true,
    payment_link: row.payment_link ?? null,
  };
}

export async function getAllTours(): Promise<Tour[]> {
  if (!hasSupabaseEnv()) return TOURS;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return TOURS;
    return data.map(normalizeTour);
  } catch {
    return TOURS;
  }
}

export async function getPopularTours(): Promise<Tour[]> {
  const all = await getAllTours();
  const popular = all.filter((t) => t.popular);
  return popular.length > 0 ? popular : all.slice(0, 4);
}

export async function getTourBySlug(
  slug: string
): Promise<{ tour: Tour; gallery: string[]; packages: Package[] } | null> {
  if (!hasSupabaseEnv()) {
    const demo = TOURS.find((t) => t.slug === slug);
    return demo ? { tour: demo, gallery: [], packages: [] } : null;
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error || !data) {
      const demo = TOURS.find((t) => t.slug === slug);
      return demo ? { tour: demo, gallery: [], packages: [] } : null;
    }

    const [{ data: images }, { data: packages }] = await Promise.all([
      supabase
        .from("tour_images")
        .select("image_url")
        .eq("tour_id", data.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("packages")
        .select("*")
        .eq("tour_id", data.id)
        .eq("active", true)
        .order("adult_price", { ascending: true }),
    ]);

    return {
      tour: normalizeTour(data),
      gallery: (images ?? []).map((i: { image_url: string }) => i.image_url),
      packages: (packages ?? []).map(normalizePackage),
    };
  } catch {
    const demo = TOURS.find((t) => t.slug === slug);
    return demo ? { tour: demo, gallery: [], packages: [] } : null;
  }
}
