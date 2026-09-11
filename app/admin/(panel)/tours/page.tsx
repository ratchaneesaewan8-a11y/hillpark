import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteTour } from "./actions";
import { formatTHB } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminToursPage() {
  const supabase = createClient();
  const { data: tours } = await supabase
    .from("tours")
    .select("id, title_th, slug, base_price, active, popular")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-text">จัดการทัวร์</h1>
        <Link href="/admin/tours/new" className="btn-primary"><Plus size={18} /> เพิ่มทัวร์</Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left text-brand-text/60">
            <tr>
              <th className="px-4 py-3">ชื่อทัวร์</th>
              <th className="px-4 py-3">ราคาเริ่มต้น</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(tours ?? []).map((t) => (
              <tr key={t.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <div className="font-medium">{t.title_th}</div>
                  <div className="text-xs text-brand-text/50">/{t.slug}</div>
                </td>
                <td className="px-4 py-3">{formatTHB(t.base_price)}</td>
                <td className="px-4 py-3">
                  {t.active ? <span className="text-brand-teal">เปิด</span> : <span className="text-brand-text/40">ปิด</span>}
                  {t.popular && <span className="ml-2 rounded bg-brand-orange/10 px-1.5 py-0.5 text-xs text-brand-orange">ยอดนิยม</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/tours/${t.id}`} className="text-brand-text/60 hover:text-brand-orange" title="แก้ไข"><Pencil size={16} /></Link>
                    <form action={deleteTour}>
                      <input type="hidden" name="id" value={t.id} />
                      <button className="text-red-500 hover:text-red-700" title="ลบ"><Trash2 size={16} /></button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!tours || tours.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-brand-text/50">ยังไม่มีทัวร์ — กด “เพิ่มทัวร์” เพื่อเริ่ม</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
