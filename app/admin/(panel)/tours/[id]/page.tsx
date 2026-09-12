import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
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
            <div key={p.id} className="rounded-xl border border-black/5 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{p.name_th}</span>
                  <span className="ml-3 text-brand-text/60">
                    ราคา {formatTHB(p.adult_price)} · รับได้ {p.capacity} คน
                  </span>
                  <div className="mt-1 text-xs">
                    {p.payment_link ? (
                      <a href={p.payment_link} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">
                        {p.payment_link}
                      </a>
                    ) : (
                      <span className="text-red-500">ยังไม่ได้ใส่ลิงก์ชำระเงิน (Stripe Payment Link)</span>
                    )}
                  </div>
                </div>
                <form action={deletePackage}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="tour_id" value={tour.id} />
                  <button className="text-red-500 hover:text-red-700" title="ลบแพ็กเกจ"><Trash2 size={16} /></button>
                </form>
              </div>

              {/* ปุ่มแก้ไข -> เปิดฟอร์มแก้ไขแพ็กเกจนี้ */}
              <details className="mt-2 group">
                <summary className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-brand-orange">
                  <Pencil size={13} /> แก้ไขแพ็กเกจนี้
                </summary>
                <form action={savePackage} className="mt-3 grid gap-3 border-t border-black/5 pt-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="tour_id" value={tour.id} />
                  <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                    ชื่อแพ็กเกจ
                    <input name="name_th" required defaultValue={p.name_th} className="input" />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                    ราคา (บาท/คน)
                    <input name="adult_price" type="number" required defaultValue={p.adult_price} className="input" />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                    จำนวนที่รับ (คน/รอบ)
                    <input name="capacity" type="number" defaultValue={p.capacity} className="input" />
                  </label>
                  <label className="flex items-center gap-2 pt-5 text-sm text-brand-text/70">
                    <input type="checkbox" name="active" defaultChecked={p.active} /> ใช้งาน
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70 sm:col-span-2">
                    ลิงก์ชำระเงิน Stripe (Payment Link)
                    <input name="payment_link" type="url" defaultValue={p.payment_link ?? ""} placeholder="https://buy.stripe.com/..." className="input" />
                  </label>
                  <div className="sm:col-span-2">
                    <button className="btn-primary">บันทึกการแก้ไข</button>
                  </div>
                </form>
              </details>
            </div>
          ))}
          {(!packages || packages.length === 0) && (
            <p className="text-sm text-brand-text/50">ยังไม่มีแพ็กเกจ — เพิ่มด้านล่าง</p>
          )}
        </div>

        <form action={savePackage} className="border-t border-black/5 pt-4">
          <input type="hidden" name="tour_id" value={tour.id} />

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              ชื่อแพ็กเกจ
              <input name="name_th" required placeholder="เช่น แพ็กเกจมาตรฐาน" className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              ราคา (บาท/คน)
              <input name="adult_price" type="number" required placeholder="0" className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              จำนวนที่รับ (คน/รอบ)
              <input name="capacity" type="number" defaultValue={0} className="input" />
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-1 text-xs font-medium text-brand-text/70">
            ลิงก์ชำระเงิน Stripe (Payment Link)
            <input
              name="payment_link"
              type="url"
              placeholder="https://buy.stripe.com/..."
              className="input"
            />
            <span className="text-[11px] font-normal text-brand-text/45">
              วางลิงก์จาก Stripe → ปุ่ม "จองเลย" ในหน้าลูกค้าจะพาไปจ่ายเงินที่ลิงก์นี้ (เว้นว่างได้ถ้ายังไม่มี)
            </span>
          </label>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-brand-text/70">
              <input type="checkbox" name="active" defaultChecked /> ใช้งาน
            </label>
            <button className="btn-primary"><Plus size={18} /> เพิ่มแพ็กเกจ</button>
          </div>
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
