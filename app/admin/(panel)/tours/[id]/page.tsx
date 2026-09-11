import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TourFields } from "@/components/admin/tour-fields";
import { ImageUpload } from "@/components/admin/image-upload";
import { formatTHB } from "@/lib/utils";
import { saveTour, savePackage, deletePackage, addGalleryImage, deleteGalleryImage } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditTourPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: tour }, { data: categories }, { data: packages }, { data: images }] = await Promise.all([
    supabase.from("tours").select("*").eq("id", params.id).single(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("packages").select("*").eq("tour_id", params.id).order("adult_price"),
    supabase.from("tour_images").select("*").eq("tour_id", params.id).order("sort_order"),
  ]);

  if (!tour) return notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/tours" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-text/60 hover:text-brand-orange">
          <ArrowLeft size={16} /> กลับ
        </Link>
        <h1 className="text-2xl font-bold text-brand-text">แก้ไขทัวร์</h1>
      </div>

      {/* ข้อมูลทัวร์ */}
      <form action={saveTour} className="rounded-2xl bg-white p-6 shadow-soft">
        <TourFields tour={tour} categories={categories ?? []} />
        <div className="mt-6 flex justify-end">
          <button className="btn-primary">บันทึกการเปลี่ยนแปลง</button>
        </div>
      </form>

      {/* แพ็กเกจ + ราคา */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold text-brand-text">แพ็กเกจและราคา</h2>
        <div className="mb-5 space-y-2">
          {(packages ?? []).map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/5 px-4 py-3 text-sm">
              <div>
                <span className="font-medium">{p.name_th}</span>
                <span className="ml-3 text-brand-text/60">
                  ผู้ใหญ่ {formatTHB(p.adult_price)} · เด็ก {formatTHB(p.child_price)} · เด็กเล็ก {formatTHB(p.infant_price)} · รับได้ {p.capacity}
                </span>
              </div>
              <form action={deletePackage}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="tour_id" value={tour.id} />
                <button className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </form>
            </div>
          ))}
          {(!packages || packages.length === 0) && (
            <p className="text-sm text-brand-text/50">ยังไม่มีแพ็กเกจ — เพิ่มด้านล่าง</p>
          )}
        </div>

        <form action={savePackage} className="grid gap-3 border-t border-black/5 pt-4 sm:grid-cols-3 lg:grid-cols-6">
          <input type="hidden" name="tour_id" value={tour.id} />
          <input name="name_th" required placeholder="ชื่อแพ็กเกจ" className="input" />
          <input name="adult_price" type="number" required placeholder="ราคาผู้ใหญ่" className="input" />
          <input name="child_price" type="number" defaultValue={0} placeholder="ราคาเด็ก" className="input" />
          <input name="infant_price" type="number" defaultValue={0} placeholder="ราคาเด็กเล็ก" className="input" />
          <input name="capacity" type="number" defaultValue={0} placeholder="จำนวนที่รับ" className="input" />
          <label className="flex items-center gap-2 text-sm text-brand-text/70">
            <input type="checkbox" name="active" defaultChecked /> ใช้งาน
          </label>
          <button className="btn-primary sm:col-span-3 lg:col-span-1"><Plus size={18} /> เพิ่มแพ็กเกจ</button>
        </form>
      </section>

      {/* แกลเลอรีรูป */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold text-brand-text">แกลเลอรีรูปภาพ</h2>
        <div className="mb-5 flex flex-wrap gap-3">
          {(images ?? []).map((img) => (
            <div key={img.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url} alt="" className="h-24 w-32 rounded-xl object-cover" />
              <form action={deleteGalleryImage} className="absolute -right-2 -top-2">
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="tour_id" value={tour.id} />
                <button className="grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white"><Trash2 size={14} /></button>
              </form>
            </div>
          ))}
          {(!images || images.length === 0) && <p className="text-sm text-brand-text/50">ยังไม่มีรูปในแกลเลอรี</p>}
        </div>
        <form action={addGalleryImage} className="flex items-end gap-4">
          <input type="hidden" name="tour_id" value={tour.id} />
          <ImageUpload name="image_url" label="เพิ่มรูปใหม่" />
          <button className="btn-primary"><Plus size={18} /> เพิ่มลงแกลเลอรี</button>
        </form>
      </section>
    </div>
  );
}
