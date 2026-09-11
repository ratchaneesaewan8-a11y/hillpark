import { createClient } from "@/lib/supabase/server";
import { saveCategory, deleteCategory } from "./actions";
import { Plus, Trash2 } from "lucide-react";

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

      {/* ตารางหมวดหมู่ */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left text-brand-text/60">
            <tr>
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">slug</th>
              <th className="px-4 py-3">ลำดับ</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((c) => (
              <tr key={c.id} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium">{c.name_th}</td>
                <td className="px-4 py-3 text-brand-text/60">{c.slug}</td>
                <td className="px-4 py-3">{c.sort_order}</td>
                <td className="px-4 py-3">
                  {c.active ? <span className="text-brand-teal">แสดง</span> : <span className="text-brand-text/40">ซ่อน</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-red-500 hover:text-red-700" title="ลบ"><Trash2 size={16} /></button>
                  </form>
                </td>
              </tr>
            ))}
            {(!categories || categories.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-text/50">ยังไม่มีหมวดหมู่</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
