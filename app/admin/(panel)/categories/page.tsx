import { createClient } from "@/lib/supabase/server";
import { saveCategory, deleteCategory } from "./actions";
import { ChevronDown, Plus } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-text">หมวดหมู่</h1>

      {/* ฟอร์มเพิ่มหมวดหมู่ */}
      <form action={saveCategory} className="mb-8 grid gap-3 rounded-2xl bg-white p-5 shadow-soft sm:grid-cols-2 lg:grid-cols-5">
        <input name="name_th" required placeholder="ชื่อ (ไทย)" className="input" />
        <input name="name_en" placeholder="ชื่อ (อังกฤษ)" className="input" />
        <input name="slug" required placeholder="slug เช่น island-tours" className="input" />
        <input name="image" placeholder="URL รูป (ไม่บังคับ)" className="input" />
        <input name="sort_order" type="number" defaultValue={0} placeholder="ลำดับ" className="input" />
        <label className="flex items-center gap-2 text-sm text-brand-text/70">
          <input type="checkbox" name="active" defaultChecked /> แสดงผล
        </label>
        <button className="btn-primary sm:col-span-2 lg:col-span-1"><Plus size={18} /> เพิ่มหมวดหมู่</button>
      </form>

      <section className="mb-8 rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="mb-1 text-lg font-bold text-brand-text">แก้ไขรูปและข้อมูลหมวดหมู่</h2>
        <p className="mb-5 text-sm text-brand-text/55">รูปที่อัปโหลดในแต่ละการ์ดจะแสดงเป็นรูปวงกลมบนหน้าแรกทันทีหลังบันทึก</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(categories ?? []).map((category) => (
            <details key={category.id} className="group overflow-hidden rounded-2xl border border-black/10 bg-white open:border-brand-orange/35 open:shadow-soft">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-3 marker:hidden">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-bg">
                  {category.image ? <img src={category.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-brand-text/40">ไม่มีรูป</div>}
                </div>
                <div className="min-w-0 flex-1"><div className="truncate font-semibold text-brand-text">{category.name_th}</div><div className="mt-1 text-xs text-brand-text/55">{category.active ? "แสดงบนหน้าแรก" : "ซ่อนอยู่"} · ลำดับ {category.sort_order}</div></div>
                <ChevronDown size={19} className="shrink-0 text-brand-text/45 transition group-open:rotate-180" />
              </summary>
              <form action={saveCategory} className="border-t border-black/5 p-4">
                <input type="hidden" name="id" value={category.id} />
                <ImageUpload name="image" defaultValue={category.image ?? ""} label={`รูปหมวด ${category.name_th}`} />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-medium text-brand-text/70">ชื่อไทย<input name="name_th" required defaultValue={category.name_th} className="input mt-1" /></label>
                  <label className="text-xs font-medium text-brand-text/70">ชื่ออังกฤษ<input name="name_en" defaultValue={category.name_en} className="input mt-1" /></label>
                  <label className="text-xs font-medium text-brand-text/70">Slug<input name="slug" required defaultValue={category.slug} className="input mt-1" /></label>
                  <label className="text-xs font-medium text-brand-text/70">ลำดับ<input name="sort_order" type="number" defaultValue={category.sort_order} className="input mt-1" /></label>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm text-brand-text/70"><input type="checkbox" name="active" defaultChecked={category.active} /> แสดงผล</label><div className="flex gap-3"><button className="btn-primary px-4 py-2 text-sm">บันทึก</button><button type="submit" formAction={deleteCategory} formNoValidate className="text-sm font-medium text-red-500 hover:text-red-700">ลบ</button></div></div>
              </form>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
