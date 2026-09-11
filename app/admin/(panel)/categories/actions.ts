"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();

  const id = (formData.get("id") as string) || null;
  const payload = {
    name_th: formData.get("name_th") as string,
    name_en: (formData.get("name_en") as string) || "",
    slug: formData.get("slug") as string,
    image: (formData.get("image") as string) || null,
    sort_order: Number(formData.get("sort_order") || 0),
    active: formData.get("active") === "on",
  };

  if (id) {
    await supabase.from("categories").update(payload).eq("id", id);
  } else {
    await supabase.from("categories").insert(payload);
  }
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const id = formData.get("id") as string;
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}
