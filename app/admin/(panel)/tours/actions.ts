"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

// ---------- Tours ----------
export async function saveTour(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();

  const id = (formData.get("id") as string) || null;
  const payload = {
    title_th: formData.get("title_th") as string,
    title_en: (formData.get("title_en") as string) || "",
    slug: formData.get("slug") as string,
    category_id: (formData.get("category_id") as string) || null,
    description_th: (formData.get("description_th") as string) || null,
    description_en: (formData.get("description_en") as string) || null,
    location: (formData.get("location") as string) || null,
    cover_image: (formData.get("cover_image") as string) || null,
    duration: (formData.get("duration") as string) || null,
    start_time: (formData.get("start_time") as string) || null,
    end_time: (formData.get("end_time") as string) || null,
    pickup_info: (formData.get("pickup_info") as string) || null,
    meeting_point: (formData.get("meeting_point") as string) || null,
    base_price: Number(formData.get("base_price") || 0),
    badge: (formData.get("badge") as string) || null,
    featured: formData.get("featured") === "on",
    popular: formData.get("popular") === "on",
    active: formData.get("active") === "on",
  };

  if (id) {
    await supabase.from("tours").update(payload).eq("id", id);
  } else {
    const { data } = await supabase.from("tours").insert(payload).select("id").single();
    revalidatePath("/admin/tours");
    if (data?.id) redirect(`/admin/tours/${data.id}`);
  }
  revalidatePath("/admin/tours");
  redirect("/admin/tours");
}

export async function deleteTour(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  await supabase.from("tours").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/tours");
}

// ---------- Packages (ราคา adult/child/infant) ----------
export async function savePackage(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const id = (formData.get("id") as string) || null;
  const tourId = formData.get("tour_id") as string;
  const payload = {
    tour_id: tourId,
    name_th: formData.get("name_th") as string,
    name_en: (formData.get("name_en") as string) || "",
    adult_price: Number(formData.get("adult_price") || 0),
    child_price: Number(formData.get("child_price") || 0),
    infant_price: Number(formData.get("infant_price") || 0),
    capacity: Number(formData.get("capacity") || 0),
    payment_link: (formData.get("payment_link") as string) || null,
    active: formData.get("active") === "on",
  };
  const { error } = id
    ? await supabase.from("packages").update(payload).eq("id", id)
    : await supabase.from("packages").insert(payload);

  if (error) {
    // แสดง error ให้เห็นชัด (เช่น ยังไม่ได้สร้างคอลัมน์ payment_link -> ต้องรัน supabase/add-payment-link.sql)
    throw new Error(`บันทึกแพ็กเกจไม่สำเร็จ: ${error.message}`);
  }
  revalidatePath(`/admin/tours/${tourId}`);
  revalidatePath("/tours", "layout");
}

export async function deletePackage(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const tourId = formData.get("tour_id") as string;
  await supabase.from("packages").delete().eq("id", formData.get("id") as string);
  revalidatePath(`/admin/tours/${tourId}`);
}

// ---------- Gallery images ----------
export async function addGalleryImage(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const tourId = formData.get("tour_id") as string;
  const url = formData.get("image_url") as string;
  if (url) await supabase.from("tour_images").insert({ tour_id: tourId, image_url: url });
  revalidatePath(`/admin/tours/${tourId}`);
}

export async function deleteGalleryImage(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const tourId = formData.get("tour_id") as string;
  await supabase.from("tour_images").delete().eq("id", formData.get("id") as string);
  revalidatePath(`/admin/tours/${tourId}`);
}

// ---------- เปิด/ปิดทัวร์ (สวิตช์ในหน้ารายการทัวร์) ----------
export async function setTourActive(id: string, active: boolean) {
  await requireAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("tours").update({ active }).eq("id", id);
  if (error) throw new Error(`เปลี่ยนสถานะทัวร์ไม่สำเร็จ: ${error.message}`);
  revalidatePath("/admin/tours");
  revalidatePath("/");
  revalidatePath("/tours", "layout");
}
